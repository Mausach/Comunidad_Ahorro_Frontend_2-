import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Accordion, Badge, Card, ListGroup } from 'react-bootstrap';
import { NavBar } from '../../componentes/NavBarGeneral';
import { CargarCuotasHoyCob } from './Helper/cargarCuotasHoy';
import CuotaItem from '../Gerencia/Componentes/CuotaItem';


export const CobranzaCobrador = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const [cuotasHoy, setCuotasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  // Función para formatear fecha en formato argentino
  const formatFechaArgentina = (fechaString) => {
    if (!fechaString) return "No disponible";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };




    useEffect(() => {
  const cargarDatos = async () => {
    setLoading(true);
    try {
      await CargarCuotasHoyCob(usuario.dni, setCuotasHoy, navigate);
    } finally {
      setLoading(false);
    }
  };

  cargarDatos();
}, [navigate, refreshData, usuario.dni]);

  if (loading) {
    return (
      <div>
        <NavBar usuario={usuario} />
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando cuotas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar usuario={usuario} />
      
      <div className="container mt-4">
        <h2 className="mb-4 text-center">Cuotas a Cobrar Hoy</h2>
        
        {cuotasHoy.length === 0 ? (
          <div className="alert alert-info text-center">
            No hay cuotas pendientes para hoy.
          </div>
        ) : (
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                Cuotas del día ({cuotasHoy.length})
                <Badge bg="secondary" className="ms-2">
                  {cuotasHoy.length}
                </Badge>
              </Accordion.Header>
              <Accordion.Body className="p-0">
                {cuotasHoy.map((cuotaItem, index) => {
                  const { cliente, producto, venta, cuota } = cuotaItem;
                  
                  return (
                    <Card key={index} className="mb-3 shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                        <strong>{cliente?.nombre} {cliente?.apellido}</strong>
                        <Badge bg="light" text="dark">
                          DNI: {cliente?.dni}
                        </Badge>
                      </Card.Header>

                      <Card.Body>
                        {/* Datos del Cliente */}
                        <h5>Datos del Cliente</h5>
                        <ListGroup variant="flush" className="mb-3">
                          <ListGroup.Item>
                            <strong>Nombre:</strong> {cliente?.nombre} {cliente?.apellido}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Teléfono:</strong> {cliente?.numero_telefono || "No disponible"}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Dirección:</strong> {cliente?.direccion_comercial || "No disponible"}
                          </ListGroup.Item>
                        </ListGroup>

                        {/* Datos del Producto */}
                        <h5>Datos del Producto</h5>
                        <ListGroup variant="flush" className="mb-3">
                          <ListGroup.Item>
                            <strong>Producto:</strong> {producto?.nombre} ({producto?.tipo})
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Monto:</strong> ${producto?.monto?.toLocaleString('es-AR') || "No especificado"}
                          </ListGroup.Item>
                        </ListGroup>

                        {/* Datos de la Venta */}
                        <h5>Datos de la Venta</h5>
                        <ListGroup variant="flush" className="mb-3">
                          <ListGroup.Item>
                            <strong>N° Contrato:</strong> {venta?.numeroContrato || "No disponible"}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Fecha:</strong> {venta?.fechaRealizada || "No disponible"}
                          </ListGroup.Item>
                        </ListGroup>

                        {/* Componente CuotaItem */}
                        <CuotaItem
                          cuota={cuota}
                          venta={venta}
                          usuario={usuario}
                          setRefreshData={setRefreshData}
                          navigate={navigate}
                          
                        />
                      </Card.Body>
                    </Card>
                  );
                })}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}
      </div>
    </div>
  );
};
