import React, { useMemo, useState } from "react";
import { Card, Badge, Accordion, ListGroup, Alert, Button, Form, Row, Container } from "react-bootstrap";
import PieChartComponent from "./GraficoTorta";


const ListaVentasSistema = ({ ventas }) => {

        // Estados para filtros y detalles
    const [mes, setMes] = useState("");
    const [anio, setAnio] = useState("");
    const [mostrarDetalles, setMostrarDetalles] = useState(false);

    // Filtrar ventas por año/mes
    const ventasFiltradas = useMemo(() => {
        if (!mes || !anio) return ventas;
        
        return ventas.filter(venta => {
            const fecha = new Date(venta.fechaRealizada); // Asegúrate de que tu objeto venta tenga este campo
            return (
                fecha.getMonth() + 1 === parseInt(mes) && 
                fecha.getFullYear() === parseInt(anio)
            );
        });
    }, [ventas, mes, anio]);


    // Calculamos montos para el gráfico
   // Cálculo de montos (usando ventasFiltradas ahora)
    const calcularMontos = useMemo(() => {
        const montos = {
            totalVendido: 0,
            totalCobrado: 0,
            totalACobrar: 0,
            totalPerdido: 0,
            efectivo: 0,
            transferencia: 0,
            tarjeta_credito: 0,
            tarjeta_debito: 0,
            dolares: 0,
            usdt: 0
        };

        ventasFiltradas.forEach(venta => {
            montos.totalVendido += venta.monto_suscripcion_vta_dir || 0;
            venta.cuotas.forEach(cuota => {
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
        });

        return [
            { name: 'Total Vendido', value: montos.totalVendido },
            { name: 'Total Cobrado', value: montos.totalCobrado },
            { name: 'Total a Cobrar', value: montos.totalACobrar },
            { name: 'Total Perdido', value: montos.totalPerdido },
            ...Object.entries({
                efectivo: 'Efectivo',
                transferencia: 'Transferencia',
                tarjeta_credito: 'Tarjeta Crédito',
                tarjeta_debito: 'Tarjeta Débito',
                dolares: 'Dólares',
                usdt: 'USDT'
            })
            .filter(([key]) => montos[key] > 0)
            .map(([key, label]) => ({ name: label, value: montos[key] }))
        ];
    }, [ventasFiltradas]);

     // Formateador de fechas
    const formatFechaArgentina = (fecha) => {
        if (!fecha) return "No disponible";
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };


    if (!ventas || ventas.length === 0) {
        return <Alert variant="info">No hay ventas registradas.</Alert>;
    }

    return (
        <div>
<Container>
    {/* 🔍 Filtros de Año/Mes (igual que en ListaDeProductos) */}
            <Form className="mb-3">
                <Row>
                    <Form.Group className="col-md-6" controlId="formMes">
                        <Form.Label> </Form.Label>
                        <Form.Control as="select" value={mes} onChange={(e) => setMes(e.target.value)}>
                            <option value="">Seleccione un mes</option>
                            {[...Array(12).keys()].map((i) => (
                                <option key={i} value={i + 1}>
                                    {new Date(0, i).toLocaleString('es-AR', { month: 'long' })}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="col-md-6" controlId="formAnio">
                        <Form.Label> </Form.Label>
                        <Form.Control as="select" value={anio} onChange={(e) => setAnio(e.target.value)}>
                            <option value="">Seleccione un año</option>
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
                title="Resumen de Ventas"
            />

                {/* 🔘 Botón de detalles (solo si hay ventas filtradas) */}
            {ventasFiltradas.length > 0 && (
                <div className="text-center my-4">
                    <Button 
                        variant="primary" 
                        onClick={() => setMostrarDetalles(!mostrarDetalles)}
                    >
                        {mostrarDetalles ? 'Ocultar detalles' : 'Ver detalles completos'}
                    </Button>
                </div>
            )}

            {/* Lista de ventas */}
            {mostrarDetalles && ventasFiltradas.map((venta, index) => {
                const { producto, cuotas, cliente } = venta;
                const esPermutada = producto.detalle.venta?.banderas.permutada;

                return (
                    <Card key={index} className="mb-3 shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-success text-white">
                            <strong>Venta #{venta.numeroContrato}</strong>
                            <Badge bg="light" text="dark">
                                {venta.conducta_o_instancia.toUpperCase()}
                            </Badge>
                        </Card.Header>

                        <Card.Body>
                            {/* Detalles de la venta */}
                            <ListGroup variant="flush" className="mb-3">
                                <ListGroup.Item>
                                    <strong>Tipo:</strong> {venta.producto.nombre}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Monto:</strong> ${venta.monto_suscripcion_vta_dir?.toLocaleString('es-AR')} <p className="text-muted small">
                                        se muestra el monto total de la suscripcion o de la , sin haber restado las comisiones.
                                    </p>
                                </ListGroup.Item>
                                {esPermutada && (
                                    <ListGroup.Item>
                                        <strong>Objeto recibido:</strong> {producto.detalle.venta.objetoRecibido} (${producto.detalle.venta.montoObjetoRecibido})
                                    </ListGroup.Item>
                                )}
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
                                                                <strong>Cuota {cuota.numeroCuota}:</strong> ${cuota.montoCuota}
                                                            </span>
                                                            <Badge bg={
                                                                cuota.estado_cuota === "pago" ? "success" :
                                                                    cuota.estado_cuota === "no pagado" ? "danger" :
                                                                        "warning" // Para 'impago' y 'pendiente'
                                                            }>
                                                                {cuota.estado_cuota.toUpperCase()} {/* Convertimos a mayúsculas */}
                                                            </Badge>
                                                        </div>
                                                        {cuota.metodoPago && (
                                                            <small className="text-muted">Método: {cuota.metodoPago}</small>
                                                        )}
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        ) : (
                                            <Alert variant="secondary">No hay cuotas asociadas.</Alert>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                            {/* Cliente (compacto) */}
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

export default ListaVentasSistema;