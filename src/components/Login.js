import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

function Login({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedRole = location.state?.role || "";

  const [role, setRole] = useState(preSelectedRole);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!role || !name || !phone) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      let colRef = null;
      if (role === "hod") colRef = collection(db, "hods");
      else if (role === "teacher") colRef = collection(db, "teachers");
      else if (role === "student") colRef = collection(db, "students");
      else {
        setError("Please select a valid role.");
        setLoading(false);
        return;
      }

      const q = query(
        colRef,
        where("name", "==", name.trim()),
        where("phone", "==", phone.trim())
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError("Login failed. Please check your name and phone number.");
        setLoading(false);
        return;
      }

      const userDoc = snapshot.docs[0];
      const userData = { 
        ...userDoc.data(), 
        id: userDoc.id, 
        role 
      };

      // Use the setUser function passed from App.js
      setUser(userData);

      // Navigate based on role
      if (role === "hod") navigate("/hod-dashboard");
      else if (role === "teacher") navigate("/teacher-dashboard");
      else navigate("/student-dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register', { state: { role: role || 'student' } });
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '20px' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <h2>🔐 Login {role && `as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Select Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">-- Select Role --</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="hod">Head of Department (HOD)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number (Password) *</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength="10"
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : '🔐 Login'}
          </button>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '15px' }}>
              {error}
            </div>
          )}
        </form>

        {(role === 'student' || role === 'hod') && (
          <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '10px' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Don't have an account?
            </p>
            <button 
              onClick={handleRegisterClick} 
              className="btn btn-success"
              style={{ width: '100%' }}
            >
              📝 Register as {role === 'student' ? 'Student' : 'HOD'}
            </button>
          </div>
        )}

        {role === 'teacher' && (
          <div className="alert alert-info" style={{ marginTop: '20px' }}>
            <strong>Note:</strong> Teachers cannot self-register. Please contact your HOD to create your account.
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'transparent', 
              color: '#667eea', 
              textDecoration: 'underline',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            ← Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;