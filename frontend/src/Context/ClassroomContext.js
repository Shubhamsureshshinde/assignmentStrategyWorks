import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../Services/api';
import { socket, connectSocket } from '../Services/socket';
import {useNavigate} from 'react-router-dom'

export const ClassroomContext = createContext();

export const ClassroomProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  
  const [classrooms, setClassrooms] = useState([]);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

console.log(socketConnected ,'check SocketConnected-----------------')
  useEffect(() => {
    if (user && token && !socketConnected) {
      connectSocket(token);
      setSocketConnected(true);
    }
  }, [user, token, socketConnected]);

  useEffect(() => {
    console.log(socketConnected ,'socketConnected in the use effect')
    if (socketConnected) {
        console.log(socketConnected,'socketConnected ,socketConnected in the use effect2222',currentClassroom)
      socket.on('classroomUpdate', (updatedClassroom) => {
        if (currentClassroom && updatedClassroom._id === currentClassroom._id) {
          setCurrentClassroom(updatedClassroom);
        }
        setClassrooms(prevClassrooms => 
          prevClassrooms.map(c => 
            c._id === updatedClassroom._id ? updatedClassroom : c
          )
        );
      });

      socket.on('classStarted', () => {
        if (currentClassroom) {
          setCurrentClassroom(prev => ({ ...prev, isActive: true }));
        }
      });

      socket.on('classEnded', () => {
        if (currentClassroom) {
          setCurrentClassroom(prev => ({ ...prev, isActive: false }));
        }
      });

      socket.on('error', (error) => {
        setError(error.message);
      });
    }

    return () => {
      if (socketConnected) {
        socket.off('classroomUpdate');
        socket.off('classStarted');
        socket.off('classEnded');
        socket.off('error');
      }
    };
  }, [socketConnected, currentClassroom]);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/classrooms');
      setClassrooms(data);
      console.log(data ,'data for the current classRoom')
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch classrooms');
      setLoading(false);
    }
  };

  const createClassroom = async (name) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.post('/classrooms', { name });
      setClassrooms([...classrooms, data]);
      setLoading(false);
      return data;
    } catch (err) {
      setError('Failed to create classroom');
      setLoading(false);
      throw err;
    }
  };

  const getClassroomById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/classrooms/${id}`);
      setCurrentClassroom(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError('Failed to fetch classroom details');
      setLoading(false);
      throw err;
    }
  };

  const joinClassroom = (classroomId ,data) => {
    if (user && socket.connected) {
      socket.emit('joinClassroom', { classroomId, userId: user._id });
      setCurrentClassroom(data);

    }
  };

  const leaveClassroom = (classroomId) => {
    console.log('leaveRoomFuntion from the context is called')
    if (user && socket.connected) {
        socket.emit('leaveClassroom', { classroomId, userId: user._id });
        setCurrentClassroom(null);
    }
  };

  const startClass = (classroomId) => {
    console.log('start class' ,user ,'user==>>' ,socket.connected)
    if (user && user.role === 'teacher' && socket.connected) {
        console.log('startClass' ,classroomId , 'classroomId')
      socket.emit('startClass', { classroomId, userId: user._id });
    }
  };

  const endClass = (classroomId) => {
    if (user && user.role === 'teacher' && socket.connected) {
      socket.emit('endClass', { classroomId, userId: user._id });
    }
  };

  const getClassroomReport = async (classroomId) => {
    try {
      setLoading(true);
      const data = await api.get(`/reports/classroom/${'680468ea974088499863d186'}`);
      setLoading(false);
      return data;
    } catch (err) {
      setError('Failed to fetch classroom reports');
      setLoading(false);
      throw err;
    }
  };

  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        currentClassroom,
        loading,
        error,
        fetchClassrooms,
        createClassroom,
        getClassroomById,
        joinClassroom,
        leaveClassroom,
        startClass,
        endClass,
        getClassroomReport,
        socketConnected
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};