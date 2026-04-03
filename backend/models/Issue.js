const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['reported', 'in_progress', 'resolved'], 
    default: 'reported' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  photoUrl: { type: String }, // Cloudinary URL
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false } // [longitude, latitude]
  },
  address: { type: String },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  governmentNotes: { type: String, default: '' },

  // Status change audit trail
  statusHistory: [{
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],

  // AI Analyzed Fields
  aiAnalysis: {
    suggestedPriority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    autoTags: [String],
    confidenceScore: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Geospatial index for location-based queries
issueSchema.index({ location: '2dsphere' });
// Compound indexes for efficient dashboard queries
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ reportedBy: 1, createdAt: -1 });
issueSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Issue', issueSchema);
