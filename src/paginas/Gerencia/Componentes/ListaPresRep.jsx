import React, { useMemo, useState } from "react";
import { Card, Badge, Accordion, ListGroup, Alert, Button, Form, Container, Row } from "react-bootstrap";
import PieChartComponent from "./GraficoTorta";

const ListaPrestamos = ({ prestamos }) => {
    // Estados para filtros y detalles
    const [mes, setMes] = useState("");
    const [anio, setAnio] = useState("");
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    const [filtroPorCuotas, setFiltroPorCuotas] = useState(false);

    // Función para parsear fechas
    const parseFecha = (fechaStr) => {
        if (!fechaStr) return null;
        if (fechaStr instanceof Date) return fechaStr;
        // Si viene como string en formato dd/MM/yyyy
        if (typeof fechaStr === 'string' && fechaStr.includes('/')) {
            const [day, month, year] = fechaStr.split('/').map(Number);
            return new Date(year, month - 1, day);
        }
        return new Date(fechaStr);
    };

    // Filtrar préstamos por año/mes
    const prestamosFiltrados = useMemo(() => {
        if (!mes || !anio) return prestamos;
        
        return prestamos.filter(prestamo => {
            // Si no estamos filtrando por cuotas, mantener el filtro original por fecha de préstamo
            if (!filtroPorCuotas) {
                const fecha = parseFecha(prestamo.fechaRealizada);
                if (!fecha) return false;
                return (
                    fecha.getMonth() + 1 === parseInt(mes) && 
                    fecha.getFullYear() === parseInt(anio)
                );
            }
            
            // Si estamos filtrando por cuotas, verificar si alguna cuota pertenece al mes/año seleccionado
            return prestamo.cuotas?.some(cuota => {
                const fechaCuota = parseFecha(cuota.fechaCobro);
                if (!fechaCuota) return false;
                return (
                    fechaCuota.getMonth() + 1 === parseInt(mes) && 
                    fechaCuota.getFullYear() === parseInt(anio)
                );
            }) || false;
        });
    }, [prestamos, mes, anio, filtroPorCuotas]);

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
            // Solo sumar al total prestado si no estamos filtrando por cuotas
            if (!filtroPorCuotas) {
                montos.totalPrestado += prestamo.producto.detalle.prestamo?.montoPrestado || 0;
            }
            
            prestamo.cuotas.forEach(cuota => {
                // Si estamos filtrando por cuotas, verificar que la cuota pertenezca al mes seleccionado
                const incluirCuota = !filtroPorCuotas || 
                    (() => {
                        const fechaCuota = parseFecha(cuota.fechaCobro);
                        if (!fechaCuota) return false;
                        return (
                            fechaCuota.getMonth() + 1 === parseInt(mes) && 
                            fechaCuota.getFullYear() === parseInt(anio)
                        );
                    })();
                
                if (!incluirCuota) return;
                
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

            // Calcular intereses solo si no estamos filtrando por cuotas
            if (!filtroPorCuotas) {
                montos.interesesGenerados = montos.totalCobrado - montos.totalPrestado;
            }
        });

        // Ajustar las etiquetas según el tipo de filtro
        const labels = filtroPorCuotas 
            ? [
                { name: 'Total Cobrado', value: montos.totalCobrado },
                { name: 'Total a Cobrar', value: montos.totalACobrar },
                { name: 'Total Perdido', value: montos.totalPerdido }
              ]
            : [
                { name: 'Total Prestado', value: montos.totalPrestado },
                { name: 'Total Cobrado', value: montos.totalCobrado },
                { name: 'Total a Cobrar', value: montos.totalACobrar },
                { name: 'Intereses Generados', value: Math.max(0, montos.interesesGenerados) },
                { name: 'Total Perdido', value: montos.totalPerdido }
              ];

              

              

        return [
            ...labels,
            ...Object.entries({
                efectivo: 'Efectivo',
                transferencia: 'Transferencia',
                tarjeta_credito: 'Tarjeta Crédito',
                tarjeta_debito: 'Tarjeta Débito'
            })
            .filter(([key]) => montos[key] > 0)
            .map(([key, label]) => ({ name: label, value: montos[key] }))
        ];
    }, [prestamosFiltrados, filtroPorCuotas, mes, anio]);

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
                {/* 🔍 Filtros de Año/Mes con opción de filtrar por cuotas */}
                <Form className="mb-3">
                    <Row>
                        <Form.Group className="col-md-4" controlId="formMes">
                            <Form.Label>Mes</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={mes} 
                                onChange={(e) => setMes(e.target.value)}
                            >
                                <option value="">Seleccione un mes</option>
                                {[...Array(12).keys()].map((i) => (
                                    <option key={i} value={i + 1}>
                                        {new Date(0, i).toLocaleString('es-AR', { month: 'long' })}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="col-md-4" controlId="formAnio">
                            <Form.Label>Año</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={anio} 
                                onChange={(e) => setAnio(e.target.value)}
                            >
                                <option value="">Seleccione un año</option>
                                {[...Array(new Date().getFullYear() - 2022 + 1)].map((_, i) => {
                                    const year = 2023 + i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="col-md-4" controlId="formFiltro">
                            <Form.Label>Tipo de filtro</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={filtroPorCuotas} 
                                onChange={(e) => setFiltroPorCuotas(e.target.value === "true")}
                            >
                                <option value="false">Por fecha de préstamo</option>
                                <option value="true">Por cuotas del mes</option>
                            </Form.Control>
                        </Form.Group>
                    </Row>
                </Form>

                {/* Resumen del filtrado */}
                {mes && anio && (
                    <Alert variant="info" className="mb-4">
                        {filtroPorCuotas 
                            ? `Mostrando préstamos con cuotas que vencen en ${new Date(0, parseInt(mes) - 1).toLocaleString('es-AR', { month: 'long' })} de ${anio}`
                            : `Mostrando préstamos realizados en ${new Date(0, parseInt(mes) - 1).toLocaleString('es-AR', { month: 'long' })} de ${anio}`}
                        <br />
                        <strong>Total de préstamos:</strong> {prestamosFiltrados.length}
                    </Alert>
                )}

                {/* Gráfico general */}
                <PieChartComponent
                    data={calcularMontos}
                    title={filtroPorCuotas ? "Resumen de Cuotas del Mes" : "Resumen de Préstamos"}
                />

                {/* 🔘 Botón de detalles */}
                {prestamosFiltrados.length > 0 && (
                    <div className="text-center my-4">
                        <Button
                            variant={mostrarDetalles ? "secondary" : "primary"}
                            onClick={() => setMostrarDetalles(!mostrarDetalles)}
                            className="me-2"
                        >
                            {mostrarDetalles ? 'Ocultar detalles' : 'Ver detalles completos'}
                        </Button>
                    </div>
                )}

                {/* Lista de préstamos */}
                {mostrarDetalles && prestamosFiltrados.map((prestamo, index) => {
                    const { producto, cuotas = [], cliente } = prestamo;
                    const detallesPrestamo = producto.detalle.prestamo;

                    return (
                        <Card key={index} className="mb-3 shadow-sm">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                                <div>
                                    <strong>Préstamo #{prestamo.numeroContrato}</strong>
                                    <br />
                                    <small>{formatFechaArgentina(prestamo.fechaRealizada)}</small>
                                </div>
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
                                </ListGroup>

                                {/* Resumen de cuotas */}
                                <div className="mb-3 p-3 bg-light rounded">
                                    <h6>Resumen de cuotas</h6>
                                    <div className="d-flex flex-wrap gap-3">
                                        <div>
                                            <strong>Total:</strong> {cuotas.length}
                                        </div>
                                        <div>
                                            <strong>Pagadas:</strong> {cuotas.filter(c => c.estado_cuota === "pago").length}
                                        </div>
                                        <div>
                                            <strong>Pendientes:</strong> {cuotas.filter(c => c.estado_cuota === "pendiente" || c.estado_cuota === "impago").length}
                                        </div>
                                        <div>
                                            <strong>No pagadas:</strong> {cuotas.filter(c => c.estado_cuota === "no pagado").length}
                                        </div>
                                    </div>
                                </div>

                                {/* Cuotas */}
                                <Accordion>
                                    <Accordion.Item eventKey="cuotas">
                                        <Accordion.Header>Ver detalle de cuotas ({cuotas.length})</Accordion.Header>
                                        <Accordion.Body>
                                            {cuotas.length > 0 ? (
                                                <ListGroup>
                                                    {cuotas.map((cuota, idx) => {
                                                        const esCuotaDelMes = filtroPorCuotas && mes && anio && cuota.fechaCobro 
                                                            ? (() => {
                                                                const fechaCuota = parseFecha(cuota.fechaCobro);
                                                                if (!fechaCuota) return false;
                                                                return (
                                                                    fechaCuota.getMonth() + 1 === parseInt(mes) && 
                                                                    fechaCuota.getFullYear() === parseInt(anio)
                                                                );
                                                            })()
                                                            : false;
                                                        
                                                        return (
                                                            <ListGroup.Item 
                                                                key={idx} 
                                                                className={esCuotaDelMes ? "bg-light" : ""}
                                                            >
                                                                <div className="d-flex justify-content-between">
                                                                    <span>
                                                                        <strong>Cuota {cuota.numeroCuota}:</strong> ${cuota.montoCuota?.toLocaleString('es-AR')}
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            Vencimiento: {formatFechaArgentina(cuota.fechaCobro)}
                                                                            {esCuotaDelMes && <span className="text-primary"> (Este mes)</span>}
                                                                        </small>
                                                                    </span>
                                                                    <Badge bg={
                                                                        cuota.estado_cuota === "pago" ? "success" :
                                                                            cuota.estado_cuota === "no pagado" ? "danger" :
                                                                                "warning"
                                                                    }>
                                                                        {cuota.estado_cuota.toUpperCase()}
                                                                    </Badge>
                                                                </div>
                                                                {cuota.fechaCobrada && (
                                                                    <small className="text-muted">Cobrada: {formatFechaArgentina(cuota.fechaCobrada)}</small>
                                                                )}
                                                                {cuota.metodoPago && (
                                                                    <small className="text-info d-block">Método: {cuota.metodoPago.toUpperCase()}</small>
                                                                )}
                                                            </ListGroup.Item>
                                                        );
                                                    })}
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