import React, { useState, useEffect } from 'react';
import { Accordion, ListGroup, Button, Alert, Form, Row, Col, Badge } from 'react-bootstrap';
import { starAceptarRendVta } from '../Helper/aceptarRendicionVenta';
import { starAceptarRendCob } from '../Helper/aceptarRendCob';
//import { confirmarRendicion } from '../../Helpers/ConfirmarRendicion';

const ListaDeRendiciones = ({ rendiciones, setRefreshData, navigate,tipoMostrar }) => {
    const [mes, setMes] = useState('');
    const [anio, setAnio] = useState('');
    const [rendicionesFiltradas, setRendicionesFiltradas] = useState(rendiciones);
    

    const handleEdit = (rendicion) => {
        //confirmarRendicion(rendicion._id, setRefreshData, navigate);
        starAceptarRendVta(rendicion,setRefreshData,navigate)
        console.log('rendicion :', rendicion._id)
    };

    const handleEditCOb = (rendicion) => {
        //confirmarRendicion(rendicion._id, setRefreshData, navigate);
        starAceptarRendCob(rendicion,setRefreshData,navigate)
        console.log('rendicion :', rendicion._id)
    };
useEffect(() => {
    if (mes || anio) {
        const filtradas = rendiciones.filter((rendicion) => {
            if (!rendicion.createdAt) return false;
            
            // Crear fecha en zona horaria Argentina
            const fecha = new Date(rendicion.createdAt);
            const fechaArg = new Date(fecha.toLocaleString('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires'
            }));
            
            // Comparar con los filtros
            const cumpleMes = !mes || (fechaArg.getMonth() + 1 === parseInt(mes));
            const cumpleAnio = !anio || (fechaArg.getFullYear() === parseInt(anio));
            
            return cumpleMes && cumpleAnio;
        });
        setRendicionesFiltradas(filtradas);
    } else {
        setRendicionesFiltradas(rendiciones);
    }
}, [mes, anio, rendiciones]);

    const detectarTipoVenta = (dato) => {
        if (!dato) return 'sin_datos';

        if (dato.objetoRecibido) return 'permuta';
        if (dato.itemServicioEntregado && !dato.numeroCuota) return 'venta_directa';
        if (dato.montoPrestado) return 'prestamo';
        if (dato.suscripcionInicial_MontoVenta) {
            return dato.nombreProducto?.includes('Plan') ? 'plan_ahorro' :
                dato.nombreProducto === 'servicio' ? 'servicio' :
                    dato.nombreProducto === 'accesorio' ? 'accesorio' : 'entrega_inmediata';
        }
        return 'generico';
    };


    const renderDatosVenta = (dato) => {
        if (!dato) {
            return <Alert variant="warning">⚠️ No hay datos de venta registrados</Alert>;
        }

        return (
            <ListGroup.Item>
                {/* Campos básicos */}
                {dato.numeroContrato && (
                    <><strong>Contrato:</strong> #{dato.numeroContrato}<br /></>
                )}

                {dato.nombreProducto && (
                    <><strong>Producto:</strong> {dato.nombreProducto}<br /></>
                )}

                {dato.cliente?.nombre && dato.cliente?.apellido && (
                    <><strong>Cliente:</strong> {dato.cliente.nombre} {dato.cliente.apellido}<br /></>
                )}

                {/* Campos condicionales */}


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
        if (!dato) {
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

    const rendicionesVenta = rendicionesFiltradas.filter(r => r.tipo === "venta");
    const rendicionesCobranza = rendicionesFiltradas.filter(r => r.tipo === "cobranza");

    return (
        <div style={{ padding: '10px' }}>
            <h4 className="text-center mb-4">Historial de Rendiciones</h4>

            {/* Filtro de fechas */}
            <Form className="mb-4">
                <Row>
                    <Form.Group as={Col} md={6} controlId="formMes">
                        <Form.Label>Mes</Form.Label>
                        <Form.Control
                            as="select"
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                        >
                            <option value="">Todos los meses</option>
                            {[...Array(12).keys()].map((i) => (
                                <option key={i} value={i + 1}>
                                    {new Date(0, i).toLocaleString('es-AR', { month: 'long' })}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="formAnio">
                        <Form.Label>Año</Form.Label>
                        <Form.Control
                            as="select"
                            value={anio}
                            onChange={(e) => setAnio(e.target.value)}
                        >
                            <option value="">Todos los años</option>
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </Form.Control>
                    </Form.Group>
                </Row>
            </Form>

            {/* Sección de Ventas */}
            {rendicionesVenta.length > 0 && (
                <>
                    <h5 className="mt-3">
                        <i className="text-primary bi bi-download"> </i>
                        Rendiciones de Venta
                    </h5>
                    <Accordion className="mb-4">
                        {rendicionesVenta.map((rendicion, index) => (
                            <Accordion.Item
                                key={rendicion._id}
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
                                            {rendicion.createdAt}
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
                                    {!rendicion.estado && (
                                        <Button
                                            variant="success"
                                            onClick={() => handleEdit(rendicion)}
                                            className="mt-3"
                                        >
                                            Marcar como Rendido
                                        </Button>
                                    )}
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
                        <i className="text-success bi bi-cash-coin"> </i>
                        Rendiciones de Cobranza
                    </h5>
                    <Accordion className="mb-4">
                        {rendicionesCobranza.map((rendicion, index) => (
                            <Accordion.Item
                                key={rendicion._id}
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
                                            {rendicion.createdAt}
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
                                    {!rendicion.estado && (
                                        <Button
                                            variant="success"
                                            onClick={() => handleEditCOb(rendicion)}
                                            className="mt-3"
                                        >
                                            Marcar como Rendido
                                        </Button>
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </>
            )}

            {/* Mensaje si no hay rendiciones */}
            {rendicionesVenta.length === 0 && rendicionesCobranza.length === 0 && (
                <Alert variant="info" className="rounded-4 text-center">
                    {mes || anio
                        ? "🔍 No hay rendiciones para los filtros seleccionados."
                        : "📭 No hay rendiciones en el historial."}
                </Alert>
            )}
        </div>
    );
};

export default ListaDeRendiciones;

