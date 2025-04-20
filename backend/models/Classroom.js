const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = Classroom = mongoose.model('classroom', ClassroomSchema);