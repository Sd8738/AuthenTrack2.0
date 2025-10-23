import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function TeacherDashboard({ user }) {
  const navigate = useNavigate();
  const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceEnabled, setAttendanceEnabled] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  
  // Filters
  const [searchStudent, setSearchStudent] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterLecture, setFilterLecture] = useState('');
  
  // Lecture form
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [lectureNumber, setLectureNumber] = useState('');
  const [lectureDate, setLectureDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    fetchTeacherData();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, searchStudent, filterDivision, filterClass, filterDate, filterLecture]);

  const fetchTeacherData = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      if (!currentUser.id) {
        throw new Error('Teacher ID not found');
      }

      const teacherDoc = await getDoc(doc(db, 'teachers', currentUser.id));
      if (teacherDoc.exists()) {
        const data = teacherDoc.data();
        setDivisions(data.assignedDivisions || []);
        setClasses(data.assignedClasses || []);
        setAttendanceEnabled(data.attendanceEnabled || false);
        setCurrentLecture(data.currentLecture || null);
      }

      const q = query(
        collection(db, 'attendance'),
        where('teacherId', '==', currentUser.id)
      );
      const querySnapshot = await getDocs(q);
      const records = [];
      querySnapshot.forEach((docSnap) => {
        records.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      setAttendanceRecords(records);
      generateAnalytics(records);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setErrorMessage('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    if (searchStudent) {
      filtered = filtered.filter(r => 
        r.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
        r.studentPRN.toLowerCase().includes(searchStudent.toLowerCase())
      );
    }

    if (filterDivision) {
      filtered = filtered.filter(r => r.division === filterDivision);
    }

    if (filterClass) {
      filtered = filtered.filter(r => r.class === filterClass);
    }

    if (filterDate) {
      filtered = filtered.filter(r => r.lectureDate === filterDate);
    }

    if (filterLecture) {
      filtered = filtered.filter(r => 
        r.lectureNumber.toLowerCase().includes(filterLecture.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const generateAnalytics = (records) => {
    const dateGroups = {};
    records.forEach(record => {
      const timestamp = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
      const date = timestamp.toLocaleDateString();
      if (!dateGroups[date]) {
        dateGroups[date] = 0;
      }
      dateGroups[date]++;
    });

    const analytics = Object.keys(dateGroups)
      .map(date => ({
        date,
        students: dateGroups[date]
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);

    setAnalyticsData(analytics);
  };

  const handleToggleAttendance = () => {
    if (attendanceEnabled) {
      disableAttendance();
    } else {
      setShowLectureForm(true);
    }
  };

  const enableAttendance = async () => {
    if (!lectureNumber || !lectureDate) {
      setErrorMessage('Please enter lecture number and date.');
      return;
    }

    try {
      await updateDoc(doc(db, 'teachers', currentUser.id), {
        attendanceEnabled: true,
        currentLecture: {
          number: lectureNumber,
          date: lectureDate
        }
      });
      
      setAttendanceEnabled(true);
      setCurrentLecture({ number: lectureNumber, date: lectureDate });
      setShowLectureForm(false);
      setLectureNumber('');
      setLectureDate(new Date().toISOString().split('T')[0]);
      setSuccessMessage('✅ Attendance enabled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error enabling attendance:', error);
      setErrorMessage('Failed to enable attendance: ' + error.message);
    }
  };

  const disableAttendance = async () => {
    try {
      await updateDoc(doc(db, 'teachers', currentUser.id), {
        attendanceEnabled: false,
        currentLecture: null
      });
      
      setAttendanceEnabled(false);
      setCurrentLecture(null);
      setSuccessMessage('Attendance disabled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error disabling attendance:', error);
      setErrorMessage('Failed to disable attendance: ' + error.message);
    }
  };

  const removeAttendance = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to remove this attendance record?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'attendance', attendanceId));
      setSuccessMessage('Attendance removed successfully!');
      fetchTeacherData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error removing attendance:', error);
      setErrorMessage('Failed to remove attendance: ' + error.message);
    }
  };

  const viewStudentProgress = (studentPRN) => {
    const studentRecords = attendanceRecords.filter(r => r.studentPRN === studentPRN);
    if (studentRecords.length === 0) return;

    setSelectedStudent({
      prn: studentPRN,
      name: studentRecords[0].studentName,
      records: studentRecords,
      total: studentRecords.length,
      percentage: Math.round((studentRecords.length / 60) * 100)
    });
  };

  const getAttendanceLink = (division) => {
    return `${window.location.origin}/attendance/${currentUser.id}/${division}`;
  };

  const copyLink = (division) => {
    const link = getAttendanceLink(division);
    navigator.clipboard.writeText(link);
    setSuccessMessage(`Link copied for Division ${division}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLogout = () => {
  // Clear localStorage
  localStorage.removeItem('user');
  
  // Navigate to home
  navigate('/', { replace: true });
  
  // Force reload to clear all state
  window.location.reload();
};

  const clearFilters = () => {
    setSearchStudent('');
    setFilterDivision('');
    setFilterClass('');
    setFilterDate('');
    setFilterLecture('');
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
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
              <h1>Teacher Dashboard</h1>
              <p>{currentUser.name} | {currentUser.subject} | {currentUser.department}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>

        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Records</h3>
            <div className="stat-value">{attendanceRecords.length}</div>
          </div>
          <div className="stat-card">
            <h3>Today's Attendance</h3>
            <div className="stat-value">
              {attendanceRecords.filter(r => {
                const date = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
                return date.toDateString() === new Date().toDateString();
              }).length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Status</h3>
            <div className="stat-value" style={{ fontSize: '20px' }}>
              {attendanceEnabled ? '✅ Active' : '❌ Inactive'}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>📡 Attendance Control</h3>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={handleToggleAttendance}
              className={attendanceEnabled ? 'btn btn-danger' : 'btn btn-success'}
              style={{ fontSize: '16px', padding: '15px 30px' }}
            >
              {attendanceEnabled ? '🔴 Disable Attendance' : '🟢 Enable Attendance'}
            </button>
          </div>

          {currentLecture && attendanceEnabled && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '10px' }}>
              <strong>Current Lecture:</strong> {currentLecture.number} on {currentLecture.date}
            </div>
          )}

          {showLectureForm && (
            <div className="card" style={{ marginTop: '20px', background: '#f5f5f5' }}>
              <h4>Set Lecture Details</h4>
              <div className="form-group">
                <label>Lecture Number:</label>
                <input
                  type="text"
                  value={lectureNumber}
                  onChange={(e) => setLectureNumber(e.target.value)}
                  placeholder="e.g., Lecture 5"
                />
              </div>
              <div className="form-group">
                <label>Lecture Date:</label>
                <input
                  type="date"
                  value={lectureDate}
                  onChange={(e) => setLectureDate(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={enableAttendance} className="btn btn-success">
                  Confirm & Enable
                </button>
                <button onClick={() => setShowLectureForm(false)} className="btn btn-danger">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {divisions.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h4>📎 Division Attendance Links</h4>
              {divisions.map(division => (
                <div key={division} className="link-display">
                  <span style={{ fontWeight: '600' }}>Division {division}:</span>
                  <span className="link-text">{getAttendanceLink(division)}</span>
                  <button onClick={() => copyLink(division)} className="btn">
                    📋 Copy Link
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>📊 Attendance Analytics (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#667eea" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>🔍 Filter Attendance Records</h3>
          <div className="filters">
            <input
              type="text"
              placeholder="Search student name or PRN..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
            />
            <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)}>
              <option value="">All Divisions</option>
              {divisions.map(div => <option key={div} value={div}>Division {div}</option>)}
            </select>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by lecture..."
              value={filterLecture}
              onChange={(e) => setFilterLecture(e.target.value)}
            />
            <button onClick={clearFilters} className="btn btn-warning">Clear Filters</button>
          </div>
        </div>

        <div className="card">
          <h3>📋 Attendance Records ({filteredRecords.length})</h3>
          {filteredRecords.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No records match the current filters.
            </p>
          ) : (
            <div className="attendance-list">
              {filteredRecords.map((record) => (
                <div key={record.id} className="attendance-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h4>{record.studentName}</h4>
                      <p><strong>PRN:</strong> {record.studentPRN}</p>
                      <p><strong>Class:</strong> {record.class} | <strong>Division:</strong> {record.division}</p>
                      <p><strong>Lecture:</strong> {record.lectureNumber} on {record.lectureDate}</p>
                      <p><strong>Time:</strong> {formatTimestamp(record.timestamp)}</p>
                      {record.location && (
                        <p style={{ fontSize: '12px', color: '#666' }}>
                          📍 {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button 
                        onClick={() => viewStudentProgress(record.studentPRN)}
                        className="btn"
                      >
                        📈 View Progress
                      </button>
                      <button 
                        onClick={() => removeAttendance(record.id)}
                        className="btn btn-danger"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="card" style={{ background: '#e3f2fd' }}>
            <h3>📊 Student Progress: {selectedStudent.name}</h3>
            <p><strong>PRN:</strong> {selectedStudent.prn}</p>
            <div className="stats-grid" style={{ marginTop: '20px' }}>
              <div className="stat-card">
                <h3>Total Classes</h3>
                <div className="stat-value">{selectedStudent.total}</div>
              </div>
              <div className="stat-card">
                <h3>Attendance %</h3>
                <div className="stat-value">{selectedStudent.percentage}%</div>
              </div>
            </div>
            <div style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Lecture</th>
                    <th>Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.records.map(rec => (
                    <tr key={rec.id}>
                      <td>{formatTimestamp(rec.timestamp)}</td>
                      <td>{rec.lectureNumber} ({rec.lectureDate})</td>
                      <td>{rec.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setSelectedStudent(null)} className="btn" style={{ marginTop: '15px' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;