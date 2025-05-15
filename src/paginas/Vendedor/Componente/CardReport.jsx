import React from "react";
import { Card, Accordion, ListGroup, Badge } from "react-bootstrap";

const CardReportUsuario = ({ usuario }) => {
  // Calcular total de saldos rendidos (suma de todos los montos)
  const totalRendido = usuario.saldoRendido?.reduce(
    (total, pago) => total + pago.monto,
    0
  ) || 0;

  // Formateador de fechas
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
          <Card.Title>
            {usuario.rol === "cobrador" ? "Perfil Cobrador" : "Mi Perfil"}
          </Card.Title>
        </Card.Header>

        <Card.Body>
          {/* Información Básica */}
          <Card.Subtitle className="mb-3">
            <strong>{usuario.rol === "cobrador" ? "Cobrador:" : "Vendedor:"}</strong>{" "}
            {usuario.nombre} {usuario.apellido}
            <Badge bg="info" className="ms-2">
              {usuario.rol}
            </Badge>
          </Card.Subtitle>

          <ListGroup className="mb-3">
            <ListGroup.Item>
              <div><strong>DNI:</strong> {usuario.dni}</div>
              <div><strong>Email:</strong> {usuario.email}</div>
              <div><strong>Teléfono:</strong> {usuario.telefono}</div>
              {usuario.localidad && (
                <div><strong>Localidad:</strong> {usuario.localidad}</div>
              )}
            </ListGroup.Item>
          </ListGroup>

          {/* Datos Financieros */}
          <ListGroup className="mb-3">
            <ListGroup.Item className="bg-light">
              <h5 className="mb-2">Información Financiera</h5>
              <div className="d-flex justify-content-between">
                <span><strong>Saldo Pendiente:</strong></span>
                <span className={`fw-bold ${usuario.saldoPendiente > 0 ? "text-danger" : "text-success"}`}>
                  ${usuario.saldoPendiente?.toLocaleString("es-AR") || 0}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span><strong>Total Rendido:</strong></span>
                <span className="text-success fw-bold">
                  ${totalRendido.toLocaleString("es-AR")}
                </span>
              </div>
            </ListGroup.Item>
          </ListGroup>

          {/* Historial de Pagos (saldoRendido) */}
          <Accordion className="mb-3">
            <Accordion.Item eventKey="historial-pagos">
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100">
                  <span>Historial de Pagos</span>
                  <span className="badge bg-primary rounded-pill">
                    {usuario.saldoRendido?.length || 0}
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {usuario.saldoRendido?.length > 0 ? (
                  <ListGroup variant="flush">
                    {usuario.saldoRendido
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                      .map((pago, i) => (
                        <ListGroup.Item key={i} className="mb-2 border rounded">
                          <div className="d-flex justify-content-between">
                            <strong>Monto:</strong>
                            <span className="text-success fw-bold">
                              ${pago.monto.toLocaleString("es-AR")}
                            </span>
                          </div>
                          <div>
                            <strong>Fecha:</strong> {formatFecha(pago.fecha)}
                          </div>
                          <div>
                            <strong>Responsable:</strong> {pago.responsable}
                          </div>
                          {pago.comentario && (
                            <div className="mt-1">
                              <small className="text-muted">
                                {pago.comentario}
                              </small>
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                ) : (
                  <div className="text-center text-muted py-3">
                    No hay pagos registrados
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Información adicional según rol */}
          {usuario.rol === "vendedor" && (
            <ListGroup className="mb-3">
              <ListGroup.Item className="bg-light">
                <h5 className="mb-2">Información extra</h5>
                <div>
                  <strong>Fecha de Ingreso:</strong>{" "}
                  {usuario.fechaIngreso ? formatFecha(usuario.fechaIngreso) : "No especificada"}
                </div>
                {usuario.fechaSalida && (
                  <div>
                    <strong>Fecha de Salida:</strong> {formatFecha(usuario.fechaSalida)}
                  </div>
                )}
                <div>
                  <strong>Estado:</strong>{" "}
                  <Badge bg={usuario.estado ? "success" : "danger"}>
                    {usuario.estado ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </ListGroup.Item>
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CardReportUsuario;
