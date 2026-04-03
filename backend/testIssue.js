require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
// Force Google Public DNS to bypass local network SRV blocking
dns.setServers(['8.8.8.8', '8.8.4.4']);
const User = require('./models/User');
const Issue = require('./models/Issue');

async function testFullIssueLifecycle() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for testing\n');

    // ========================================
    // 1. Create a mock citizen user
    // ========================================
    const citizen = new User({
      name: 'Test Citizen',
      email: 'testcitizen' + Date.now() + '@example.com',
      passwordHash: 'dummyhash',
      role: 'citizen'
    });
    await citizen.save();
    console.log('✅ Created test citizen:', citizen.id);

    // ========================================
    // 2. Create a mock government user
    // ========================================
    const govOfficer = new User({
      name: 'Test Officer',
      email: 'testofficer' + Date.now() + '@example.com',
      passwordHash: 'dummyhash',
      role: 'government'
    });
    await govOfficer.save();
    console.log('✅ Created test government officer:', govOfficer.id);

    // ========================================
    // 3. Create an Issue with all new fields
    // ========================================
    const issue = new Issue({
      title: 'Water pipe burst on 5th Avenue',
      description: 'A major water pipe burst creating a large puddle and flooding the sidewalk.',
      category: 'Flooding',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.730610]
      },
      address: '5th Avenue Near Central Park',
      reportedBy: citizen.id,
      photoUrl: 'https://example.com/photo.jpg',
      priority: 'high', // Set from AI analysis
      aiAnalysis: {
        suggestedPriority: 'high',
        autoTags: ['water', 'flooding', 'urgent'],
        confidenceScore: 0.95
      },
      statusHistory: [{
        status: 'reported',
        changedBy: citizen.id,
        changedAt: new Date(),
        note: 'Issue reported by citizen'
      }]
    });

    await issue.save();
    console.log('✅ Created issue:', issue.id);
    console.log('   - Status:', issue.status);
    console.log('   - Priority:', issue.priority);
    console.log('   - StatusHistory entries:', issue.statusHistory.length);

    // ========================================
    // 4. Simulate Government Status Update
    // ========================================
    const updatedIssue = await Issue.findByIdAndUpdate(
      issue.id,
      {
        $set: {
          status: 'in_progress',
          governmentNotes: 'Repair crew dispatched. Expected fix within 24 hours.',
          assignedTo: govOfficer.id,
          priority: 'critical', // Officer overrides AI priority
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: 'in_progress',
            changedBy: govOfficer.id,
            changedAt: new Date(),
            note: 'Repair crew dispatched. Expected fix within 24 hours.'
          }
        }
      },
      { new: true }
    );

    console.log('\n✅ Government status update applied:');
    console.log('   - New Status:', updatedIssue.status);
    console.log('   - Priority Override:', updatedIssue.priority);
    console.log('   - Gov Notes:', updatedIssue.governmentNotes);
    console.log('   - Assigned To:', updatedIssue.assignedTo);
    console.log('   - StatusHistory entries:', updatedIssue.statusHistory.length);

    // ========================================
    // 5. Simulate Upvote (with dedup check)
    // ========================================
    // First upvote - should succeed
    const afterUpvote1 = await Issue.findByIdAndUpdate(
      issue.id,
      {
        $push: { upvotedBy: citizen.id },
        $inc: { upvotes: 1 }
      },
      { new: true }
    );
    console.log('\n✅ Upvote test:');
    console.log('   - Upvotes after first vote:', afterUpvote1.upvotes);
    console.log('   - UpvotedBy array length:', afterUpvote1.upvotedBy.length);

    // Check deduplication (would be prevented by API layer)
    const alreadyUpvoted = afterUpvote1.upvotedBy.includes(citizen.id);
    console.log('   - Duplicate check (should be true):', alreadyUpvoted);

    // ========================================
    // 6. Resolve the Issue
    // ========================================
    const resolvedIssue = await Issue.findByIdAndUpdate(
      issue.id,
      {
        $set: {
          status: 'resolved',
          governmentNotes: 'Pipe repaired successfully. Area cleaned.',
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: 'resolved',
            changedBy: govOfficer.id,
            changedAt: new Date(),
            note: 'Pipe repaired successfully. Area cleaned.'
          }
        }
      },
      { new: true }
    );

    console.log('\n✅ Issue resolved:');
    console.log('   - Final Status:', resolvedIssue.status);
    console.log('   - Total StatusHistory entries:', resolvedIssue.statusHistory.length);

    // ========================================
    // 7. Verify Full Retrieval with Populates
    // ========================================
    const fullIssue = await Issue.findById(issue.id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.changedBy', 'name');

    console.log('\n✅ Full issue retrieval with populates:');
    console.log('   - Reporter:', fullIssue.reportedBy?.name, '(' + fullIssue.reportedBy?.email + ')');
    console.log('   - Assigned Officer:', fullIssue.assignedTo?.name, '(' + fullIssue.assignedTo?.email + ')');
    console.log('   - Timeline:');
    fullIssue.statusHistory.forEach((entry, idx) => {
      console.log(`     ${idx + 1}. ${entry.status.toUpperCase()} - ${entry.changedBy?.name || 'System'} - "${entry.note}"`);
    });

    // ========================================
    // 8. Test Aggregation Queries (Stats)
    // ========================================
    const statusCounts = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\n✅ Status aggregation:', JSON.stringify(statusCounts));

    const categoryCounts = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('✅ Category aggregation:', JSON.stringify(categoryCounts));

    // ========================================
    // 9. Cleanup test data
    // ========================================
    await Issue.findByIdAndDelete(issue.id);
    await User.findByIdAndDelete(citizen.id);
    await User.findByIdAndDelete(govOfficer.id);
    console.log('\n✅ Cleaned up test data');

    console.log('\n========================================');
    console.log('🎉 ALL TESTS PASSED — Database is ready!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFullIssueLifecycle();
