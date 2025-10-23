import React from 'react';
import { useNavigate } from 'react-router-dom';

function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } });
  };

  const handleRegister = (role) => {
    navigate('/register', { state: { role } });
  };

  return (
    <div className="gradient-bg role-selection">
      <h1>🎓 AuthenTrack 2.0</h1>
      <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '40px' }}>
        Select Your Role to Continue
      </h2>
      <div className="role-grid">
        {/* Student Card */}
        <div className="role-card">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍🎓</div>
          <h3>Student</h3>
          <p>Mark attendance and view your records</p>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn"
              onClick={() => handleRoleSelect('student')}
              style={{ width: '100%' }}
            >
              🔐 Login
            </button>
            <button 
              className="btn btn-success"
              onClick={() => handleRegister('student')}
              style={{ width: '100%' }}
            >
              📝 Register
            </button>
          </div>
        </div>

        {/* Teacher Card */}
        <div className="role-card">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍🏫</div>
          <h3>Teacher</h3>
          <p>Manage classes and track attendance</p>
          <button 
            className="btn"
            onClick={() => handleRoleSelect('teacher')}
            style={{ width: '100%', marginTop: '20px' }}
          >
            🔐 Login
          </button>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            Teachers cannot self-register. Contact your HOD.
          </p>
        </div>

        {/* HOD Card */}
        <div className="role-card">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍💼</div>
          <h3>HOD</h3>
          <p>Department administration and oversight</p>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn"
              onClick={() => handleRoleSelect('hod')}
              style={{ width: '100%' }}
            >
              🔐 Login
            </button>
            <button 
              className="btn btn-success"
              onClick={() => handleRegister('hod')}
              style={{ width: '100%' }}
            >
              📝 Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;