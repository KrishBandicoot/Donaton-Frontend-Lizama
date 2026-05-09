import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const usersDB = JSON.parse(localStorage.getItem('donatonUsersDB')) || [];
    const foundUser = usersDB.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const userData = { email: foundUser.email, role: foundUser.role };
      localStorage.setItem('donatonUser', JSON.stringify(userData));
      setUser(userData);
      navigate('/');
    } else alert("Credenciales incorrectas o el usuario no existe.");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group"><label>Correo Electrónico:</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Contraseña:</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button type="submit" className="auth-btn">Entrar</button>
        </form>
      </div>
    </div>
  );
}
export default Login;