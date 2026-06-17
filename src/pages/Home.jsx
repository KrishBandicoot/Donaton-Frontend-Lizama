import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home({ user }) {
  const [opciones, setOpciones] = useState({ tiposAyuda: [], centrosAcopio: [], destinos: [] });
  
  // AQUÍ: Agregamos "unidad" con un valor por defecto
  const [formData, setFormData] = useState({ 
    tipo: '', 
    recurso: '', 
    cantidad: 1, 
    unidad: 'Unidades', 
    centroOrigen: '', 
    destino: '' 
  });

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
        setFormData({ 
          tipo: data.tiposAyuda[0] || '', 
          recurso: '', 
          cantidad: 1, 
          unidad: 'Unidades', 
          centroOrigen: data.centrosAcopio[0] || '', 
          destino: data.destinos[0] || '' 
        });
      })
      .catch(err => console.error(err));

    const intervalo = setInterval(() => setImagenActual(prev => (prev + 1) % imagenes.length), 4000);
    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('donatonToken');

      const resDonacion = await fetch('http://localhost:8081/api/donacion', {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          tipo: formData.tipo, 
          // AQUÍ: Juntamos el nombre del recurso con su unidad de medida
          recurso: `${formData.recurso} (${formData.unidad})`, 
          cantidad: formData.cantidad, 
          origen: user.username,
          centroAcopioAsignado: formData.centroOrigen,
          tipoDonante: user.tipoUsuario || 'PERSONA',
          nombreRazonSocial: user.nombre,
          rut: 'Registrado en BD'
        })
      });

      const resLogistica = await fetch('http://localhost:8082/api/envio', {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          centroAcopioOrigen: formData.centroOrigen, 
          destino: formData.destino, 
          patenteTransporte: "POR-ASIGNAR" 
        })
      });

      if (resDonacion.ok && resLogistica.ok) {
        alert("¡Gracias! Donación registrada exitosamente.");
        setFormData({ ...formData, recurso: '', cantidad: 1, unidad: 'Unidades' });
      } else {
        alert("Error al procesar la donación. Verifica tus permisos de usuario.");
      }
    } catch (error) { 
      alert("Error de conexión con el servidor."); 
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
              <div className="form-group"><label>Recurso (Ej: Arroz, Pañales):</label><input type="text" name="recurso" value={formData.recurso} onChange={handleChange} required /></div>
              
              {/* AQUÍ: Dividimos el input en Cantidad y Unidad de Medida */}
              <div className="form-group" style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label>Cantidad:</label>
                  <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} min="1" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Medida:</label>
                  <select name="unidad" value={formData.unidad} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                    <option value="Unidades">Unidades</option>
                    <option value="Cajas">Cajas</option>
                    <option value="Sacos">Sacos</option>
                    <option value="Kilos">Kilos</option>
                    <option value="Litros">Litros</option>
                    <option value="Pallets">Pallets</option>
                  </select>
                </div>
              </div>

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
export default Home;