import React from 'react';
import { useNavigate } from 'react-router-dom';

function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } });
  };

  return (
    <div className="gradient-bg role-selection">
      <h1>🎓 AuthenTrack 2.0</h1>
      <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '40px' }}>
        Select Your Role to Continue
      </h2>
      <div className="role-grid">
        <div className="role-card" onClick={() => handleRoleSelect('student')}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍🎓</div>
          <h3>Student</h3>
          <p>Mark attendance and view your records</p>
        </div>
        <div className="role-card" onClick={() => handleRoleSelect('teacher')}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍🏫</div>
          <h3>Teacher</h3>
          <p>Manage classes and track attendance</p>
        </div>
        <div className="role-card" onClick={() => handleRoleSelect('hod')}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍💼</div>
          <h3>HOD</h3>
          <p>Department administration and oversight</p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;