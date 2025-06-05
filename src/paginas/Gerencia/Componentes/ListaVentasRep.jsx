import React, { useMemo, useState } from "react";
import { Card, Badge, Accordion, ListGroup, Alert, Button, Form, Row, Container } from "react-bootstrap";
import PieChartComponent from "./GraficoTorta";

const ListaVentasSistema = ({ ventas }) => {
    // Estados para filtros y detalles
    const [mes, setMes] = useState("");
    const [anio, setAnio] = useState("");
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    const [filtroPorCuotas, setFiltroPorCuotas] = useState(false);

    // Función para parsear fechas (ya que vienen como strings desde el backend)
    const parseFecha = (fechaStr) => {
        if (!fechaStr) return null;
        // Formato esperado: "dd/MM/yyyy"
        const [day, month, year] = fechaStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    // Filtrar ventas por año/mes
    const ventasFiltradas = useMemo(() => {
        if (!mes || !anio) return ventas;

        return ventas.filter(venta => {
            // Si no estamos filtrando por cuotas, mantener el filtro original por fecha de venta
            if (!filtroPorCuotas) {
                const fecha = parseFecha(venta.fechaVenta);
                if (!fecha) return false;
                return (
                    fecha.getMonth() + 1 === parseInt(mes) &&
                    fecha.getFullYear() === parseInt(anio)
                );
            }

            // Si estamos filtrando por cuotas, verificar si alguna cuota pertenece al mes/año seleccionado
            return venta.cuotas?.some(cuota => {
                const fechaCuota = parseFecha(cuota.fechaCobro);
                if (!fechaCuota) return false;
                return (
                    fechaCuota.getMonth() + 1 === parseInt(mes) &&
                    fechaCuota.getFullYear() === parseInt(anio)
                );
            }) || false;
        });
    }, [ventas, mes, anio, filtroPorCuotas]);

    // Calculamos montos para el gráfico
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
            // Solo sumar al total vendido si no estamos filtrando por cuotas
            if (!filtroPorCuotas) {
                montos.totalVendido += venta.monto_suscripcion_vta_dir || 0;
            }

            venta.cuotas?.forEach(cuota => {
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
                    if (cuota.metodoPago) {
                        const metodoNormalizado = cuota.metodoPago.toLowerCase().replace(/ /g, '_');
                        if (montos[metodoNormalizado] !== undefined) {
                            montos[metodoNormalizado] += cuota.montoCuota;
                        }
                    }
                } else if (cuota.estado_cuota === "pendiente" || cuota.estado_cuota === "impago") {
                    montos.totalACobrar += cuota.montoCuota || 0;
                } else if (cuota.estado_cuota === "no pagado") {
                    montos.totalPerdido += cuota.montoCuota || 0;
                }
            });
        });

        // Si estamos filtrando por cuotas, ajustamos las etiquetas
        const labels = filtroPorCuotas
            ? [
                { name: 'Total Cobrado', value: montos.totalCobrado }, // ¡Exacto como en COLORS_MAP!
                { name: 'Total a Cobrar', value: montos.totalACobrar }, // ¡Exacto!
                { name: 'Total Perdido', value: montos.totalPerdido }
            ]
            : [
                { name: 'Total Vendido', value: montos.totalVendido }, // Cambiado a "Total Prestado"
                { name: 'Total Cobrado', value: montos.totalCobrado },
                { name: 'Total a Cobrar', value: montos.totalACobrar },
                { name: 'Total Perdido', value: montos.totalPerdido }
            ];

        return [
            ...labels,
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
    }, [ventasFiltradas, filtroPorCuotas, mes, anio]);

    // Función para obtener el estado de la venta basado en sus cuotas
    const getEstadoVenta = (cuotas) => {
        if (!cuotas || cuotas.length === 0) return "Sin cuotas";

        const todasPagas = cuotas.every(c => c.estado_cuota === "pago");
        const algunaPendiente = cuotas.some(c => c.estado_cuota === "pendiente" || c.estado_cuota === "impago");
        const algunaNoPagada = cuotas.some(c => c.estado_cuota === "no pagado");

        if (todasPagas) return "Completamente pagada";
        if (algunaNoPagada) return "Con mora";
        if (algunaPendiente) return "Pendiente de pago";

        return "Estado desconocido";
    };

    if (!ventas || ventas.length === 0) {
        return <Alert variant="info">No hay ventas registradas.</Alert>;
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
                                <option value="false">Por fecha de venta</option>
                                <option value="true">Por cuotas del mes</option>
                            </Form.Control>
                        </Form.Group>
                    </Row>
                </Form>

                {/* Resumen del filtrado */}
                {mes && anio && (
                    <Alert variant="info" className="mb-4">
                        {filtroPorCuotas
                            ? `Mostrando ventas con cuotas que vencen en ${new Date(0, parseInt(mes) - 1).toLocaleString('es-AR', { month: 'long' })} de ${anio}`
                            : `Mostrando ventas realizadas en ${new Date(0, parseInt(mes) - 1).toLocaleString('es-AR', { month: 'long' })} de ${anio}`}
                        <br />
                        <strong>Total de ventas:</strong> {ventasFiltradas.length}
                    </Alert>
                )}

                {/* Gráfico general */}
                <PieChartComponent
                    data={calcularMontos}
                    title={filtroPorCuotas ? "Resumen de Cuotas del Mes" : "Resumen de Ventas"}
                />

                {/* 🔘 Botón de detalles */}
                {ventasFiltradas.length > 0 && (
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

                {/* Lista de ventas */}
                {mostrarDetalles && ventasFiltradas.map((venta, index) => {
                    const { producto, cuotas = [], cliente } = venta;
                    const esPermutada = producto?.detalle?.venta?.banderas?.permutada;
                    const estadoVenta = getEstadoVenta(cuotas);

                    return (
                        <Card key={index} className="mb-3 shadow-sm">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-success text-white">
                                <div>
                                    <strong>Venta #{venta.numeroContrato}</strong>
                                    <br />
                                    <small>{venta.fechaVenta}</small>
                                </div>
                                <div className="text-end">
                                    <Badge bg="light" text="dark" className="me-1">
                                        {venta.conducta_o_instancia?.toUpperCase() || 'SIN ESTADO'}
                                    </Badge>
                                    <Badge bg={
                                        estadoVenta === "Completamente pagada" ? "success" :
                                            estadoVenta === "Con mora" ? "danger" :
                                                "warning"
                                    }>
                                        {estadoVenta}
                                    </Badge>
                                </div>
                            </Card.Header>

                            <Card.Body>
                                {/* Detalles de la venta */}
                                <ListGroup variant="flush" className="mb-3">
                                    <ListGroup.Item>
                                        <strong>Tipo:</strong> {producto?.nombre || 'No especificado'}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>Monto 1 (Suscripción/Vta Directa):</strong>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-2">${(venta.monto_suscripcion_vta_dir || 0).toLocaleString('es-AR')}</span>
                                                    {venta.metodoPago_monto_sus_vta && (
                                                        <Badge bg="info" className="text-capitalize">
                                                            {venta.metodoPago_monto_sus_vta.toLowerCase().replace(/_/g, ' ')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </ListGroup.Item>

                                    {venta.monto_2 > 0 && (
                                        <ListGroup.Item>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>Monto 2:</strong>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">${(venta.monto_2 || 0).toLocaleString('es-AR')}</span>
                                                        {venta.metodoPago_2 && (
                                                            <Badge bg="info" className="text-capitalize">
                                                                {venta.metodoPago_2.toLowerCase().replace(/_/g, ' ')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    )}

                                    {venta.monto_3 > 0 && (
                                        <ListGroup.Item>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>Monto 3:</strong>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">${(venta.monto_3 || 0).toLocaleString('es-AR')}</span>
                                                        {venta.metodoPago_3 && (
                                                            <Badge bg="info" className="text-capitalize">
                                                                {venta.metodoPago_3.toLowerCase().replace(/_/g, ' ')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    )}

                                    <ListGroup.Item>
                                        <strong>Total:</strong> ${(
                                            (venta.monto_suscripcion_vta_dir || 0) +
                                            (venta.monto_2 || 0) +
                                            (venta.monto_3 || 0)
                                        ).toLocaleString('es-AR')}
                                    </ListGroup.Item>
                                    {esPermutada && (
                                        <ListGroup.Item>
                                            <strong>Objeto recibido:</strong> {producto.detalle.venta.objetoRecibido || 'No especificado'}
                                            (${(producto.detalle.venta.montoObjetoRecibido || 0).toLocaleString('es-AR')})
                                        </ListGroup.Item>
                                    )}
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
                                                                        <strong>Cuota {cuota.numeroCuota}:</strong> ${(cuota.montoCuota || 0).toLocaleString('es-AR')}
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            Fecha cobro: {cuota.fechaCobro || 'No especificada'}
                                                                            {esCuotaDelMes && <span className="text-primary"> (Este mes)</span>}
                                                                        </small>
                                                                    </span>
                                                                    <Badge bg={
                                                                        cuota.estado_cuota === "pago" ? "success" :
                                                                            cuota.estado_cuota === "no pagado" ? "danger" :
                                                                                "warning"
                                                                    }>
                                                                        {cuota.estado_cuota?.toUpperCase() || 'SIN ESTADO'}
                                                                    </Badge>
                                                                </div>
                                                                {cuota.metodoPago && (
                                                                    <small className="text-muted">Método: {cuota.metodoPago}</small>
                                                                )}
                                                            </ListGroup.Item>
                                                        );
                                                    })}
                                                </ListGroup>
                                            ) : (
                                                <Alert variant="secondary">No hay cuotas asociadas.</Alert>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                                {/* Cliente */}
                                <div className="mt-3">
                                    <h6>Cliente</h6>
                                    <p className="mb-1">
                                        {cliente?.nombre || 'No especificado'} {cliente?.apellido || ''} | DNI: {cliente?.dni || 'No especificado'}
                                    </p>
                                    <p className="text-muted small">
                                        {cliente?.telefono || 'Sin teléfono'} | {cliente?.email || 'Sin email'}
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