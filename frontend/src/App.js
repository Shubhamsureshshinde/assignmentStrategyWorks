import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './Context/AuthContext'
import { ClassroomProvider } from './Context/ClassroomContext';
import Navbar from './Components/common/navbar';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import StudentView from './Components/classroom/studentView';
import TeacherView from './Components/classroom/teacherView';
import ClassroomReport from './Components/report/classroomReport';
import './index.css';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <div className="unauthorized">
      <h2>Unauthorized</h2>
      <p>You don't have permission to access this page.</p>
    </div>;
  }

  return children;
};

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={
              user ? (
                user.role === 'teacher' ? 
                  <Navigate to="/teacher/dashboard" /> : 
                  <Navigate to="/student/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            } />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/student/dashboard" element={
              <ProtectedRoute requiredRole="student">
                <StudentView />
              </ProtectedRoute>
            } />
            
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherView />
              </ProtectedRoute>
            } />
            
            <Route path="/classroom/:id" element={
              <ProtectedRoute>
                {user?.role === 'teacher' ? <TeacherView /> : <StudentView />}
              </ProtectedRoute>
            } />
            
            <Route path="/reports/classroom/:id" element={
              <ProtectedRoute requiredRole="teacher">
                <ClassroomReport />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ClassroomProvider>
        <AppContent />
      </ClassroomProvider>
    </AuthProvider>
  );
}

export default App;