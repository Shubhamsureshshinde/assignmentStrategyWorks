import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <ul>
      {user && user.role === 'teacher' && (
        <li>
          <Link to="/teacher/dashboard">Dashboard</Link>
        </li>
      )}
      {user && user.role === 'student' && (
        <li>
          <Link to="/student/dashboard">Dashboard</Link>
        </li>
      )}
      <li>
        <a onClick={handleLogout} href="#!">
          <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <h1>
        <Link to="/">
          Virtual Classroom
        </Link>
      </h1>
      {user ? (
        <div className="welcome">
          <span>Welcome, {user.name} ({user.role})</span>
        </div>
      ) : null}
      {user ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar;