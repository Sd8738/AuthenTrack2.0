import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const { teacherId, division } = useParams();
  const webcamRef = useRef(null);
  
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [location, setLocation] = useState(null);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [lectureInfo, setLectureInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    getLocation();
    if (teacherId) {
      fetchTeacherInfo();
    }
    fetchAttendanceHistory();
  }, [currentUser, teacherId]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          setErrorMessage('Location permission denied. Attendance can still be marked.');
        }
      );
    }
  };

  const fetchTeacherInfo = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const teacherDoc = await getDoc(doc(db, 'teachers', teacherId));
      if (teacherDoc.exists()) {
        const data = teacherDoc.data();
        setTeacherInfo(data);
        
        if (!data.attendanceEnabled) {
          setErrorMessage('Attendance is currently disabled by the teacher.');
          setLoading(false);
          return;
        }

        if (data.currentLecture) {
          setLectureInfo(data.currentLecture);
        } else {
          setErrorMessage('No active lecture session.');
        }
      } else {
        setErrorMessage('Teacher information not found. Please check the link.');
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
      setErrorMessage('Failed to load teacher details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!currentUser || !currentUser.prn) return;
    
    try {
      const q = query(
        collection(db, 'attendance'),
        where('studentPRN', '==', currentUser.prn)
      );
      const querySnapshot = await getDocs(q);
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      setAttendanceHistory(
        history.sort((a, b) => {
          const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return timeB - timeA;
        })
      );
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  const markAttendance = async () => {
    if (!currentUser || attendanceMarked || loading) return;

    if (!teacherId || !teacherInfo) {
      setErrorMessage('Please use the attendance link provided by your teacher.');
      return;
    }

    if (!teacherInfo.attendanceEnabled) {
      setErrorMessage('Attendance is currently disabled by the teacher.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const now = new Date();
      const attendanceData = {
        studentId: currentUser.id || currentUser.prn,
        studentName: currentUser.name || currentUser.fullName,
        studentPRN: currentUser.prn,
        department: currentUser.department || teacherInfo.department,
        division: division || currentUser.division,
        class: currentUser.class,
        timestamp: Timestamp.fromDate(now),
        location: location || null,
        teacherId: teacherId,
        teacherName: teacherInfo.name,
        subject: teacherInfo.subject,
        lectureNumber: lectureInfo?.number || 'N/A',
        lectureDate: lectureInfo?.date || now.toISOString().split('T')[0]
      };

      await addDoc(collection(db, 'attendance'), attendanceData);

      setAttendanceMarked(true);
      setSuccessMessage('✅ Attendance marked successfully!');
      setTimeout(() => {
        fetchAttendanceHistory();
      }, 1000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setErrorMessage('Failed to mark attendance: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
  // Clear localStorage
  localStorage.removeItem('user');
  
  // Navigate to home
  navigate('/', { replace: true });
  
  // Force reload to clear all state
  window.location.reload();
};

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="gradient-bg">
      <div className="container">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1>Welcome, {currentUser.name || currentUser.fullName}!</h1>
              <p>PRN: {currentUser.prn} | Class: {currentUser.class} | Division: {currentUser.division}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {teacherId && teacherInfo && (
          <div className="card" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', textAlign: 'center' }}>
            <h3>📚 Current Lecture Session</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
              <div>
                <strong>Teacher:</strong>
                <p>{teacherInfo.name}</p>
              </div>
              <div>
                <strong>Subject:</strong>
                <p>{teacherInfo.subject}</p>
              </div>
              <div>
                <strong>Lecture:</strong>
                <p>{lectureInfo?.number || 'N/A'}</p>
              </div>
              <div>
                <strong>Date:</strong>
                <p>{lectureInfo?.date || 'N/A'}</p>
              </div>
              <div>
                <strong>Division:</strong>
                <p>{division || currentUser.division}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <button 
            className="attendance-btn"
            onClick={markAttendance}
            disabled={attendanceMarked || loading || !teacherId || !teacherInfo?.attendanceEnabled}
          >
            {loading ? 'Processing...' : 
             attendanceMarked ? '✅\nMarked' : 
             '📝\nMark\nAttendance'}
          </button>
          {!teacherId && (
            <p style={{ color: '#e65100', fontWeight: '600', marginTop: '15px' }}>
              ⚠️ Use the teacher's attendance link to mark attendance
            </p>
          )}
        </div>

        <div className="webcam-container">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            width={320}
            height={240}
            videoConstraints={{
              width: 320,
              height: 240,
              facingMode: "user"
            }}
            style={{ borderRadius: '15px' }}
          />
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Classes</h3>
            <div className="stat-value">{attendanceHistory.length}</div>
          </div>
          <div className="stat-card">
            <h3>This Month</h3>
            <div className="stat-value">
              {attendanceHistory.filter(a => {
                const date = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                return date.getMonth() === new Date().getMonth();
              }).length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Attendance %</h3>
            <div className="stat-value">
              {attendanceHistory.length > 0 ? Math.round((attendanceHistory.length / 60) * 100) : 0}%
            </div>
          </div>
        </div>

        <div className="card">
          <h3>📋 Recent Attendance History</h3>
          {attendanceHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No attendance records yet. Mark your first attendance!
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Lecture</th>
                    <th>Division</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.slice(0, 10).map((record) => (
                    <tr key={record.id}>
                      <td>{formatTimestamp(record.timestamp)}</td>
                      <td>{record.subject}</td>
                      <td>{record.teacherName}</td>
                      <td>{record.lectureNumber} ({record.lectureDate})</td>
                      <td>{record.division}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;