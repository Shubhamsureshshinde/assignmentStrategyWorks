const Classroom = require('../models/Classroom');
const ClassroomLog = require('../models/ClassroomLog');
const User = require('../models/User');

const handleClassroomEvents = (io, socket) => {
  socket.on('joinClassroom', async ({ classroomId, userId }) => {
    try {
      const user = await User.findById(userId);
      const classroom = await Classroom.findById(classroomId);
      
      if (!classroom) {
        return socket.emit('error', { message: 'Classroom not found' });
      }

      // Join socket room
      socket.join(classroomId);
      
      // Handle student access control
      if (user.role === 'student') {
        if (!classroom.isActive) {
          return socket.emit('error', { message: 'Class has not started yet' });
        }
        
        // Add student to classroom if not already there
        if (!classroom.students.includes(userId)) {
          classroom.students.push(userId);
          await classroom.save();
        }
      } else if (user.role === 'teacher') {
        // Add teacher to classroom if not already there
        if (!classroom.teachers.includes(userId)) {
          classroom.teachers.push(userId);
          await classroom.save();
        }
      }

      // Log the entry event
      const log = new ClassroomLog({
        classroom: classroomId,
        eventType: 'enter',
        user: userId,
        role: user.role
      });
      await log.save();

      // Emit updated classroom data to all users in the room
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

      // Leave socket room
      socket.leave(classroomId);
      
      // Remove user from classroom lists
      if (user.role === 'student') {
        classroom.students = classroom.students.filter(id => id.toString() !== userId);
      } else if (user.role === 'teacher') {
        classroom.teachers = classroom.teachers.filter(id => id.toString() !== userId);
      }
      
      await classroom.save();

      // Log the exit event
      const log = new ClassroomLog({
        classroom: classroomId,
        eventType: 'exit',
        user: userId,
        role: user.role
      });
      await log.save();

      // Emit updated classroom data to all users in the room
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
    console.log('start class is called' , 'and event is handled==========>>>>>>>')
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