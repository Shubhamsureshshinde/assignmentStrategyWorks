const { validationResult } = require('express-validator');
const Classroom = require('../models/Classroom');
const User = require('../models/User');

exports.createClassroom = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    if (user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Only teachers can create classrooms' });
    }

    const newClassroom = new Classroom({
      name,
      creator: req.user.id,
      teachers: [req.user.id]
    });

    const classroom = await newClassroom.save();
    res.json(classroom);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find().populate('creator', ['name', 'email']);
    res.json(classrooms);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('creator', ['name', 'email'])
      .populate('teachers', ['name', 'email'])
      .populate('students', ['name', 'email']);
    
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }

    res.json(classroom);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    res.status(500).send('Server error');
  }
};
