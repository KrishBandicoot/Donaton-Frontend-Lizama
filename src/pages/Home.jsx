import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home({ user }) {
  const [opciones, setOpciones] = useState({ tiposAyuda: [], centrosAcopio: [], destinos: [] });
  const [formData, setFormData] = useState({ tipo: '', recurso: '', cantidad: 1, centroOrigen: '', destino: '' });
  const [imagenes] = useState([
    "/images/desastres.jpg",
    "/images/incendio.jpg",
    "/images/terremotos.jpg"
  ]);
  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard/opciones')
      .then(res => res.json())
      .then(data => {
        setOpciones(data);
        setFormData({ tipo: data.tiposAyuda[0] || '', recurso: '', cantidad: 1, centroOrigen: data.centrosAcopio[0] || '', destino: data.destinos[0] || '' });
      })
      .catch(err => console.error(err));

    const intervalo = setInterval(() => setImagenActual(prev => (prev + 1) % imagenes.length), 4000);
    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resDonacion = await fetch('http://localhost:8081/api/donacion', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: formData.tipo, recurso: formData.recurso, cantidad: formData.cantidad, origen: user.email, centroAcopioAsignado: formData.centroOrigen })
      });
      const resLogistica = await fetch('http://localhost:8082/api/envio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centroAcopioOrigen: formData.centroOrigen, destino: formData.destino, patenteTransporte: "POR-ASIGNAR" })
      });

      if (resDonacion.ok && resLogistica.ok) {
        alert("¡Gracias! Donación registrada exitosamente.");
        setFormData({ ...formData, recurso: '', cantidad: 1 });
      } else alert("Error al procesar la donación.");
    } catch (error) { alert("Error de conexión."); }
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
        <p>
          <strong>Donaton</strong> es una organización especializada en la gestión de ayuda humanitaria y coordinación de donaciones. 
          Trabajamos de manera activa con diversas instituciones para llegar a las comunidades afectadas en las 
          diversas situaciones de emergencia que se presentan en el país.
        </p>
        <p>
          A través de nuestra red de voluntarios y centros de acopio, logramos recibir y distribuir eficientemente 
          ropa, alimentos, insumos médicos y de higiene, garantizando que los recursos lleguen de manera oportuna 
          para satisfacer las necesidades básicas de los damnificados.
        </p>
      </section>
      <section className="donate-section">
        {user ? (
          <div className="donate-card">
            <h2>Haz tu Aporte</h2>
            <form onSubmit={handleSubmit} className="donate-form">
              <div className="form-group"><label>Tipo de ayuda:</label><select name="tipo" value={formData.tipo} onChange={handleChange}>{opciones.tiposAyuda.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              <div className="form-group"><label>Recurso:</label><input type="text" name="recurso" value={formData.recurso} onChange={handleChange} required /></div>
              <div className="form-group"><label>Cantidad:</label><input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} min="1" required /></div>
              <div className="form-group"><label>Centro de Acopio:</label><select name="centroOrigen" value={formData.centroOrigen} onChange={handleChange}>{opciones.centrosAcopio.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              <div className="form-group"><label>Destino:</label><select name="destino" value={formData.destino} onChange={handleChange}>{opciones.destinos.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
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
//testing commit//
export default Home;