import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import { ClassroomContext } from '../../Context/ClassroomContext';
import ParticipantList from './participantList';

const StudentView = () => {
  const { user } = useContext(AuthContext);
  const { 
    classrooms, 
    currentClassroom, 
    loading, 
    error, 
    fetchClassrooms, 
    getClassroomById, 
    joinClassroom,
    leaveClassroom
  } = useContext(ClassroomContext);
  
  const [status, setStatus] = useState('');
  const [leaveRoom ,setLeaveRoom] = useState(false)
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

  const handleJoinClassroom = (classroomId) => {
    navigate(`/classroom/${classroomId}`);
  };

  const handleLeaveClassroom = () => {
    console.log(currentClassroom , 'called current Classroom')
    if (currentClassroom._id) {
      leaveClassroom(currentClassroom._id);
      console.log( 'yes we are called')
      navigate('/');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!id && !currentClassroom) {
    return (
      <div className="container">
        <h1>Student Dashboard</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        {status && <div className="alert alert-info">{status}</div>}
        
        <h2>Available Classrooms</h2>
        {classrooms.length === 0 ? (
          <p>No classrooms available</p>
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
                  onClick={() => handleJoinClassroom(classroom._id)}
                  className="btn btn-primary"
                  disabled={!classroom.isActive}
                >
                  {classroom.isActive ? 'Join' : 'Not Started Yet'}
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
      
      <div className="classroom-header">
        <h1>{currentClassroom?.name}</h1>
        <p>
          Status: 
          <span className={currentClassroom?.isActive ? 'status-active' : 'status-inactive'}>
            {currentClassroom?.isActive ? ' Active' : ' Inactive'}
          </span>
        </p>
        <button onClick={handleLeaveClassroom} className="btn btn-danger">
          Leave Classroom
        </button>
      </div>
      
      <div className="classroom-content">
        <div className="classroom-main">
          <div className="card">
            <div className="card-header">Classroom Content</div>
            <div className="card-body">
              {currentClassroom?.isActive ? (
                <div>
                  <p>Welcome to the virtual classroom!</p>
                  <p>The class is now in session. You can interact with your teacher and fellow students.</p>
                </div>
              ) : (
                <div>
                  <p>The class has not started yet.</p>
                  <p>Please wait for the teacher to start the class session.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="classroom-sidebar">
          {console.log(currentClassroom , 'currentClassroom=========>>>>>...')}
          {currentClassroom && (
            <ParticipantList classroom={currentClassroom} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentView;