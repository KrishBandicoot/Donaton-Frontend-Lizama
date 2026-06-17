import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function Register({ setUser }) {
  const [tipoUsuario, setTipoUsuario] = useState('PERSONA');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rutPersona, setRutPersona] = useState('');
  
  const [razonSocial, setRazonSocial] = useState('');
  const [rutEmpresa, setRutEmpresa] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const validarFormulario = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) return "Error: El correo electrónico no tiene un formato válido.";

    const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/;
    if (tipoUsuario === 'PERSONA' && !rutRegex.test(rutPersona)) return "Error en RUT: El formato correcto es XX.XXX.XXX-X.";
    if (tipoUsuario === 'EMPRESA' && !rutRegex.test(rutEmpresa)) return "Error en RUT Empresa: El formato correcto es XX.XXX.XXX-X.";

    const passRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passRegex.test(password)) return "Error en Contraseña: Debe tener mínimo 8 caracteres, al menos 1 número y 1 carácter especial.";

    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setErrorMsg(errorValidacion);
      return;
    }

    const nombreFinal = tipoUsuario === 'PERSONA' ? `${nombre} ${apellido}` : razonSocial;

    const payload = {
      username: username,
      password: password,
      nombre: nombreFinal,
      tipoUsuario: tipoUsuario 
    };

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }) 
        });

      if (loginResponse.ok) {
                const data = await loginResponse.json(); 
                localStorage.setItem('donatonToken', data.token);
                const userData = { username: data.username, role: data.rol, nombre: data.nombre, tipoUsuario: data.tipoUsuario };
                localStorage.setItem('donatonUser', JSON.stringify(userData));
                setUser(userData); 
                navigate('/'); 
              } else {
          alert('Cuenta creada exitosamente, pero hubo un problema al iniciar sesión automáticamente. Por favor, ingresa tus datos.');
          navigate('/login');
        }

      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.error || 'Error desconocido del servidor.');
      }
    } catch (error) {
      console.error("Error al conectar con el BFF:", error);
      setErrorMsg("Error de red. Verifica que tu BFF esté levantado en el puerto 8080.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        
        {errorMsg && <div className="error-message" style={{ color: 'white', backgroundColor: '#e74c3c', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</div>}

        <div className="tipo-usuario-selector" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <label style={{ cursor: 'pointer' }}>
            {/* CORRECCIÓN DE ACCESIBILIDAD TAMBIÉN PARA LOS RADIOS */}
            <input id="radio-persona" type="radio" value="PERSONA" checked={tipoUsuario === 'PERSONA'} onChange={() => setTipoUsuario('PERSONA')} /> Individuo
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input id="radio-empresa" type="radio" value="EMPRESA" checked={tipoUsuario === 'EMPRESA'} onChange={() => setTipoUsuario('EMPRESA')} /> Empresa
          </label>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-email">Correo Electrónico (Usuario):</label>
            <input id="reg-email" type="email" value={username} onChange={e => setUsername(e.target.value)} placeholder="ejemplo@correo.cl" required />
          </div>

          {tipoUsuario === 'PERSONA' && (
            <>
              <div className="form-group">
                <label htmlFor="reg-nombre">Nombre:</label>
                <input id="reg-nombre" type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="reg-apellido">Apellido:</label>
                <input id="reg-apellido" type="text" value={apellido} onChange={e => setApellido(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="reg-rut">RUT:</label>
                <input id="reg-rut" type="text" value={rutPersona} onChange={e => setRutPersona(e.target.value)} placeholder="12.345.678-9" required />
              </div>
            </>
          )}

          {tipoUsuario === 'EMPRESA' && (
            <>
              <div className="form-group">
                <label htmlFor="reg-razon">Razón Social:</label>
                <input id="reg-razon" type="text" value={razonSocial} onChange={e => setRazonSocial(e.target.value)} placeholder="Nombre legal de la empresa" required />
              </div>
              <div className="form-group">
                <label htmlFor="reg-rut-empresa">RUT Empresa:</label>
                <input id="reg-rut-empresa" type="text" value={rutEmpresa} onChange={e => setRutEmpresa(e.target.value)} placeholder="76.000.000-K" required />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="reg-password">Contraseña:</label>
            <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres, 1 número y 1 símbolo" required />
          </div>

          <button type="submit" className="auth-btn">Registrarse</button>
        </form>
        
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <p>¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#0056b3', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;