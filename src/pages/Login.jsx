import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json(); 
        localStorage.setItem('donatonToken', data.token);
        
        const userData = { username: data.username, role: data.rol, nombre: data.nombre, tipoUsuario: data.tipoUsuario };
        
        localStorage.setItem('donatonUser', JSON.stringify(userData));
        setUser(userData);
        navigate('/');
      } else {
        if (response.status === 401) {
            alert("Error: El correo o la contraseña son incorrectos.");
        } else {
            alert("El servicio de autenticación no responde. Intente más tarde.");
        }
      }
    } catch (error) {
      alert("Error de red: No se pudo conectar con el servidor. Verifica que el BFF esté levantado.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            {/* CORRECCIÓN: Se enlaza el label con el input mediante htmlFor e id */}
            <label htmlFor="login-username">Usuario (Correo):</label>
            <input id="login-username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Contraseña:</label>
            <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;