import React, { useMemo, useState } from "react";
import { 
    Card, 
    Badge, 
    Alert, 
    Button, 
    Form, 
    Row, 
    Col,
    Container,
    Table,
    Modal
} from "react-bootstrap";
import PieChartComponent from "./GraficoTorta";

const ListaCuotasCobranza = ({ ventas }) => {
    // Estados para determinar qué vista mostrar
    const [vistaActual, setVistaActual] = useState("cuotas"); // "cuotas" o "reporte"
    
    // Estados para filtros de CUOTAS
    const [fechaSeleccionada, setFechaSeleccionada] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("dia");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [mostrarSoloPendientes, setMostrarSoloPendientes] = useState(true);
    const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
    const [showDetallesCuota, setShowDetallesCuota] = useState(false);
    
    // Estados para el REPORTE de clientes x venta
    const [mesReporte, setMesReporte] = useState("");
    const [anioReporte, setAnioReporte] = useState("");

    // Función para parsear fechas
    const parseFecha = (fechaStr) => {
        if (!fechaStr) return null;
        const [day, month, year] = fechaStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    // Obtener todas las cuotas de las ventas
    const todasLasCuotas = useMemo(() => {
        const cuotas = [];
        
        ventas.forEach(venta => {
            venta.cuotas?.forEach(cuota => {
                cuotas.push({
                    ...cuota,
                    venta: {
                        numeroContrato: venta.numeroContrato,
                        cliente: venta.cliente,
                        producto: venta.producto,
                        fechaVenta: venta.fechaVenta,
                        conducta_o_instancia: venta.conducta_o_instancia,
                        monto_suscripcion_vta_dir: venta.monto_suscripcion_vta_dir,
                        metodoPago_monto_sus_vta: venta.metodoPago_monto_sus_vta
                    }
                });
            });
        });
        
        return cuotas;
    }, [ventas]);

    // Filtrar cuotas según los criterios seleccionados - CORREGIDO
    const cuotasFiltradas = useMemo(() => {
        if (!todasLasCuotas.length) return [];

        return todasLasCuotas.filter(cuota => {
            const fechaCuota = parseFecha(cuota.fechaCobro);
            if (!fechaCuota) return false;

            // Filtro por estado
            if (mostrarSoloPendientes && cuota.estado_cuota === "pago") {
                return false;
            }

            // Filtro por fecha - CORRECCIONES AQUÍ
            if (tipoFiltro === "dia" && fechaSeleccionada) {
                const fechaSeleccionadaObj = new Date(fechaSeleccionada);
                return (
                    fechaCuota.getDate() === fechaSeleccionadaObj.getDate() &&
                    fechaCuota.getMonth() === fechaSeleccionadaObj.getMonth() &&
                    fechaCuota.getFullYear() === fechaSeleccionadaObj.getFullYear()
                );
            }

            if (tipoFiltro === "mes" && fechaSeleccionada) {
                // fechaSeleccionada viene como "YYYY-MM" (ej: "2025-04")
                const [year, month] = fechaSeleccionada.split('-').map(Number);
                return (
                    fechaCuota.getMonth() + 1 === month && // +1 porque getMonth() devuelve 0-11
                    fechaCuota.getFullYear() === year
                );
            }

            if (tipoFiltro === "rango" && fechaInicio && fechaFin) {
                const inicio = new Date(fechaInicio);
                const fin = new Date(fechaFin);
                // Ajustar fin para incluir todo el día
                fin.setHours(23, 59, 59, 999);
                return fechaCuota >= inicio && fechaCuota <= fin;
            }

            // Si no hay filtro de fecha, mostrar todas
            return !fechaSeleccionada && !fechaInicio && !fechaFin;
        }).sort((a, b) => {
            const fechaA = parseFecha(a.fechaCobro);
            const fechaB = parseFecha(b.fechaCobro);
            return fechaA - fechaB;
        });
    }, [todasLasCuotas, fechaSeleccionada, tipoFiltro, fechaInicio, fechaFin, mostrarSoloPendientes]);

    // Filtrar ventas para el reporte de clientes
    const ventasFiltradasReporte = useMemo(() => {
        if (!mesReporte || !anioReporte) return [];
        
        return ventas.filter(venta => {
            const fechaVenta = parseFecha(venta.fechaVenta);
            if (!fechaVenta) return false;
            
            return (
                fechaVenta.getMonth() + 1 === parseInt(mesReporte) &&
                fechaVenta.getFullYear() === parseInt(anioReporte)
            );
        });
    }, [ventas, mesReporte, anioReporte]);

    // Calcular montos para el resumen de CUOTAS
    const resumenMontos = useMemo(() => {
        const montos = {
            totalACobrar: 0,
            totalCobrado: 0,
            totalVendido: 0,
            cuotasPendientes: 0,
            cuotasPagadas: 0
        };

        cuotasFiltradas.forEach(cuota => {
            if (cuota.estado_cuota === "pago") {
                montos.totalCobrado += cuota.montoCuota || 0;
                montos.cuotasPagadas++;
            } else {
                montos.totalACobrar += cuota.montoCuota || 0;
                montos.cuotasPendientes++;
            }
        });

        const ventasFiltradasIds = [...new Set(cuotasFiltradas.map(c => c.venta.numeroContrato))];
        ventas.forEach(venta => {
            if (ventasFiltradasIds.includes(venta.numeroContrato)) {
                montos.totalVendido += venta.monto_suscripcion_vta_dir || 0;
            }
        });

        return montos;
    }, [cuotasFiltradas, ventas]);

    // Calcular resumen para el REPORTE de clientes
    const resumenReporteClientes = useMemo(() => {
        const totalVentas = ventasFiltradasReporte.length;
        const totalMontoVendido = ventasFiltradasReporte.reduce((sum, venta) => 
            sum + (venta.monto_suscripcion_vta_dir || 0), 0
        );
        
        const clientesUnicos = [...new Set(ventasFiltradasReporte.map(v => v.cliente?.dni))].length;

        return {
            totalVentas,
            totalMontoVendido,
            clientesUnicos
        };
    }, [ventasFiltradasReporte]);

    // Datos para el gráfico principal
    const datosGraficoCuotas = useMemo(() => {
        return [
            { name: 'Total a Cobrar', value: resumenMontos.totalACobrar },
            { name: 'Total Cobrado', value: resumenMontos.totalCobrado },
            { name: 'Total Vendido', value: resumenMontos.totalVendido }
        ];
    }, [resumenMontos]);

    const datosGraficoReporte = useMemo(() => {
        return [
            { name: 'Total Ventas', value: resumenReporteClientes.totalVentas },
            { name: 'Monto Vendido', value: resumenReporteClientes.totalMontoVendido },
            { name: 'Clientes Únicos', value: resumenReporteClientes.clientesUnicos }
        ];
    }, [resumenReporteClientes]);

    // Función para obtener badge de estado
    const getEstadoBadge = (estado) => {
        const config = {
            'pago': { bg: 'success', text: 'PAGADO' },
            'pendiente': { bg: 'warning', text: 'PENDIENTE' },
            'no pagado': { bg: 'danger', text: 'NO PAGADO' },
            'impago': { bg: 'secondary', text: 'IMPAGO' }
        }[estado] || { bg: 'light', text: 'SIN ESTADO' };

        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    // Función para formatear la fecha del filtro para mostrar
    const getTextoFiltroFecha = () => {
        if (tipoFiltro === "dia" && fechaSeleccionada) {
            const fecha = new Date(fechaSeleccionada);
            return fecha.toLocaleDateString('es-AR');
        }
        
        if (tipoFiltro === "mes" && fechaSeleccionada) {
            const [year, month] = fechaSeleccionada.split('-');
            const fecha = new Date(year, month - 1);
            return fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
        }
        
        if (tipoFiltro === "rango" && fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            return `${inicio.toLocaleDateString('es-AR')} - ${fin.toLocaleDateString('es-AR')}`;
        }
        
        return "Todas las fechas";
    };

    // Modal de detalles de cuota
    const ModalDetallesCuota = () => (
        <Modal show={showDetallesCuota} onHide={() => setShowDetallesCuota(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Detalles de Cuota</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {cuotaSeleccionada && (
                    <div>
                        <h6>Información de la Cuota</h6>
                        <Table bordered>
                            <tbody>
                                <tr>
                                    <td><strong>Número de Cuota:</strong></td>
                                    <td>{cuotaSeleccionada.numeroCuota}</td>
                                </tr>
                                <tr>
                                    <td><strong>Monto:</strong></td>
                                    <td>${(cuotaSeleccionada.montoCuota || 0).toLocaleString('es-AR')}</td>
                                </tr>
                                <tr>
                                    <td><strong>Fecha de Cobro:</strong></td>
                                    <td>{cuotaSeleccionada.fechaCobro}</td>
                                </tr>
                                <tr>
                                    <td><strong>Estado:</strong></td>
                                    <td>{getEstadoBadge(cuotaSeleccionada.estado_cuota)}</td>
                                </tr>
                                {cuotaSeleccionada.comentario && (
                                    <tr>
                                        <td><strong>Comentario:</strong></td>
                                        <td>{cuotaSeleccionada.comentario}</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                        
                        <h6 className="mt-3">Información de la Venta</h6>
                        <Table bordered>
                            <tbody>
                                <tr>
                                    <td><strong>Contrato:</strong></td>
                                    <td>{cuotaSeleccionada.venta.numeroContrato}</td>
                                </tr>
                                <tr>
                                    <td><strong>Cliente:</strong></td>
                                    <td>{cuotaSeleccionada.venta.cliente?.nombre} {cuotaSeleccionada.venta.cliente?.apellido}</td>
                                </tr>
                                <tr>
                                    <td><strong>Producto:</strong></td>
                                    <td>{cuotaSeleccionada.venta.producto?.nombre}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );

    // Limpiar filtros
    const limpiarFiltrosCuotas = () => {
        setFechaSeleccionada("");
        setFechaInicio("");
        setFechaFin("");
        setTipoFiltro("dia");
    };

    if (!ventas || ventas.length === 0) {
        return <Alert variant="info">No hay ventas registradas.</Alert>;
    }

    return (
        <Container fluid>
            {/* BOTÓN PARA CAMBIAR DE VISTA */}
            <div className="text-center mb-4">
                <Button 
                    variant={vistaActual === "cuotas" ? "primary" : "outline-primary"}
                    className="me-2"
                    onClick={() => setVistaActual("cuotas")}
                >
                    📋 Vista de Cuotas
                </Button>
                <Button 
                    variant={vistaActual === "reporte" ? "info" : "outline-info"}
                    onClick={() => setVistaActual("reporte")}
                >
                    📊 Reporte Cliente x Venta
                </Button>
            </div>

            {vistaActual === "cuotas" ? (
                /* ========== VISTA DE CUOTAS ========== */
                <>
                    {/* 🎛️ Panel de Filtros de Cuotas */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Filtros de Cobranza</h5>
                            <div>
                                <small className="me-3">
                                    <strong>Filtro activo:</strong> {getTextoFiltroFecha()}
                                </small>
                                <Button 
                                    variant="outline-light" 
                                    size="sm"
                                    onClick={limpiarFiltrosCuotas}
                                    disabled={!fechaSeleccionada && !fechaInicio}
                                >
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Tipo de Filtro</Form.Label>
                                        <Form.Select
                                            value={tipoFiltro}
                                            onChange={(e) => {
                                                setTipoFiltro(e.target.value);
                                                // Limpiar fechas al cambiar tipo de filtro
                                                setFechaSeleccionada("");
                                                setFechaInicio("");
                                                setFechaFin("");
                                            }}
                                        >
                                            <option value="dia">Día específico</option>
                                            <option value="mes">Mes completo</option>
                                            <option value="rango">Rango de fechas</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {tipoFiltro === "dia" && (
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Seleccionar Día</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={fechaSeleccionada}
                                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                )}

                                {tipoFiltro === "mes" && (
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Seleccionar Mes y Año</Form.Label>
                                            <Form.Control
                                                type="month"
                                                value={fechaSeleccionada}
                                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                )}

                                {tipoFiltro === "rango" && (
                                    <>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Fecha Inicio</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={fechaInicio}
                                                    onChange={(e) => setFechaInicio(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Fecha Fin</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={fechaFin}
                                                    onChange={(e) => setFechaFin(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </>
                                )}

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Mostrar</Form.Label>
                                        <Form.Select
                                            value={mostrarSoloPendientes}
                                            onChange={(e) => setMostrarSoloPendientes(e.target.value === "true")}
                                        >
                                            <option value="true">Solo cuotas pendientes o impagas</option>
                                            <option value="false">Todas las cuotas</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* 📊 Resumen de Montos de Cuotas */}
                    <Row className="mb-4">
                        <Col md={8}>
                            <Card className="h-100">
                                <Card.Header>
                                    <h6 className="mb-0">Resumen Financiero</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="text-center">
                                        <Col md={3}>
                                            <div className="border rounded p-3 bg-light">
                                                <h6 className="text-warning">A COBRAR</h6>
                                                <h4>${resumenMontos.totalACobrar.toLocaleString('es-AR')}</h4>
                                                <small>{resumenMontos.cuotasPendientes} cuotas pendientes</small>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <div className="border rounded p-3 bg-light">
                                                <h6 className="text-success">COBRADO</h6>
                                                <h4>${resumenMontos.totalCobrado.toLocaleString('es-AR')}</h4>
                                                <small>{resumenMontos.cuotasPagadas} cuotas pagadas</small>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <div className="border rounded p-3 bg-light">
                                                <h6 className="text-primary">TOTAL VENDIDO</h6>
                                                <h4>${resumenMontos.totalVendido.toLocaleString('es-AR')}</h4>
                                                <small>En ventas filtradas</small>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <div className="border rounded p-3 bg-light">
                                                <h6 className="text-info">CUOTAS</h6>
                                                <h4>{cuotasFiltradas.length}</h4>
                                                <small>Total encontradas</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <PieChartComponent
                                data={datosGraficoCuotas}
                                title="Distribución de Montos"
                                height={200}
                            />
                        </Col>
                    </Row>

                    {/* 📋 Lista de Cuotas */}
                    <Card>
                        <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                Lista de Cuotas {cuotasFiltradas.length > 0 && `(${cuotasFiltradas.length})`}
                            </h5>
                            <div>
                                <Badge bg="light" text="dark" className="me-2">
                                    Filtro: {getTextoFiltroFecha()}
                                </Badge>
                                <Badge bg="light" text="dark">
                                    Total a Cobrar: ${resumenMontos.totalACobrar.toLocaleString('es-AR')}
                                </Badge>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {cuotasFiltradas.length === 0 ? (
                                <Alert variant="info" className="m-3">
                                    No se encontraron cuotas con los filtros seleccionados.
                                </Alert>
                            ) : (
                                <Table responsive striped hover>
                                    <thead className="bg-light">
                                        <tr>
                                            <th># Cuota</th>
                                            <th>Contrato</th>
                                            <th>Cliente</th>
                                            <th>DNI</th>
                                            <th>Teléfono</th>
                                            <th>Producto</th>
                                            <th>Monto</th>
                                            <th>Fecha Cobro</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cuotasFiltradas.map((cuota, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <strong>{cuota.numeroCuota}</strong>
                                                </td>
                                                <td>
                                                    <Badge bg="outline-primary text-dark">
                                                        {cuota.venta.numeroContrato}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {cuota.venta.cliente?.nombre} {cuota.venta.cliente?.apellido}
                                                </td>
                                                <td>{cuota.venta.cliente?.dni}</td>
                                                <td>{cuota.venta.cliente?.telefono || 'N/A'}</td>
                                                <td>
                                                    <small>{cuota.venta.producto?.nombre || 'N/A'}</small>
                                                </td>
                                                <td>
                                                    <strong>
                                                        ${(cuota.montoCuota || 0).toLocaleString('es-AR')}
                                                    </strong>
                                                </td>
                                                <td>{cuota.fechaCobro}</td>
                                                <td>{getEstadoBadge(cuota.estado_cuota)}</td>
                                                <td>
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCuotaSeleccionada(cuota);
                                                            setShowDetallesCuota(true);
                                                        }}
                                                    >
                                                        Ver
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </>
            ) : (
                /* ========== VISTA DE REPORTE ========== */
                <>
                    {/* 📊 Reporte de Clientes x Venta */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">Reporte de Clientes por Venta</h5>
                        </Card.Header>
                        <Card.Body>
                            {/* Filtros del Reporte */}
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Mes</Form.Label>
                                        <Form.Select
                                            value={mesReporte}
                                            onChange={(e) => setMesReporte(e.target.value)}
                                        >
                                            <option value="">Seleccione un mes</option>
                                            {[...Array(12).keys()].map((i) => (
                                                <option key={i} value={i + 1}>
                                                    {new Date(0, i).toLocaleString('es-AR', { month: 'long' })}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Año</Form.Label>
                                        <Form.Select
                                            value={anioReporte}
                                            onChange={(e) => setAnioReporte(e.target.value)}
                                        >
                                            <option value="">Seleccione un año</option>
                                            {[...Array(new Date().getFullYear() - 2022 + 1)].map((_, i) => {
                                                const year = 2023 + i;
                                                return <option key={year} value={year}>{year}</option>;
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <div className="d-flex align-items-end h-100">
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={() => {
                                                setMesReporte("");
                                                setAnioReporte("");
                                            }}
                                            disabled={!mesReporte && !anioReporte}
                                        >
                                            Limpiar Filtros
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            {/* Resumen del Reporte */}
                            <Row className="mb-4">
                                <Col md={8}>
                                    <Card className="h-100">
                                        <Card.Header>
                                            <h6 className="mb-0">Resumen del Reporte</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row className="text-center">
                                                <Col md={4}>
                                                    <div className="border rounded p-3 bg-info text-white">
                                                        <h6>TOTAL VENTAS</h6>
                                                        <h4>{resumenReporteClientes.totalVentas}</h4>
                                                        <small>Ventas realizadas</small>
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="border rounded p-3 bg-success text-white">
                                                        <h6>MONTO VENDIDO</h6>
                                                        <h4>${resumenReporteClientes.totalMontoVendido.toLocaleString('es-AR')}</h4>
                                                        <small>Total facturado</small>
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="border rounded p-3 bg-warning text-dark">
                                                        <h6>CLIENTES ÚNICOS</h6>
                                                        <h4>{resumenReporteClientes.clientesUnicos}</h4>
                                                        <small>Clientes diferentes</small>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <PieChartComponent
                                        data={datosGraficoReporte}
                                        title="Resumen del Reporte"
                                        height={200}
                                    />
                                </Col>
                            </Row>

                            {/* Lista de Ventas del Reporte */}
                            {mesReporte && anioReporte ? (
                                ventasFiltradasReporte.length > 0 ? (
                                    <Card>
                                        <Card.Header className="bg-secondary text-white">
                                            <h6 className="mb-0">
                                                Ventas de {new Date(0, parseInt(mesReporte) - 1).toLocaleString('es-AR', { month: 'long' })} {anioReporte}
                                            </h6>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            <Table responsive striped hover>
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Contrato</th>
                                                        <th>Fecha Venta</th>
                                                        <th>Cliente</th>
                                                        <th>DNI</th>
                                                        <th>Teléfono</th>
                                                        <th>Producto</th>
                                                        <th>Monto</th>
                                                        <th>Método Pago</th>
                                                        <th>Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ventasFiltradasReporte.map((venta, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <Badge bg="outline-primary text-dark">
                                                                    {venta.numeroContrato}
                                                                </Badge>
                                                            </td>
                                                            <td>{venta.fechaVenta}</td>
                                                            <td>
                                                                {venta.cliente?.nombre} {venta.cliente?.apellido}
                                                            </td>
                                                            <td>{venta.cliente?.dni}</td>
                                                            <td>{venta.cliente?.telefono || 'N/A'}</td>
                                                            <td>
                                                                <small>{venta.producto?.nombre || 'N/A'}</small>
                                                            </td>
                                                            <td>
                                                                <strong>
                                                                    ${(venta.monto_suscripcion_vta_dir || 0).toLocaleString('es-AR')}
                                                                </strong>
                                                            </td>
                                                            <td>
                                                                <Badge bg="info" className="text-capitalize">
                                                                    {venta.metodoPago_monto_sus_vta?.toLowerCase().replace(/_/g, ' ') || 'N/A'}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Badge bg={
                                                                    venta.conducta_o_instancia === "al dia" ? "success" :
                                                                    venta.conducta_o_instancia === "atrasado" ? "warning" :
                                                                    venta.conducta_o_instancia === "cobro judicial" ? "danger" :
                                                                    "secondary"
                                                                }>
                                                                    {venta.conducta_o_instancia?.toUpperCase() || 'SIN ESTADO'}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                ) : (
                                    <Alert variant="warning">
                                        No se encontraron ventas para el mes y año seleccionados.
                                    </Alert>
                                )
                            ) : (
                                <Alert variant="info">
                                    Seleccione un mes y año para generar el reporte.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </>
            )}

            <ModalDetallesCuota />
        </Container>
    );
};

export default ListaCuotasCobranza;