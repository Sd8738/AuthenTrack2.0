import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

function HODDashboard({ user }) {
  const navigate = useNavigate();
  const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    assignedClasses: [],
    assignedDivisions: []
  });

  const [newClass, setNewClass] = useState('');
  const [newDivision, setNewDivision] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    fetchHODData();
  }, [currentUser]);

  const fetchHODData = async () => {
    setLoading(true);
    try {
      // Fetch teachers in this department
      const teachersQuery = query(
        collection(db, 'teachers'),
        where('department', '==', currentUser.department)
      );
      const teachersSnapshot = await getDocs(teachersQuery);
      const teachersList = [];
      teachersSnapshot.forEach(doc => {
        teachersList.push({ id: doc.id, ...doc.data() });
      });
      setTeachers(teachersList);

      // Fetch classes and divisions from department config
      const deptDoc = await getDocs(
        query(collection(db, 'departments'), where('name', '==', currentUser.department))
      );
      if (!deptDoc.empty) {
        const deptData = deptDoc.docs[0].data();
        setClasses(deptData.classes || []);
        setDivisions(deptData.divisions || []);
      }
    } catch (error) {
      console.error('Error fetching HOD data:', error);
      setErrorMessage('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newTeacher.name || !newTeacher.phone || !newTeacher.subject) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (newTeacher.assignedClasses.length === 0 || newTeacher.assignedDivisions.length === 0) {
      setErrorMessage('Please assign at least one class and one division.');
      return;
    }

    try {
      await addDoc(collection(db, 'teachers'), {
        name: newTeacher.name,
        phone: newTeacher.phone,
        email: newTeacher.email || '',
        subject: newTeacher.subject,
        department: currentUser.department,
        assignedClasses: newTeacher.assignedClasses,
        assignedDivisions: newTeacher.assignedDivisions,
        attendanceEnabled: false,
        currentLecture: null,
        addedBy: currentUser.id,
        addedAt: new Date().toISOString()
      });

      setSuccessMessage(`✅ Teacher ${newTeacher.name} added successfully!`);
      setNewTeacher({
        name: '',
        phone: '',
        email: '',
        subject: '',
        assignedClasses: [],
        assignedDivisions: []
      });
      fetchHODData();
    } catch (error) {
      console.error('Error adding teacher:', error);
      setErrorMessage('Failed to add teacher: ' + error.message);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClass.trim()) return;

    try {
      const deptQuery = query(
        collection(db, 'departments'),
        where('name', '==', currentUser.department)
      );
      const deptSnapshot = await getDocs(deptQuery);

      if (deptSnapshot.empty) {
        // Create department document
        await addDoc(collection(db, 'departments'), {
          name: currentUser.department,
          classes: [newClass],
          divisions: divisions
        });
      } else {
        // Update existing
        const deptDoc = deptSnapshot.docs[0];
        const currentClasses = deptDoc.data().classes || [];
        if (!currentClasses.includes(newClass)) {
          await updateDoc(doc(db, 'departments', deptDoc.id), {
            classes: [...currentClasses, newClass]
          });
        }
      }

      setClasses([...classes, newClass]);
      setNewClass('');
      setSuccessMessage(`Class ${newClass} added successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding class:', error);
      setErrorMessage('Failed to add class: ' + error.message);
    }
  };

  const handleAddDivision = async (e) => {
    e.preventDefault();
    if (!newDivision.trim()) return;

    try {
      const deptQuery = query(
        collection(db, 'departments'),
        where('name', '==', currentUser.department)
      );
      const deptSnapshot = await getDocs(deptQuery);

      if (deptSnapshot.empty) {
        await addDoc(collection(db, 'departments'), {
          name: currentUser.department,
          classes: classes,
          divisions: [newDivision]
        });
      } else {
        const deptDoc = deptSnapshot.docs[0];
        const currentDivisions = deptDoc.data().divisions || [];
        if (!currentDivisions.includes(newDivision)) {
          await updateDoc(doc(db, 'departments', deptDoc.id), {
            divisions: [...currentDivisions, newDivision]
          });
        }
      }

      setDivisions([...divisions, newDivision]);
      setNewDivision('');
      setSuccessMessage(`Division ${newDivision} added successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding division:', error);
      setErrorMessage('Failed to add division: ' + error.message);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await deleteDoc(doc(db, 'teachers', teacherId));
      setSuccessMessage('Teacher deleted successfully!');
      fetchHODData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting teacher:', error);
      setErrorMessage('Failed to delete teacher: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleClassSelection = (className) => {
    setNewTeacher(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(className)
        ? prev.assignedClasses.filter(c => c !== className)
        : [...prev.assignedClasses, className]
    }));
  };

  const toggleDivisionSelection = (divisionName) => {
    setNewTeacher(prev => ({
      ...prev,
      assignedDivisions: prev.assignedDivisions.includes(divisionName)
        ? prev.assignedDivisions.filter(d => d !== divisionName)
        : [...prev.assignedDivisions, divisionName]
    }));
  };

  if (loading) {
    return (
      <div className="gradient-bg">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="gradient-bg">
      <div className="container">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1>HOD Dashboard</h1>
              <p>{currentUser.name} | {currentUser.department} Department</p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>

        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Teachers</h3>
            <div className="stat-value">{teachers.length}</div>
          </div>
          <div className="stat-card">
            <h3>Classes</h3>
            <div className="stat-value">{classes.length}</div>
          </div>
          <div className="stat-card">
            <h3>Divisions</h3>
            <div className="stat-value">{divisions.length}</div>
          </div>
        </div>

        <div className="card">
          <h3>➕ Add New Class</h3>
          <form onSubmit={handleAddClass} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="e.g., SE, TE, BE"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-success">Add Class</button>
          </form>
          <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {classes.map(cls => (
              <span key={cls} className="class-badge">{cls}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>➕ Add New Division</h3>
          <form onSubmit={handleAddDivision} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="e.g., A, B, C"
              value={newDivision}
              onChange={(e) => setNewDivision(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-success">Add Division</button>
          </form>
          <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {divisions.map(div => (
              <span key={div} className="class-badge">{div}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>👨‍🏫 Add New Teacher</h3>
          <form onSubmit={handleAddTeacher}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Teacher's full name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number (used as password) *</label>
              <input
                type="tel"
                placeholder="Teacher's phone number"
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email (optional)</label>
              <input
                type="email"
                placeholder="Teacher's email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                placeholder="Subject taught"
                value={newTeacher.subject}
                onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Assign Classes *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {classes.map(cls => (
                  <label key={cls} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newTeacher.assignedClasses.includes(cls)}
                      onChange={() => toggleClassSelection(cls)}
                    />
                    <span>{cls}</span>
                  </label>
                ))}
              </div>
              {classes.length === 0 && <p style={{ color: '#666', fontSize: '14px' }}>Please add classes first</p>}
            </div>

            <div className="form-group">
              <label>Assign Divisions *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {divisions.map(div => (
                  <label key={div} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newTeacher.assignedDivisions.includes(div)}
                      onChange={() => toggleDivisionSelection(div)}
                    />
                    <span>{div}</span>
                  </label>
                ))}
              </div>
              {divisions.length === 0 && <p style={{ color: '#666', fontSize: '14px' }}>Please add divisions first</p>}
            </div>

            <button type="submit" className="btn btn-success" style={{ marginTop: '15px' }}>
              ➕ Add Teacher
            </button>
          </form>
        </div>

        <div className="card">
          <h3>📋 Teachers List ({teachers.length})</h3>
          {teachers.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No teachers added yet. Add your first teacher above!
            </p>
          ) : (
            <div className="teacher-list">
              {teachers.map(teacher => (
                <div key={teacher.id} className="teacher-card">
                  <h4>{teacher.name}</h4>
                  <p><strong>Subject:</strong> {teacher.subject}</p>
                  <p><strong>Phone:</strong> {teacher.phone}</p>
                  {teacher.email && <p><strong>Email:</strong> {teacher.email}</p>}
                  <p><strong>Classes:</strong> {teacher.assignedClasses?.join(', ') || 'None'}</p>
                  <p><strong>Divisions:</strong> {teacher.assignedDivisions?.join(', ') || 'None'}</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    Added: {new Date(teacher.addedAt).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => handleDeleteTeacher(teacher.id)}
                    className="btn btn-danger"
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    🗑️ Delete Teacher
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HODDashboard;