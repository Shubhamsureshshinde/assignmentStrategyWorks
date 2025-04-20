import React from 'react';

const ParticipantList = ({ classroom }) => {
  return (
    <div className="participant-list">
      <div>
        <h3>Teachers</h3>
        {classroom.teachers && classroom.teachers.length > 0 ? (
          <ul>
            {classroom.teachers.map(teacher => (
              <li key={teacher._id} className="participant-item">
                <strong>{teacher.name}</strong>
                <div><small>{teacher.email}</small></div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No teachers present</p>
        )}
      </div>
      
      <div style={{ marginTop: '1.5rem' }}>
        <h3>Students</h3>
        {classroom.students && classroom.students.length > 0 ? (
          <ul>
            {classroom.students.map(student => (
              <li key={student._id} className="participant-item">
                <strong>{student.name}</strong>
                <div><small>{student.email}</small></div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No students present</p>
        )}
      </div>
    </div>
  );
};

export default ParticipantList;