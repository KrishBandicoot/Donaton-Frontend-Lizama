import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const usersDB = JSON.parse(localStorage.getItem('donatonUsersDB')) || [];
    if (usersDB.find(u => u.email === email)) {
      alert("Este correo ya está registrado.");
    } else {
      const newUser = { email, password, role: 'user' };
      usersDB.push(newUser);
      localStorage.setItem('donatonUsersDB', JSON.stringify(usersDB));
      const userData = { email: newUser.email, role: newUser.role };
      localStorage.setItem('donatonUser', JSON.stringify(userData));
      setUser(userData);
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registro de Voluntario</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group"><label>Correo Electrónico:</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Crear Contraseña:</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength="4" required /></div>
          <button type="submit" className="auth-btn">Registrarme</button>
        </form>
      </div>
    </div>
  );
}
export default Register;