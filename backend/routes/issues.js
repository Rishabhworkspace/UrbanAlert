const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../utils/cloudinary');
const { analyzeIssueWithAI } = require('../utils/ai');

// Helper: wrap multer middleware so errors are caught in the handler, not globally
const handleFileUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    upload.single('photo')(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// POST /api/issues
// Create an issue (Citizen only)
router.post('/', auth, async (req, res) => {
  try {
    // Step 1: Process file upload via multer (memory storage)
    try {
      await handleFileUpload(req, res);
    } catch (uploadErr) {
      console.error('Multer file processing error:', uploadErr);
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      if (uploadErr.message === 'Only image files are allowed') {
        return res.status(400).json({ message: uploadErr.message });
      }
      return res.status(400).json({ message: 'File upload failed: ' + uploadErr.message });
    }

    // Step 2: Role check
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Only citizens can report issues' });
    }

    // Step 3: Extract and validate fields
    const { title, description, category, latitude, longitude, address } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    // Step 4: Upload photo to Cloudinary if file was provided
    let photoUrl = null;
    if (req.file) {
      try {
        console.log('Uploading photo to Cloudinary...');
        const cloudResult = await uploadToCloudinary(req.file.buffer);
        photoUrl = cloudResult.secure_url;
        console.log('Photo uploaded successfully:', photoUrl);
      } catch (cloudErr) {
        console.error('Cloudinary upload failed (continuing without photo):', cloudErr.message);
        // Don't fail the entire submission — save the issue without the photo
      }
    }

    // Step 5: Check for duplicate issue
    let duplicateIssue = null;
    try {
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          duplicateIssue = await Issue.findOne({
            category,
            status: { $ne: 'resolved' },
            location: {
              $near: {
                $geometry: { type: 'Point', coordinates: [lng, lat] },
                $maxDistance: 1000 // Increased to 1km to catch same-area reports
              }
            }
          });
        }
      } 
      
      // If no geographic duplicate was found, try matching by exact title or exact address string
      if (!duplicateIssue) {
        // Escape special characters for regex safety
        const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const orConditions = [{ title: { $regex: new RegExp(`^${safeTitle}$`, 'i') } }];
        
        if (address) {
          const safeAddress = address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          orConditions.push({ address: { $regex: new RegExp(`^${safeAddress}$`, 'i') } });
        }

        duplicateIssue = await Issue.findOne({
          category,
          status: { $ne: 'resolved' },
          $or: orConditions
        });
      }
    } catch (err) {
      console.error('Duplicate check failed:', err.message);
    }

    if (duplicateIssue) {
      // Add vote if not already voted
      if (!duplicateIssue.upvotedBy.includes(req.user.id)) {
        duplicateIssue.upvotedBy.push(req.user.id);
        duplicateIssue.upvotes = duplicateIssue.upvotedBy.length;
        
        // Adjust priority based on votes
        if (duplicateIssue.upvotes >= 10) duplicateIssue.priority = 'high';
        else if (duplicateIssue.upvotes >= 5) duplicateIssue.priority = 'medium';
        else duplicateIssue.priority = 'low';

        await duplicateIssue.save();
      }
      return res.status(200).json(duplicateIssue);
    }

    // Step 6: Run AI analysis (non-blocking — fallback on failure)
    let aiAnalysis = { suggestedPriority: 'low', autoTags: [], confidenceScore: 0.5 };
    try {
      console.log('Running AI analysis...');
      aiAnalysis = await analyzeIssueWithAI(title, description, category);
      console.log('AI analysis complete:', JSON.stringify(aiAnalysis));
    } catch (aiErr) {
      console.error('AI analysis failed (using defaults):', aiErr.message);
    }

    // Step 7: Build issue document
    const issueData = {
      title,
      description,
      category,
      address: address || '',
      reportedBy: req.user.id,
      photoUrl,
      aiAnalysis,
      priority: aiAnalysis.suggestedPriority || 'low',
      statusHistory: [{
        status: 'reported',
        changedBy: req.user.id,
        changedAt: new Date(),
        note: 'Issue reported by citizen'
      }]
    };

    // Only set location if GPS coordinates are provided
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        issueData.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
    }

    // Step 8: Save to MongoDB
    const issue = new Issue(issueData);
    await issue.save();
    console.log('Issue saved successfully:', issue._id);

    res.status(201).json(issue);
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ message: 'Failed to create issue: ' + (err.message || 'Unknown error') });
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

    const issues = await Issue.find({ 
      $or: [
        { reportedBy: req.user.id },
        { upvotedBy: req.user.id }
      ]
    })
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .populate('upvotedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error('My reports error:', err.message);
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
      .populate('upvotedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(issues);
  } catch (err) {
    console.error('All issues error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/issues/community
// Get all reported issues for citizens (without sensitive data)
router.get('/community', auth, async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Citizen authorization required' });
    }

    const issues = await Issue.find()
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .populate('upvotedBy', 'name')
      .sort({ createdAt: -1 });
    
    // Strip government notes for privacy
    const communityIssues = issues.map(issue => {
      const issueObj = issue.toObject();
      if (issueObj.reportedBy._id.toString() !== req.user.id) {
        delete issueObj.governmentNotes;
      }
      return issueObj;
    });

    res.json(communityIssues);
  } catch (err) {
    console.error('Community issues error:', err.message);
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
      .populate('upvotedBy', 'name email')
      .populate('statusHistory.changedBy', 'name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Prepare response object
    const issueResponse = issue.toObject();

    // Hide government notes from citizens unless it's their own issue
    if (req.user.role === 'citizen' && issue.reportedBy._id.toString() !== req.user.id) {
      delete issueResponse.governmentNotes;
    }

    res.json(issueResponse);
  } catch (err) {
    console.error('Get issue error:', err.message);
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
    console.error('Update status error:', err.message);
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

    // Adjust priority based on votes
    if (issue.upvotes >= 10) issue.priority = 'high';
    else if (issue.upvotes >= 5) issue.priority = 'medium';
    else issue.priority = 'low';

    issue.updatedAt = new Date();
    await issue.save();

    res.json({ upvotes: issue.upvotes, upvotedBy: issue.upvotedBy });
  } catch (err) {
    console.error('Upvote error:', err.message);
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
    console.error('Delete error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
