import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import './App.css';

// --- COMPONENTE HOME (Página Principal) ---
function Home({ user }) {
  const [opciones, setOpciones] = useState({ tiposAyuda: [], centrosAcopio: [], destinos: [] });
  const [formData, setFormData] = useState({ tipo: '', recurso: '', cantidad: 1, centroOrigen: '', destino: '' });
  const [imagenes] = useState([
    "https://images.unsplash.com/photo-1602202651478-f6ed348e3573?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1614746684705-eb101e4db9a8?auto=format&fit=crop&w=1200&q=80"
  ]);
  const [imagenActual, setImagenActual] = useState(0);

  // Cargar las opciones desde el backend (BFF)
  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard/opciones')
      .then(res => res.json())
      .then(data => {
        setOpciones(data);
        setFormData({
          tipo: data.tiposAyuda[0] || '',
          recurso: '',
          cantidad: 1,
          centroOrigen: data.centrosAcopio[0] || '',
          destino: data.destinos[0] || ''
        });
      })
      .catch(err => console.error("Error cargando opciones:", err));

    const intervalo = setInterval(() => setImagenActual(prev => (prev + 1) % imagenes.length), 4000);
    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resDonacion = await fetch('http://localhost:8081/api/donacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: formData.tipo, recurso: formData.recurso, cantidad: formData.cantidad, origen: user.email, centroAcopioAsignado: formData.centroOrigen })
      });
      const resLogistica = await fetch('http://localhost:8082/api/envio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centroAcopioOrigen: formData.centroOrigen, destino: formData.destino, patenteTransporte: "POR-ASIGNAR" })
      });

      if (resDonacion.ok && resLogistica.ok) {
        alert("¡Gracias! Donación registrada exitosamente.");
        setFormData({ ...formData, recurso: '', cantidad: 1 });
      } else {
        alert("Hubo un error al procesar la donación.");
      }
    } catch (error) {
      alert("Error de conexión. Verifica que el backend esté encendido.");
    }
  };

  return (
    <>
      <section className="carousel-section">
        <div className="carousel">
          <img src={imagenes[imagenActual]} alt="Emergencia" className="carousel-image" />
          <div className="carousel-overlay"><h2>Tu ayuda llega a donde más se necesita</h2></div>
        </div>
      </section>

      <section className="about-section">
        <h2>¿Qué es DONATON?</h2>
        <p><strong>Donaton</strong> es una organización especializada en la gestión de ayuda humanitaria...</p>
      </section>

      <section className="donate-section">
        {user ? (
          <div className="donate-card">
            <h2>Haz tu Aporte</h2>
            <form onSubmit={handleSubmit} className="donate-form">
              <div className="form-group">
                <label>Tipo de ayuda:</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  {opciones.tiposAyuda.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Recurso (Ej. Arroz):</label>
                <input type="text" name="recurso" value={formData.recurso} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Cantidad:</label>
                <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} min="1" required />
              </div>
              <div className="form-group">
                <label>Centro de Acopio:</label>
                <select name="centroOrigen" value={formData.centroOrigen} onChange={handleChange}>
                  {opciones.centrosAcopio.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Destino:</label>
                <select name="destino" value={formData.destino} onChange={handleChange}>
                  {opciones.destinos.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
              </div>
              <button type="submit" className="donate-btn">Donar Ahora</button>
            </form>
          </div>
        ) : (
          <div className="donate-card locked-card">
            <h2>Por favor Regístrese para realizar donaciones</h2>
            <Link to="/register"><button className="donate-btn">Registrarse</button></Link>
            <p className="login-hint">¿Ya estás registrado? <Link to="/login">Inicia Sesión</Link></p>
          </div>
        )}
      </section>
    </>
  );
}

// --- COMPONENTES AUTH ---
function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulación: Si el correo incluye 'admin', le damos rol admin
    const role = email.includes('admin') ? 'admin' : 'user';
    const userData = { email, role };
    localStorage.setItem('donatonUser', JSON.stringify(userData));
    setUser(userData);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="donate-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="donate-form">
          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="donate-btn">Entrar</button>
        </form>
      </div>
    </div>
  );
}

function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const userData = { email, role: 'user' };
    localStorage.setItem('donatonUser', JSON.stringify(userData));
    setUser(userData);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="donate-card">
        <h2>Registro de Voluntario</h2>
        <form onSubmit={handleRegister} className="donate-form">
          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="donate-btn">Registrarme</button>
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTE ADMIN DASHBOARD ---
function AdminDashboard({ user }) {
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard/resumen')
      .then(res => res.json())
      .then(data => setResumen(data))
      .catch(err => console.error(err));
  }, []);

  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="dashboard-container">
      <h2>Panel de Control Administrador (BFF)</h2>
      {resumen ? (
        <pre className="json-display">{JSON.stringify(resumen, null, 2)}</pre>
      ) : (
        <p>Cargando datos desde el BFF...</p>
      )}
    </div>
  );
}

// --- APP PRINCIPAL ---
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
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