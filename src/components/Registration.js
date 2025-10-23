import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

function Registration() {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (role === 'teacher') {
        setError('Teacher self-registration is disabled. Please contact your HOD.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await addDoc(collection(db, 'students'), {
        ...form,
        role,
        authUid: userCredential.user.uid,
        createdAt: new Date().toISOString()
      });
      setSuccess('Registration successful!');
    } catch (error) {
      setError(error.message);
    }
  };

  if (role === 'teacher') {
    return (
      <div className="container">
        <div className="card" style={{ padding: '20px' }}>
          <h3>Teacher registration disabled</h3>
          <p>Teachers cannot register themselves. Please contact your HOD to be added and provided login credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Register as {role}</h2>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default Registration;
