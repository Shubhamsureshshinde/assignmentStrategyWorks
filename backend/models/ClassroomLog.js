const mongoose = require('mongoose');

const ClassroomLogSchema = new mongoose.Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'classroom',
    required: true
  },
  eventType: {
    type: String,
    enum: ['enter', 'exit', 'start', 'end'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  role: {
    type: String,
    enum: ['student', 'teacher']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = ClassroomLog = mongoose.model('classroomLog', ClassroomLogSchema);
