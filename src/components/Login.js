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

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

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

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <h2>🔐 Login as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Select Role:</label>
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
            <label>Full Name:</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number (Password):</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '15px' }}>
              {error}
            </div>
          )}
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'transparent', color: '#667eea', textDecoration: 'underline' }}
          >
            ← Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;