const ClassroomLog = require('../models/ClassroomLog');
const Classroom = require('../models/Classroom');

exports.getClassroomReport = async (req, res) => {
  try {
    const { classroomId } = req.params;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }

    const logs = await ClassroomLog.find({ classroom: classroomId })
      .sort({ timestamp: 1 })
      .populate('user', ['name', 'email']);
    
    res.json(logs);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleWare/auth');


router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be either student or teacher').isIn(['student', 'teacher'])
  ],
  authController.registerUser
);


router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.loginUser
);


router.get('/', auth, authController.getUser);

module.exports = router;
