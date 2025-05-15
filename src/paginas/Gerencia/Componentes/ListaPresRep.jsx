import React, { useMemo, useState } from "react";
import { Card, Badge, Accordion, ListGroup, Alert, Button, Form, Container, Row } from "react-bootstrap";
import PieChartComponent from "./GraficoTorta";

const ListaPrestamos = ({ prestamos }) => {
   // Estados para filtros y detalles
    const [mes, setMes] = useState("");
    const [anio, setAnio] = useState("");
    const [mostrarDetalles, setMostrarDetalles] = useState(false);

    // Filtrar préstamos por año/mes
    const prestamosFiltrados = useMemo(() => {
        if (!mes || !anio) return prestamos;
        
        return prestamos.filter(prestamo => {
            const fecha = new Date(prestamo.fechaRealizada);
            return (
                fecha.getMonth() + 1 === parseInt(mes) && 
                fecha.getFullYear() === parseInt(anio)
            );
        });
    }, [prestamos, mes, anio]);

    // Cálculo de montos (ahora con filtros)
    const calcularMontos = useMemo(() => {
        const montos = {
            totalPrestado: 0,
            totalCobrado: 0,
            totalACobrar: 0,
            totalPerdido: 0,
            interesesGenerados: 0,
            efectivo: 0,
            transferencia: 0,
            tarjeta_credito: 0,
            tarjeta_debito: 0
        };

        prestamosFiltrados.forEach(prestamo => {
            montos.totalPrestado += prestamo.producto.detalle.prestamo?.montoPrestado || 0;
            
            prestamo.cuotas.forEach(cuota => {
                if (cuota.estado_cuota === "pago") {
                    montos.totalCobrado += cuota.montoCuota || 0;
                    if (cuota.metodoPago && montos[cuota.metodoPago] !== undefined) {
                        montos[cuota.metodoPago] += cuota.montoCuota;
                    }
                } else if (cuota.estado_cuota === "pendiente" || cuota.estado_cuota === "impago") {
                    montos.totalACobrar += cuota.montoCuota || 0;
                } else if (cuota.estado_cuota === "no pagado") {
                    montos.totalPerdido += cuota.montoCuota || 0;
                }
            });

            montos.interesesGenerados = montos.totalCobrado - montos.totalPrestado;
        });

        return [
            { name: 'Total Prestado', value: montos.totalPrestado },
            { name: 'Total Cobrado', value: montos.totalCobrado },
            { name: 'Total a Cobrar', value: montos.totalACobrar },
            { name: 'Intereses Generados', value: Math.max(0, montos.interesesGenerados) },
            { name: 'Total Perdido', value: montos.totalPerdido },
            ...Object.entries({
                efectivo: 'Efectivo',
                transferencia: 'Transferencia',
                tarjeta_credito: 'Tarjeta Crédito',
                tarjeta_debito: 'Tarjeta Débito'
            })
            .filter(([key]) => montos[key] > 0)
            .map(([key, label]) => ({ name: label, value: montos[key] }))
        ];
    }, [prestamosFiltrados]);

    // Formateador de fechas
    const formatFechaArgentina = (fecha) => {
        if (!fecha) return "No disponible";
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };
  

    if (!prestamos || prestamos.length === 0) {
        return <Alert variant="info">No hay préstamos registrados.</Alert>;
    }

    return (
        <div>
            <Container>

                {/* 🔍 Filtros de Año/Mes */}
                <Form className="mb-3">
                    <Row>
                        <Form.Group className="col-md-6" controlId="formMes">
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
                        <Form.Group className="col-md-6" controlId="formAnio">
                            <Form.Label>Año</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={anio} 
                                onChange={(e) => setAnio(e.target.value)}
                            >
                                <option value="">Todos los años</option>
                                {[...Array(new Date().getFullYear() - 2022 + 1)].map((_, i) => {
                                    const year = 2023 + i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Row>
                </Form>

            {/* Gráfico general */}
            <PieChartComponent
                data={calcularMontos}
                title="Resumen de Préstamos"
            />

             {/* 🔘 Botón de detalles */}
                {prestamosFiltrados.length > 0 && (
                    <div className="text-center my-4">
                        <Button
                            variant="primary"
                            onClick={() => setMostrarDetalles(!mostrarDetalles)}
                        >
                            {mostrarDetalles ? 'Ocultar detalles' : 'Ver detalles completos'}
                        </Button>
                    </div>
                )}

            {/* Lista de préstamos */}
            {mostrarDetalles && prestamosFiltrados.map((prestamo, index) => {
                const { producto, cuotas, cliente } = prestamo;
                const detallesPrestamo = producto.detalle.prestamo;

                return (
                    <Card key={index} className="mb-3 shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                            <strong>Préstamo #{prestamo.numeroContrato}</strong>
                            <Badge bg="light" text="dark">
                                {prestamo.conducta_o_instancia.toUpperCase()}
                            </Badge>
                        </Card.Header>

                        <Card.Body>
                            {/* Detalles del préstamo */}
                            <ListGroup variant="flush" className="mb-3">
                                <ListGroup.Item>
                                    <strong>Monto Prestado:</strong> ${detallesPrestamo?.montoPrestado?.toLocaleString('es-AR')}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Plazo:</strong> {detallesPrestamo?.plazo?.toUpperCase()}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Fecha de desembolso:</strong> {new Date(prestamo.fechaRealizada).toLocaleDateString('es-AR')}
                                </ListGroup.Item>
                            </ListGroup>

                            {/* Cuotas */}
                            <Accordion>
                                <Accordion.Item eventKey="cuotas">
                                    <Accordion.Header>Ver Cuotas ({cuotas?.length || 0})</Accordion.Header>
                                    <Accordion.Body>
                                        {cuotas?.length > 0 ? (
                                            <ListGroup>
                                                {cuotas.map((cuota, idx) => (
                                                    <ListGroup.Item key={idx}>
                                                        <div className="d-flex justify-content-between">
                                                            <span>
                                                                <strong>Cuota {cuota.numeroCuota}:</strong> ${cuota.montoCuota?.toLocaleString('es-AR')}
                                                            </span>
                                                            <Badge bg={
                                                                cuota.estado_cuota === "pago" ? "success" :
                                                                    cuota.estado_cuota === "no pagado" ? "danger" :
                                                                        "warning" // Para 'impago' y 'pendiente'
                                                            }>
                                                                {cuota.estado_cuota.toUpperCase()} {/* Convertimos a mayúsculas */}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-muted small">
                                                            <span>Vencimiento: {new Date(cuota.fechaCobro).toLocaleDateString('es-AR')}</span>
                                                            {cuota.fechaCobrada && (
                                                                <span> | Cobrada: {new Date(cuota.fechaCobrada).toLocaleDateString('es-AR')}</span>
                                                            )}
                                                        </div>
                                                        {cuota.metodoPago && (
                                                            <small className="text-info">Método: {cuota.metodoPago.toUpperCase()}</small>
                                                        )}
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        ) : (
                                            <Alert variant="secondary">No hay cuotas registradas.</Alert>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                            {/* Datos del Cliente */}
                            <div className="mt-3">
                                <h6>Cliente</h6>
                                <p className="mb-1">
                                    {cliente?.nombre} {cliente?.apellido} | DNI: {cliente?.dni}
                                </p>
                                <p className="text-muted small">
                                    {cliente?.telefono} | {cliente?.email}
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                );
            })}

            </Container>


        </div>
    );
};

export default ListaPrestamos;