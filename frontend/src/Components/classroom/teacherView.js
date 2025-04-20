import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import { ClassroomContext } from '../../Context/ClassroomContext';
import ParticipantList from './participantList';
import ClassroomControls from './classRoomControls';

const TeacherView = () => {
  const { user } = useContext(AuthContext);
  const { 
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
    endClass
  } = useContext(ClassroomContext);
  
  const [formData, setFormData] = useState({ name: '' });
  const [status, setStatus] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (id) {
      getClassroomById(id).then(() => {
        joinClassroom(id);
      }).catch(err => {
        setStatus('Failed to join classroom');
      });
    }
  }, [id]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateClassroom = async e => {
    e.preventDefault();
    
    if (formData.name.trim() === '') {
      setStatus('Classroom name is required');
      return;
    }
    
    try {
      const classroom = await createClassroom(formData.name);
      setFormData({ name: '' });
      setStatus('Classroom created successfully');
      
      navigate(`/classroom/${classroom._id}`);
    } catch (err) {
      setStatus('Failed to create classroom');
    }
  };

  
  const handleSelectClassroom = (classroomId) => {
    navigate(`/classroom/${classroomId}`);
  };

  const handleLeaveClassroom = () => {
    if (currentClassroom) {
      leaveClassroom(currentClassroom._id);
      navigate('/teacher/dashboard');
    }
  };

  const handleStartClass = () => {
    console.log('handle start class is called' , currentClassroom)
    if (currentClassroom) {
      startClass(currentClassroom._id);
    }
  };

  const handleEndClass = () => {
    if (currentClassroom) {
      endClass(currentClassroom._id);
    }
  };

  const viewClassroomReport = () => {
    // if (currentClassroom) {
      navigate(`/reports/classroom/680468ea974088499863d186`);
    // }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!id && !currentClassroom) {
    return (
      <div className="container">
        <h1>Teacher Dashboard</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        {status && <div className="alert alert-info">{status}</div>}
        
        <div className="card">
          <div className="card-header">Create New Classroom</div>
          <div className="card-body">
            <form onSubmit={handleCreateClassroom}>
              <div className="form-group">
                <label htmlFor="name">Classroom Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Classroom
              </button>
            </form>
          </div>
        </div>
        
        <h2>Your Classrooms</h2>
        {classrooms.length === 0 ? (
          <p>You have no classrooms yet</p>
        ) : (
          <div className="grid">
            {classrooms.map(classroom => (
              <div key={classroom._id} className="card">
                <h3>{classroom.name}</h3>
                <p>
                  Status: 
                  <span className={classroom.isActive ? 'status-active' : 'status-inactive'}>
                    {classroom.isActive ? ' Active' : ' Inactive'}
                  </span>
                </p>
                <button 
                  onClick={() => handleSelectClassroom(classroom._id)}
                  className="btn btn-primary"
                >
                  Enter
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="classroom-container">
      {error && <div className="alert alert-danger">{error}</div>}
      {status && <div className="alert alert-info">{status}</div>}
      
      <div className="classroom-header">
        <h1>{currentClassroom?.name}</h1>
        <p>
          Status: 
          <span className={currentClassroom?.isActive ? 'status-active' : 'status-inactive'}>
            {currentClassroom?.isActive ? ' Active' : ' Inactive'}
          </span>
        </p>
        <div>
          <button onClick={handleLeaveClassroom} className="btn btn-danger">
            Leave Classroom
          </button>
          <button onClick={viewClassroomReport} className="btn btn-secondary">
            View Reports
          </button>
        </div>
      </div>
      
      <div className="classroom-content">
        <div className="classroom-main">
          <div className="card">
            <div className="card-header">Classroom Management</div>
            <div className="card-body">
              <ClassroomControls 
                isActive={currentClassroom?.isActive}
                onStartClass={handleStartClass}
                onEndClass={handleEndClass}
              />
              
              <div style={{ marginTop: '2rem' }}>
                <h3>Teacher Instructions</h3>
                <ul>
                  <li>Start the class to allow students to join</li>
                  <li>Students can only participate when the class is active</li>
                  <li>You can end the class at any time</li>
                  <li>View reports to see class attendance records</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="classroom-sidebar">
          {currentClassroom && (
            <ParticipantList classroom={currentClassroom} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherView;