const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleWare/auth');


router.get('/classroom/:classroomId', auth, reportController.getClassroomReport);

module.exports = router;

const Classroom = require('../models/Classroom');
const ClassroomLog = require('../models/ClassroomLog');
const User = require('../models/User');

const handleClassroomEvents = (io, socket) => {
  socket.on('joinClassroom', async ({ classroomId, userId }) => {
    try {
      const user = await User.findById(userId);
      const classroom = await Classroom.findById(classroomId);
      console.log(classroom , 'this event is called')
      
      if (!classroom) {
        return socket.emit('error', { message: 'Classroom not found' });
      }

      socket.join(classroomId);
      
      if (user.role === 'student') {
        if (!classroom.isActive) {
          return socket.emit('error', { message: 'Class has not started yet' });
        }
        
        if (!classroom.students.includes(userId)) {
          classroom.students.push(userId);
          console.log(classroom ,'classroom')
          await classroom.save();
        }
      } else if (user.role === 'teacher') {
        if (!classroom.teachers.includes(userId)) {
          classroom.teachers.push(userId);
          await classroom.save();
        }
      }

      const log = new ClassroomLog({
        classroom: classroomId,
        eventType: 'enter',
        user: userId,
        role: user.role
      });
      await log.save();

      const updatedClassroom = await Classroom.findById(classroomId)
        .populate('teachers', ['name', 'email'])
        .populate('students', ['name', 'email']);
        
      io.to(classroomId).emit('classroomUpdate', updatedClassroom);
    } catch (error) {
      console.error('Join classroom error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  socket.on('leaveClassroom', async ({ classroomId, userId }) => {
    try {
      const user = await User.findById(userId);
      const classroom = await Classroom.findById(classroomId);
      
      if (!classroom) {
        return socket.emit('error', { message: 'Classroom not found' });
      }

      socket.leave(classroomId);
      
      if (user.role === 'student') {
        classroom.students = classroom.students.filter(id => id.toString() !== userId);
      } else if (user.role === 'teacher') {
        classroom.teachers = classroom.teachers.filter(id => id.toString() !== userId);
      }
      
      await classroom.save();

      const log = new ClassroomLog({
        classroom: classroomId,
        eventType: 'exit',
        user: userId,
        role: user.role
      });
      await log.save();

      const updatedClassroom = await Classroom.findById(classroomId)
        .populate('teachers', ['name', 'email'])
        .populate('students', ['name', 'email']);
        
      io.to(classroomId).emit('classroomUpdate', updatedClassroom);
    } catch (error) {
      console.error('Leave classroom error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  socket.on('startClass', async ({ classroomId, userId }) => {
    try {
      const user = await User.findById(userId);
      
      if (user.role !== 'teacher') {
        return socket.emit('error', { message: 'Only teachers can start a class' });
      }
      
      const classroom = await Classroom.findById(classroomId);
      
      if (!classroom) {
        return socket.emit('error', { message: 'Classroom not found' });
      }
      
      if (!classroom.teachers.includes(userId)) {
        return socket.emit('error', { message: 'You are not a teacher in this classroom' });
      }
      
      classroom.isActive = true;
      await classroom.save();
      
      const log = new ClassroomLog({
        classroom: classroomId,
        eventType: 'start',
        user: userId,
        role: 'teacher'
      });
      await log.save();
      
      const updatedClassroom = await Classroom.findById(classroomId)
        .populate('teachers', ['name', 'email'])
        .populate('students', ['name', 'email']);
        
      io.to(classroomId).emit('classroomUpdate', updatedClassroom);
      io.to(classroomId).emit('classStarted');
    } catch (error) {
      console.error('Start class error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  socket.on('endClass', async ({ classroomId, userId }) => {
    try {
      const user = await User.findById(userId);
      
      if (user.role !== 'teacher') {
        return socket.emit('error', { message: 'Only teachers can end a class' });
      }
      
      const classroom = await Classroom.findById(classroomId);
      
      if (!classroom) {
        return socket.emit('error', { message: 'Classroom not found' });
      }
      
      if (!classroom.teachers.includes(userId)) {
        return socket.emit('error', { message: 'You are not a teacher in this classroom' });
      }
      
      classroom.isActive = false;
      await classroom.save();
      
      const log = new ClassroomLog({
        classroom: classroomId,
        eventType: 'end',
        user: userId,
        role: 'teacher'
      });
      await log.save();
      
      const updatedClassroom = await Classroom.findById(classroomId)
        .populate('teachers', ['name', 'email'])
        .populate('students', ['name', 'email']);
        
      io.to(classroomId).emit('classroomUpdate', updatedClassroom);
      io.to(classroomId).emit('classEnded');
    } catch (error) {
      console.error('End class error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });
};

module.exports = handleClassroomEvents;