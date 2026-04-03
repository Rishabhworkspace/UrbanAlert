const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');
const { analyzeIssueWithAI } = require('../utils/ai');

// POST /api/issues
// Create an issue (Citizen only)
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Only citizens can report issues' });
    }

    const { title, description, category, latitude, longitude, address } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Prepare location object if GPS data provided
    let location = undefined;
    if (latitude && longitude) {
      location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    // Call Groq AI to analyze issue
    const aiAnalysis = await analyzeIssueWithAI(title, description, category);

    const issue = new Issue({
      title,
      description,
      category,
      location,
      address,
      reportedBy: req.user.id,
      photoUrl: req.file ? req.file.path : null,
      aiAnalysis,
      // Set initial priority from AI suggestion
      priority: aiAnalysis.suggestedPriority || 'medium',
      // Record initial status in history
      statusHistory: [{
        status: 'reported',
        changedBy: req.user.id,
        changedAt: new Date(),
        note: 'Issue reported by citizen'
      }]
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/issues/stats
// Dashboard statistics (Government only)
// NOTE: This must be BEFORE /:id to avoid "stats" being treated as an ID param
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'government') {
      return res.status(403).json({ message: 'Government authorization required' });
    }

    const [totalIssues, statusCounts, categoryCounts, priorityCounts] = await Promise.all([
      Issue.countDocuments(),
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Issue.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    // Transform aggregation results into key-value objects
    const byStatus = {};
    statusCounts.forEach(s => { byStatus[s._id] = s.count; });

    const byCategory = {};
    categoryCounts.forEach(c => { byCategory[c._id] = c.count; });

    const byPriority = {};
    priorityCounts.forEach(p => { byPriority[p._id] = p.count; });

    res.json({
      total: totalIssues,
      reported: byStatus.reported || 0,
      in_progress: byStatus.in_progress || 0,
      resolved: byStatus.resolved || 0,
      byCategory,
      byPriority
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/issues/my-reports
// Get logged-in citizen's reports
router.get('/my-reports', auth, async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const issues = await Issue.find({ reportedBy: req.user.id })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/issues/all
// Get all reported issues (Government only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'government') {
      return res.status(403).json({ message: 'Government authorization required to access all reports' });
    }

    const issues = await Issue.find()
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/issues/:id
// Get single issue detail (role-aware)
router.get('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.changedBy', 'name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Citizens can only view their own issues
    if (req.user.role === 'citizen' && issue.reportedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this issue' });
    }

    res.json(issue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /api/issues/:id/status
// Update issue status + notes (Government only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'government') {
      return res.status(403).json({ message: 'Government authorization required to update reports' });
    }

    const { status, governmentNotes, priority } = req.body;
    
    if (status && !['reported', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (priority && !['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Build update object
    const updateFields = {
      updatedAt: new Date(),
      assignedTo: req.user.id
    };

    if (status) {
      updateFields.status = status;
    }
    if (governmentNotes !== undefined) {
      updateFields.governmentNotes = governmentNotes;
    }
    if (priority) {
      updateFields.priority = priority;
    }

    // Push status change to history
    const historyEntry = {
      status: status || issue.status,
      changedBy: req.user.id,
      changedAt: new Date(),
      note: governmentNotes || ''
    };

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateFields,
        $push: { statusHistory: historyEntry }
      },
      { new: true }
    )
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json(updatedIssue);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /api/issues/:id/upvote
// Upvote an issue (Citizen only, one vote per user)
router.patch('/:id/upvote', auth, async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Only citizens can upvote issues' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check for duplicate upvote
    if (issue.upvotedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already upvoted this issue' });
    }

    issue.upvotedBy.push(req.user.id);
    issue.upvotes = issue.upvotedBy.length;
    issue.updatedAt = new Date();
    await issue.save();

    res.json({ upvotes: issue.upvotes, upvotedBy: issue.upvotedBy });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/issues/:id
// Delete an issue (Government only — for spam/invalid reports)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'government') {
      return res.status(403).json({ message: 'Government authorization required to delete reports' });
    }

    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
