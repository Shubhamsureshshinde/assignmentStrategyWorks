const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const classroomController = require('../controllers/classRoomController');
const auth = require('../middleWare/auth');


router.post(
  '/',
  [
    auth,
    check('name', 'Name is required').not().isEmpty()
  ],
  classroomController.createClassroom
);


router.get('/', auth, classroomController.getClassrooms);


router.get('/:id', auth, classroomController.getClassroomById);

module.exports = router;
