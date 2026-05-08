import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    tipo: 'Alimento',
    recurso: '',
    cantidad: 1,
    centroOrigen: 'Centro Central Santiago',
    destino: 'Refugio Maipú'
  });

  // Imágenes para el carrusel simulando emergencias
  const [imagenes] = useState([
    "https://images.unsplash.com/photo-1602202651478-f6ed348e3573?auto=format&fit=crop&w=1200&q=80", // Desastre/Terremoto
    "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?auto=format&fit=crop&w=1200&q=80", // Situación calle/Apoyo
    "https://images.unsplash.com/photo-1614746684705-eb101e4db9a8?auto=format&fit=crop&w=1200&q=80"  // Incendios forestales
  ]);
  const [imagenActual, setImagenActual] = useState(0);

  // Efecto para cambiar la imagen cada 4 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setImagenActual((prev) => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Guardar la donación en el Microservicio de Donaciones (Puerto 8081)
      const resDonacion = await fetch('http://localhost:8081/api/donacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: formData.tipo,
          recurso: formData.recurso,
          cantidad: formData.cantidad,
          origen: "Aporte Ciudadano",
          centroAcopioAsignado: formData.centroOrigen
        })
      });

      // 2. Planificar el envío en el Microservicio de Logística (Puerto 8082)
      const resLogistica = await fetch('http://localhost:8082/api/envio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centroAcopioOrigen: formData.centroOrigen,
          destino: formData.destino,
          patenteTransporte: "POR-ASIGNAR"
        })
      });

      if (resDonacion.ok && resLogistica.ok) {
        alert(`¡Gracias! Tu donación de ${formData.cantidad} ${formData.recurso} ha sido registrada y el envío hacia ${formData.destino} está en preparación.`);
        // Limpiar el formulario después de donar
        setFormData({...formData, recurso: '', cantidad: 1});
      } else {
        alert("Hubo un error al procesar la donación. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con los servidores. Verifica que el backend esté encendido.");
    }
  };

  return (
    <div className="app-container">
      {/* Header tipo GoFundMe */}
      <header className="header">
        <h1 className="logo">❤️ DONATON</h1>
        <p className="subtitle">Plataforma Inteligente de Ayuda Humanitaria</p>
      </header>

      {/* Carrusel de Emergencias */}
      <section className="carousel-section">
        <div className="carousel">
          <img src={imagenes[imagenActual]} alt="Emergencia" className="carousel-image" />
          <div className="carousel-overlay">
            <h2>Tu ayuda llega a donde más se necesita</h2>
          </div>
        </div>
      </section>

      {/* Descripción extraída del Caso Semestral */}
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

      {/* Formulario de Donación y Logística Unificado */}
      <section className="donate-section">
        <div className="donate-card">
          <h2>Haz tu Aporte</h2>
          <form onSubmit={handleSubmit} className="donate-form">
            
            <div className="form-group">
              <label>¿Qué tipo de ayuda vas a entregar?</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange}>
                <option value="Alimento">Alimentos</option>
                <option value="Ropa">Ropa de Abrigo</option>
                <option value="Insumos Medicos">Insumos Médicos</option>
                <option value="Higiene">Insumos de Higiene</option>
              </select>
            </div>

            <div className="form-group">
              <label>Describe el recurso (Ej. Saco de Arroz, Mascarillas):</label>
              <input 
                type="text" 
                name="recurso" 
                value={formData.recurso} 
                onChange={handleChange} 
                required 
                placeholder="¿Qué contiene tu donación?"
              />
            </div>

            <div className="form-group">
              <label>Cantidad (Unidades/Kg):</label>
              <input 
                type="number" 
                name="cantidad" 
                value={formData.cantidad} 
                onChange={handleChange} 
                min="1" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Centro de Acopio (¿Dónde lo entregas?):</label>
              <select name="centroOrigen" value={formData.centroOrigen} onChange={handleChange}>
                <option value="Centro Central Santiago">Centro Central Santiago</option>
                <option value="Sede Valparaíso">Sede Valparaíso</option>
                <option value="Gimnasio Concepción">Gimnasio Concepción</option>
              </select>
            </div>

            <div className="form-group">
              <label>Destino de tu Ayuda (¿A quién va dirigido?):</label>
              <select name="destino" value={formData.destino} onChange={handleChange}>
                <option value="Refugio Maipú">Refugio Maipú</option>
                <option value="Campamento Viña del Mar">Campamento Viña del Mar</option>
                <option value="Zona Cero Sur">Zona Cero Sur</option>
              </select>
            </div>

            <button type="submit" className="donate-btn">Donar Ahora</button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default App