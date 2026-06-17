import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Mantener la sesión iniciada al recargar la página
  useEffect(() => {
    const storedUser = localStorage.getItem('donatonUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('donatonUser');
    localStorage.removeItem('donatonToken');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app-container">
        
        {/* Barra de Navegación Principal */}
        <nav className="navbar">
          {/* LADO IZQUIERDO: Logo */}
          <div className="nav-left">
            <Link to="/" className="nav-brand">
              DONATON
            </Link>
          </div>
          
          {/* LADO DERECHO: Acciones de Usuario */}
          <div className="nav-right">
            {user ? (
              <>
                {/* Botón de Dashboard solo si es Admin */}
                {user.role === 'ROLE_ADMIN' && (
                  <Link to="/admin" className="nav-btn admin-btn">
                    Dashboard
                  </Link>
                )}
                
                <span className="user-greeting">
                  Hola, {user.nombre}
                </span>
                
                <button onClick={handleLogout} className="nav-btn logout-btn">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn login-btn">Iniciar Sesión</Link>
                <Link to="/register" className="nav-btn register-btn">Registrarse</Link>
              </>
            )}
          </div>
        </nav>

        {/* Rutas de la Aplicación */}
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