import React from 'react';

const ClassroomControls = ({ isActive, onStartClass, onEndClass }) => {
  console.log(onStartClass ,'onStartClass')
  return (
    <div className="classroom-controls">
      <h3>Class Controls</h3>
      
      {isActive ? (
        <div>
          <p className="status-active">Class is currently active</p>
          <button 
            onClick={onEndClass} 
            className="btn btn-danger"
          >
            End Class
          </button>
        </div>
      ) : (
        <div>
          <p className="status-inactive">Class is not active</p>
          <button 
            onClick={onStartClass} 
            className="btn btn-success"
          >
            Start Class
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassroomControls;