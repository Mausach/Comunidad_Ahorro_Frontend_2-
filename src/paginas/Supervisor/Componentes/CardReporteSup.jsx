import React from "react";
import { Card, Accordion, ListGroup } from "react-bootstrap";

const EquipoSupervisor = ({ users, supervisor }) => {
  // Filtrar vendedores que pertenecen a este supervisor
  const vendedoresDelEquipo = users.filter(
    (user) => user.supervisorId === supervisor._id
  );

  return (
    <div className="d-flex justify-content-center mt-4">
      <Card
        style={{
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        }}
        className="shadow-lg rounded-4"
      >
        <Card.Header className="bg-primary text-white">
          <Card.Title>Equipo de {supervisor.nombre}</Card.Title>
        </Card.Header>

        <Card.Body>
          <Card.Subtitle className="mb-3 text-muted">
            <strong>Supervisor:</strong> {supervisor.nombre} {supervisor.apellido}
          </Card.Subtitle>

          {/* Información del Supervisor */}
          <ListGroup className="mb-3">
            <ListGroup.Item>
              <div><strong>Saldo Pendiente:</strong> ${supervisor.saldoPendiente || 0}</div>
            </ListGroup.Item>
          </ListGroup>

          {/* Historial de Pagos del Supervisor */}
          <Accordion className="mb-3">
            <Accordion.Item eventKey="sup-historial">
              <Accordion.Header>Historial de pagos del supervisor</Accordion.Header>
              <Accordion.Body>
                <ListGroup variant="flush">
                  {supervisor.saldoRendido?.length > 0 ? (
                    supervisor.saldoRendido.map((pago, i) => (
                      <ListGroup.Item key={i}>
                        <div><strong>Monto:</strong> ${pago.monto}</div>
                        <div><strong>Fecha:</strong> {pago.fecha}</div>
                        <div><strong>Hecho por:</strong> {pago.responsable}</div>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <div className="text-muted">No hay pagos registrados.</div>
                  )}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Lista de Vendedores del Equipo */}
          <h5 className="mt-4">Vendedores del equipo:</h5>
          <Accordion alwaysOpen>
            {vendedoresDelEquipo.length > 0 ? (
              vendedoresDelEquipo.map((vendedor, idx) => (
                <Accordion.Item eventKey={`vendedor-${idx}`} key={vendedor._id}>
                  <Accordion.Header>
                    {vendedor.nombre} {vendedor.apellido}
                  </Accordion.Header>
                  <Accordion.Body>
                    <ListGroup>
                      <ListGroup.Item>
                        <div><strong>Saldo Pendiente:</strong> ${vendedor.saldoPendiente || 0}</div>
                      </ListGroup.Item>
                    </ListGroup>

                    {/* Historial del Vendedor */}
                    <Accordion className="mt-3">
                      <Accordion.Item eventKey={`historial-${vendedor._id}`}>
                        <Accordion.Header>Historial de pagos</Accordion.Header>
                        <Accordion.Body>
                          <ListGroup variant="flush">
                            {vendedor.saldoRendido?.length > 0 ? (
                              vendedor.saldoRendido.map((pago, i) => (
                                <ListGroup.Item key={i}>
                                  <div><strong>Monto:</strong> ${pago.monto}</div>
                                  <div><strong>Fecha:</strong> {pago.fecha}</div>
                                  <div><strong>Hecho por:</strong> {pago.responsable}</div>
                                </ListGroup.Item>
                              ))
                            ) : (
                              <div className="text-muted">No hay pagos registrados.</div>
                            )}
                          </ListGroup>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Accordion.Body>
                </Accordion.Item>
              ))
            ) : (
              <div className="text-muted mt-2">No hay vendedores en este equipo.</div>
            )}
          </Accordion>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EquipoSupervisor;