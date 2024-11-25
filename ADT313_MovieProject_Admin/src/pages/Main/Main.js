import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Main.css';

function Main() {
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const handleDashboard = () => {
    navigate('/main/dashboard');
  };

  useEffect(() => {
    if (!accessToken) {
      handleLogout();
    }
  }, [accessToken]);

  return (
    <div className="Main">
      <div className="container">
        <div className="navigation">
          {/* Profile Section */}
          <div className="profile">
          <img src="/Profile.png" alt="Admin Profile" />
            <div className="name">Admin</div>
          </div>
          {/* Navigation Menu */}
          <ul>
            <li>
              <a onClick={handleDashboard}>
                <i className="fas fa-th-large"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="/main/movies">
                <i className="fas fa-film"></i> Movies
              </a>
            </li>
            <li className="logout">
              <a onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </a>
            </li>
          </ul>
        </div>
        <div className="outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;
