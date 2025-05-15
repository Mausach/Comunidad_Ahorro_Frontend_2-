import React from 'react';
import { Accordion, ListGroup, Alert, Badge } from 'react-bootstrap';

const RendicionesPendientes = ({ rendiciones }) => {
    const formatFechaArgentina = (fecha) => {
        if (!fecha) return "No disponible";
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-AR', options);
    };

    const renderDatosVenta = (dato) => {
        if (!dato || Object.keys(dato).length === 0) {
            return <Alert variant="warning">⚠️ No hay datos de venta registrados</Alert>;
        }

        return (
            <ListGroup.Item>
                {dato.numeroContrato && (
                    <><strong>Contrato:</strong> #{dato.numeroContrato}<br /></>
                )}

                {dato.nombreProducto && (
                    <><strong>Producto:</strong> {dato.nombreProducto}<br /></>
                )}

                {dato.cliente?.nombre && dato.cliente?.apellido && (
                    <><strong>Cliente:</strong> {dato.cliente.nombre} {dato.cliente.apellido}<br /></>
                )}

                {dato.objetoRecibido && (
                    <><strong>Objeto recibido:</strong> {dato.objetoRecibido}<br /></>
                )}

                {dato.itemServicioEntregado && (
                    <><strong>Item/Servicio:</strong> {dato.itemServicioEntregado}<br /></>
                )}

                {dato.serialItem && (
                    <><strong>Serial/IMEI:</strong> {dato.serialItem}<br /></>
                )}

                {(dato.suscripcionInicial_MontoVenta || dato.suscripcionInicial_MontoVenta === 0) && (
                    <><strong>Monto:</strong> ${dato.suscripcionInicial_MontoVenta.toLocaleString('es-AR')}<br /></>
                )}

                {(dato.montoPrestado || dato.montoPrestado === 0) && (
                    <><strong>Préstamo:</strong> ${dato.montoPrestado.toLocaleString('es-AR')}<br /></>
                )}

                {(dato.costoAdministrativoProduct || dato.costoAdministrativoProduct === 0) && (
                    <><strong>Costo administrativo:</strong> ${dato.costoAdministrativoProduct.toLocaleString('es-AR')}<br /></>
                )}

                {dato.vendedor?.nombre && dato.vendedor?.apellido && (
                    <><strong>Vendedor:</strong> {dato.vendedor.nombre} {dato.vendedor.apellido}<br /></>
                )}
            </ListGroup.Item>
        );
    };

    const renderDatosCobranza = (dato) => {
        if (!dato || Object.keys(dato).length === 0) {
            return <Alert variant="warning">⚠️ No hay datos de cobranza registrados</Alert>;
        }

        return (
            <ListGroup.Item>
                {dato.numeroCuota && (
                    <><strong>Cuota #{dato.numeroCuota}:</strong><br /></>
                )}
                <strong>Monto:</strong> ${dato.monto?.toLocaleString('es-AR')}<br />
                {dato.metodoPago && (
                    <><strong>Método:</strong> {dato.metodoPago}<br /></>
                )}
                {dato.cliente?.nombre && (
                    <><strong>Cliente:</strong> {dato.cliente.nombre} {dato.cliente.apellido}<br /></>
                )}
                {dato.numeroContrato && (
                    <><strong>Contrato:</strong> #{dato.numeroContrato}<br /></>
                )}
            </ListGroup.Item>
        );
    };

    // Filtrar por tipo
    const rendicionesVenta = rendiciones.filter(r => r.tipo === "venta");
    const rendicionesCobranza = rendiciones.filter(r => r.tipo === "cobranza");

    return (
        <div style={{ padding: '10px' }}>
            {/* Sección de Ventas */}
            {rendicionesVenta.length > 0 && (
                <>
                    <h5 className="mt-3">
                        <Badge bg="info" className="me-2">Ventas</Badge>
                        Pendientes de rendición
                    </h5>
                    <Accordion className="mb-4">
                        {rendicionesVenta.map((rendicion, index) => (
                            <Accordion.Item
                                key={rendicion._id || index}
                                eventKey={`venta-${index}`}
                                style={{ borderLeft: '4px solid #17a2b8' }}
                            >
                                <Accordion.Header>
                                    <div className="d-flex justify-content-between w-100">
                                        <span>
                                            {rendicion.usuario?.nombre} {rendicion.usuario?.apellido} -
                                            <strong> ${rendicion.montoARendir?.toLocaleString('es-AR')}</strong>
                                        </span>
                                        <span>
                                            {formatFechaArgentina(rendicion.fechaCreacion || rendicion.createdAt)}
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    {rendicion.datoRendicion?.length > 0 ? (
                                        <ListGroup variant="flush">
                                            {rendicion.datoRendicion.map((dato, idx) => (
                                                <React.Fragment key={idx}>
                                                    {renderDatosVenta(dato)}
                                                </React.Fragment>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <Alert variant="warning">⚠️ No hay datos de venta registrados</Alert>
                                    )}
                                    <Badge bg="warning" className="mt-2">
                                        Pendiente de rendición
                                    </Badge>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </>
            )}

            {/* Sección de Cobranzas */}
            {rendicionesCobranza.length > 0 && (
                <>
                    <h5 className="mt-3">
                        <Badge bg="success" className="me-2">Cobranzas</Badge>
                        Pendientes de rendición
                    </h5>
                    <Accordion className="mb-4">
                        {rendicionesCobranza.map((rendicion, index) => (
                            <Accordion.Item
                                key={rendicion._id || index}
                                eventKey={`cobranza-${index}`}
                                style={{ borderLeft: '4px solid #28a745' }}
                            >
                                <Accordion.Header>
                                    <div className="d-flex justify-content-between w-100">
                                        <span>
                                            {rendicion.usuario?.nombre} {rendicion.usuario?.apellido} -
                                            <strong> ${rendicion.montoARendir?.toLocaleString('es-AR')}</strong>
                                        </span>
                                        <span>
                                            {formatFechaArgentina(rendicion.fechaCreacion || rendicion.createdAt)}
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    {rendicion.datoRendicion?.length > 0 ? (
                                        <ListGroup variant="flush">
                                            {rendicion.datoRendicion.map((dato, idx) => (
                                                <React.Fragment key={idx}>
                                                    {renderDatosCobranza(dato)}
                                                </React.Fragment>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <Alert variant="warning">⚠️ No hay datos de cobranza registrados</Alert>
                                    )}
                                    <Badge bg="warning" className="mt-2">
                                        Pendiente de rendición
                                    </Badge>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </>
            )}

            {/* Mensaje si no hay rendiciones */}
            {rendicionesVenta.length === 0 && rendicionesCobranza.length === 0 && (
                <Alert variant="info" className="rounded-4 text-center">
                    ✅ No hay rendiciones pendientes en este momento.
                </Alert>
            )}
        </div>
    );
};

export default RendicionesPendientes;