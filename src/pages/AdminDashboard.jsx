import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard/resumen')
      .then(res => res.json())
      .then(data => { setResumen(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  if (loading) return <div className="dashboard-container"><p>Cargando datos estratégicos...</p></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Panel de Control Administrativo</h2>
        <p className="dashboard-intro">Gestión centralizada de recursos y despachos de ayuda.</p>
      </div>
      
      <div className="table-section">
        <h3>📦 Inventario de Donaciones (MySQL)</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Tipo</th><th>Recurso</th><th>Cant.</th><th>Origen</th><th>Centro Asignado</th><th>Fecha Ingreso</th></tr></thead>
            <tbody>
              {resumen?.donaciones?.length > 0 ? resumen.donaciones.map(d => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td><span className={`badge ${d.tipo?.toLowerCase().replace(" ", "-")}`}>{d.tipo}</span></td>
                  <td>{d.recurso}</td>
                  <td>{d.cantidad}</td>
                  <td>{d.origen}</td>
                  <td>{d.centroAcopioAsignado}</td>
                  <td>{d.fechaIngreso ? new Date(d.fechaIngreso).toLocaleString() : 'N/A'}</td>
                </tr>
              )) : <tr><td colSpan="7" className="empty-msg">No hay donaciones registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section">
        <h3>🚚 Estado de Envíos Logísticos (PostgreSQL)</h3>
        {/* Aquí estaba el error: cambiamos resumen?.envios por resumen?.logistica */}
        {Array.isArray(resumen?.logistica) ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Origen</th><th>Destino</th><th>Patente</th><th>Estado</th><th>Fecha Despacho</th></tr></thead>
              <tbody>
                {resumen.logistica.length > 0 ? resumen.logistica.map(e => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.centroAcopioOrigen}</td>
                    <td>{e.destino}</td>
                    <td><code>{e.patenteTransporte}</code></td>
                    <td><span className={`status-pill ${e.estado?.toLowerCase()}`}>{e.estado}</span></td>
                    <td>{e.fechaDespacho ? new Date(e.fechaDespacho).toLocaleString() : 'Pendiente'}</td>
                  </tr>
                )) : <tr><td colSpan="6" className="empty-msg">No hay envíos programados.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="circuit-breaker-warning">
            <p>⚠️ {resumen?.logistica || "Servicio de logística no responde."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;