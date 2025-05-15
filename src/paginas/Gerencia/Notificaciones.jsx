import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from '../../componentes/NavBarGeneral';
import { Accordion, Alert, Badge, Card, ListGroup, Spinner } from 'react-bootstrap';
import { CargarCuotasHoyPactadas } from './Helper/cargarCuotasDiasPactadas';

export const Notificaciones = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const [cuotasHoy, setCuotasHoy] = useState([]);
  const [ventasPactadas, setVentasPactadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await CargarCuotasHoyPactadas(setCuotasHoy, setVentasPactadas, navigate);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div>
      <NavBar usuario={usuario} />
      <div className="container my-4">
        <h2 className="mb-4">Resumen de Cuotas Especiales</h2>

        {/* Acordeón: Lista de todas las cuotas a cobrar hoy */}
        <Accordion defaultActiveKey="0" className="mb-5">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Cuotas Impagas del Día ({cuotasHoy.length})</Accordion.Header>
            <Accordion.Body>
              {cuotasHoy.length === 0 ? (
                <Alert variant="success">No hay cuotas impagas para hoy 🎉</Alert>
              ) : (
                cuotasHoy.map((cuota, index) => {
                  const cliente = cuota.cliente || {};
                  const objetoRelacionado = cuota.objetoRelacionado || {};
                  const cantidad = cuota.cant || {};
                  const fechaR = cuota.fr || {};
                  
                  return (
                    <Card key={index} className="mb-3 shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center bg-danger text-white">
                        <strong>{objetoRelacionado?.nombre || "Producto"}</strong>
                        <Badge bg="light" text="dark">
                          ID: {cliente?.id || "N/A"}
                        </Badge>
                      </Card.Header>

                      <Card.Body>
                        <h5>Datos del Cliente</h5>
                        <ListGroup variant="flush">
                          <ListGroup.Item><strong>Nombre:</strong> {cliente?.nombre} {cliente?.apellido}</ListGroup.Item>
                          <ListGroup.Item><strong>Email:</strong> {cliente?.email || "No disponible"}</ListGroup.Item>
                          <ListGroup.Item><strong>Teléfono:</strong> {cliente?.numero_telefono || cliente?.telefono || "No disponible"}</ListGroup.Item>
                          <ListGroup.Item><strong>DNI:</strong> {cliente?.dni || "No disponible"}</ListGroup.Item>
                          <ListGroup.Item><strong>Dirección:</strong> {cliente?.direccion || cliente?.direccion || "No disponible"}</ListGroup.Item>
                          <ListGroup.Item><strong>Segunda Dirección:</strong> {cliente?.direccion_2 || "No disponible"}</ListGroup.Item>
                          <ListGroup.Item><strong>Familiar Directo:</strong> {cliente?.nombre_fam || "No disponible"} {cliente?.apellido_fam || ""}</ListGroup.Item>
                        </ListGroup>

                        <h5 className="mt-3">Datos del Producto</h5>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <strong>Producto:</strong> {objetoRelacionado?.detalle?.venta?.itemInventario?.nombre || `${objetoRelacionado?.detalle?.prestamo?.montoPrestado}` || "No especificado"}
                          </ListGroup.Item>
                          <ListGroup.Item><strong>Cantidad de cuotas:</strong> {cantidad || "No especificado"}</ListGroup.Item>
                          <ListGroup.Item><strong>Fecha Realizada:</strong> {fechaR || "No disponible"}</ListGroup.Item>
                        </ListGroup>

                        <h5 className="mt-3">Detalles de la Cuota</h5>
                        <ListGroup>
                          <ListGroup.Item><strong>Número de Cuota:</strong> {cuota?.numeroCuota || "No disponible"}</ListGroup.Item>
                          <ListGroup.Item><strong>Monto:</strong> ${cuota?.montoCuota || cuota?.monto || "No disponible"}</ListGroup.Item>
                          <ListGroup.Item><strong>Fecha de Cobro:</strong> {cuota?.fechaCobro || "No disponible"}</ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  );
                })
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Ventas con cuotas pactadas pagadas */}
        <h3 className="mb-3">Ventas con Cuotas Pactadas Pagadas ({ventasPactadas.length})</h3>
        {ventasPactadas.length === 0 ? (
          <Alert variant="info">No hay registros de cuotas pactadas pagadas.</Alert>
        ) : (
          ventasPactadas.map((venta, index) => {
            const cliente = venta.cliente || {};
            const plan = venta.plan || {};
            const cuotas = venta.cuotas || [];
            console.log(plan.cuotasPactadas)
            return (
              <Card key={index} className="mb-3 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                  <strong>{cliente?.nombre} {cliente?.apellido}</strong>
                  <Badge bg="light" text="dark">ID: {cliente?.id}</Badge>
                </Card.Header>

                <Card.Body>
                  <h5>Datos del Cliente</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item><strong>Email:</strong> {cliente?.email || "No disponible"}</ListGroup.Item>
                    <ListGroup.Item><strong>Teléfono:</strong> {cliente?.telefono || cliente?.numero_telefono || "No disponible"}</ListGroup.Item>
                    <ListGroup.Item><strong>DNI:</strong> {cliente?.dni || "No disponible"}</ListGroup.Item>
                  </ListGroup>

                  <h5 className="mt-3">Datos del Plan</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item><strong>Plan:</strong> {plan?.nombre || "Producto"}</ListGroup.Item>
                    <ListGroup.Item><strong>Cuotas Pactadas:</strong> {Array.isArray(plan?.detalle?.venta?.cuotasPactadas) ? plan.detalle?.venta?.cuotasPactadas.join(", ") : "No especificadas"}</ListGroup.Item>
                   
                  </ListGroup>

                  <h5 className="mt-3">Cuotas Pagas</h5>
                  {cuotas.length > 0 ? (
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>Ver Cuotas ({cuotas.length})</Accordion.Header>
                        <Accordion.Body>
                          <ListGroup>
                            {cuotas.map((cuota, idx) => (
                              <ListGroup.Item key={idx}>
                                <strong>Cuota {cuota.numero_cuota || cuota.numeroCuota}:</strong> 
                                ${cuota.monto_cuota || cuota.montoCuota} 
                                {cuota.fecha_cobrada && ` (Pagada el ${cuota.fecha_cobrada})`}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  ) : (
                    <Alert variant="warning">No hay cuotas pagas.</Alert>
                  )}
                </Card.Body>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
