import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('donaciones'); 
  
  const [donaciones, setDonaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [logistica, setLogistica] = useState([]);

  useEffect(() => {
    // CORRECCIÓN: Evita que te expulse al recargar leyendo del localStorage si 'user' llega null
    const savedUser = user || JSON.parse(localStorage.getItem('donatonUser'));
    
    if (!savedUser || savedUser.role !== 'ROLE_ADMIN') {
      alert('Acceso denegado. Solo administradores pueden ver esta zona.');
      navigate('/');
    } else {
      cargarDatos(activeTab);
    }
  }, [user, navigate, activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('donatonToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const cargarDatos = async (tab) => {
    try {
      let url = `http://localhost:8080/api/admin/${tab}`;
      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });

      if (response.ok) {
        const data = await response.json();
        if (tab === 'donaciones') setDonaciones(data);
        if (tab === 'usuarios') setUsuarios(data);
        if (tab === 'logistica') setLogistica(data);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const handleEliminar = async (id, tipo) => {
    if (!window.confirm(`¿Estás seguro de eliminar este registro de ${tipo}?`)) return;

    try {
      const url = `http://localhost:8080/api/admin/${tipo}/${id}`;
      const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
      
      if (response.ok) {
        alert('Registro eliminado con éxito');
        cargarDatos(activeTab); 
      } else {
        alert('Error al eliminar el registro.');
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleEditar = async (id, tipo, itemActual, nuevoRol = null) => {
    let payload = {};

    if (tipo === 'donaciones') {
      let nuevoValor = window.prompt("Ingresa la nueva CANTIDAD para esta donación:", itemActual.cantidad);
      if (!nuevoValor || isNaN(nuevoValor)) return;
      payload = { cantidad: parseInt(nuevoValor) };
    } else if (tipo === 'logistica') {
      let nuevoValor = window.prompt("Ingresa la nueva PATENTE para este transporte:", itemActual.patenteTransporte);
      if (!nuevoValor) return;
      payload = { patenteTransporte: nuevoValor };
    } else if (tipo === 'usuarios') {
      payload = { rol: nuevoRol }; // Aquí recibe el valor del select
    }

    try {
      const url = `http://localhost:8080/api/admin/${tipo}/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Registro actualizado con éxito');
        cargarDatos(activeTab);
      } else {
        alert('Error al actualizar el registro.');
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '3px solid #ffc107', paddingBottom: '10px' }}>Panel de Administración Central</h2>
      
      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginTop: '20px' }}>
        <button onClick={() => setActiveTab('donaciones')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'donaciones' ? '#0056b3' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Donaciones
        </button>
        <button onClick={() => setActiveTab('logistica')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'logistica' ? '#0056b3' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logística y Envíos
        </button>
        <button onClick={() => setActiveTab('usuarios')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'usuarios' ? '#0056b3' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Gestión de Usuarios
        </button>
      </div>

      <div className="tab-content" style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        
        {/* --- TABLA DONACIONES --- */}
        {activeTab === 'donaciones' && (
          <div>
            <h3>Registro de Donaciones</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Tipo</th>
                  <th style={{ padding: '10px' }}>Recurso</th>
                  <th style={{ padding: '10px' }}>Cantidad</th>
                  <th style={{ padding: '10px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {donaciones.length === 0 ? <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No hay donaciones registradas</td></tr> : donaciones.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{d.id}</td>
                    <td style={{ padding: '10px' }}>{d.tipo}</td>
                    <td style={{ padding: '10px' }}>{d.recurso}</td>
                    <td style={{ padding: '10px' }}>{d.cantidad}</td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleEditar(d.id, 'donaciones', d)} style={{ marginRight: '10px', color: '#fff', backgroundColor: '#17a2b8', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => handleEliminar(d.id, 'donaciones')} style={{ color: '#fff', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TABLA LOGÍSTICA --- */}
        {activeTab === 'logistica' && (
          <div>
            <h3>Gestión de Logística y Transporte</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>ID Envío</th>
                  <th style={{ padding: '10px' }}>Origen</th>
                  <th style={{ padding: '10px' }}>Destino</th>
                  <th style={{ padding: '10px' }}>Patente</th>
                  <th style={{ padding: '10px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {logistica.length === 0 ? <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No hay envíos registrados</td></tr> : logistica.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{l.id}</td>
                    <td style={{ padding: '10px' }}>{l.centroAcopioOrigen}</td>
                    <td style={{ padding: '10px' }}>{l.destino}</td>
                    <td style={{ padding: '10px' }}>{l.patenteTransporte}</td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleEditar(l.id, 'logistica', l)} style={{ marginRight: '10px', color: '#fff', backgroundColor: '#17a2b8', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => handleEliminar(l.id, 'logistica')} style={{ color: '#fff', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TABLA USUARIOS --- */}
        {activeTab === 'usuarios' && (
          <div>
            <h3>Usuarios Registrados</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Correo</th>
                  <th style={{ padding: '10px' }}>Nombre</th>
                  <th style={{ padding: '10px' }}>Rol</th>
                  <th style={{ padding: '10px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>Cargando usuarios...</td></tr> : usuarios.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{u.id}</td>
                    <td style={{ padding: '10px' }}>{u.username}</td>
                    <td style={{ padding: '10px' }}>{u.nombre}</td>
                    <td style={{ padding: '10px' }}>
                      {/* SELECT DE ROL */}
                      <select value={u.rol} onChange={(e) => handleEditar(u.id, 'usuarios', u, e.target.value)}>
                        <option value="ROLE_USER">ROLE_USER</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleEliminar(u.id, 'usuarios')} style={{ color: '#fff', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;