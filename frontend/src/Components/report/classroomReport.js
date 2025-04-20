import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClassroomContext } from '../../Context/ClassroomContext';

const ClassroomReport = () => {
  const { getClassroomById, getClassroomReport, loading, error } = useContext(ClassroomContext);
  
  const [classroom, setClassroom] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const classroomData = await getClassroomById('680468ea974088499863d186');
        setClassroom(classroomData);
        
        const logsData = await getClassroomReport(id);
        setLogs(logsData);
      } catch (err) {
        setStatus('Failed to load classroom report');
      }
    };
    
    loadData();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const goBack = () => {
    navigate(`/classroom/${id}`);
  };

  const getAttendanceCount = () => {
    const uniqueStudents = new Set();
    logs.forEach(log => {
      if (log.role === 'student' && log.eventType === 'enter') {
        uniqueStudents.add(log.user._id);
      }
    });
    return uniqueStudents.size;
  };

  const getClassDuration = () => {
    const startLog = logs.find(log => log.eventType === 'start');
    const endLog = logs.find(log => log.eventType === 'end');
    
    if (!startLog || !endLog) {
      return 'N/A';
    }
    
    const start = new Date(startLog.timestamp);
    const end = new Date(endLog.timestamp);
    const durationMs = end - start;
    
    const minutes = Math.floor(durationMs / 60000);
    return `${minutes} minutes`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Classroom Report</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {status && <div className="alert alert-info">{status}</div>}
      
      {classroom && (
        <div className="card">
          <div className="card-header">
            <h2>{classroom.name}</h2>
          </div>
          <div className="card-body">
            <p><strong>Creator:</strong> {classroom.creator?.name || 'N/A'}</p>
            <p><strong>Created At:</strong> {formatDate(classroom.createdAt)}</p>
            <p><strong>Status:</strong> {classroom.isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Total Students Attended:</strong> {getAttendanceCount()}</p>
            <p><strong>Last Session Duration:</strong> {getClassDuration()}</p>
            
            <button onClick={goBack} className="btn btn-primary">
              Back to Classroom
            </button>
          </div>
        </div>
      )}
      
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <h2>Activity Logs</h2>
        </div>
        <div className="card-body">
          {logs.length === 0 ? (
            <p>No activity logs found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>User</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>   
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>{formatDate(log.timestamp)}</td>
                    <td>{log.eventType}</td>
                    <td>{log.user?.name || 'System'}</td>
                    <td>{log.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomReport;