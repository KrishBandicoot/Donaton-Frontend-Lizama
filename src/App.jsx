import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usersDB = localStorage.getItem('donatonUsersDB');
    if (!usersDB) {
      localStorage.setItem('donatonUsersDB', JSON.stringify([
        { email: 'admin@donaton.cl', password: 'admin', role: 'admin' }
      ]));
    }
    const storedUser = localStorage.getItem('donatonUser');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('donatonUser');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <Link to="/" className="logo-link"><h1 className="logo">❤️ DONATON</h1></Link>
          <div className="header-actions">
            {user ? (
              <>
                <span className="user-greeting">Hola, {user.email}</span>
                {user.role === 'admin' && <Link to="/admin" className="nav-btn admin-btn">Dashboard Admin</Link>}
                <button onClick={handleLogout} className="nav-btn logout-btn">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn">Ingresar</Link>
                <Link to="/register" className="nav-btn primary">Registrarse</Link>
              </>
            )}
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;