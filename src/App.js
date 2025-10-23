import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import HODDashboard from './components/HODDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route 
          path="/student-dashboard" 
          element={user?.role === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/attendance/:teacherId/:division" 
          element={<StudentDashboard user={user} />} 
        />
        <Route 
          path="/teacher-dashboard" 
          element={user?.role === 'teacher' ? <TeacherDashboard user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/hod-dashboard" 
          element={user?.role === 'hod' ? <HODDashboard user={user} /> : <Navigate to="/" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;