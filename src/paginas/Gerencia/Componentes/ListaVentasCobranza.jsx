import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, ListGroup, Accordion, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import CuotaItem from './CuotaItem';

export const ListaVentas = ({ ventas, navigate, usuario, refreshData, setRefreshData }) => {
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showVentaDetails, setShowVentaDetails] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0); // Nuevo estado

    // Filtrado de ventas
    const filteredVentas = ventas.filter(venta => {
        const searchLower = searchTerm.toLowerCase();
        return (
            venta.cliente.nombre.toLowerCase().includes(searchLower) ||
            venta.cliente.apellido.toLowerCase().includes(searchLower) ||
            venta.cliente.dni.includes(searchTerm) ||
            venta.numeroContrato.includes(searchTerm)
        );
    });

    // Clasificar tipo de venta
    const getTipoVenta = (venta) => {
        try {
            if (!venta?.producto?.detalle) return "Tipo de venta no especificado";

            const detalle = venta.producto.detalle;

            if (detalle.prestamo) return "Préstamo";

            if (detalle.venta?.banderas) {
                const { banderas } = detalle.venta;
                if (banderas.permutada) return "Venta Permutada";
                if (banderas.entregaInmediata) return "Entrega Inmediata";
                if (banderas.largoPlazo) return "Plan a largo plazo";
                if (banderas.ventaDirecta) return "Venta Directa";
            }

            return "Tipo de venta no especificado";
        } catch (error) {
            console.error("Error al determinar tipo de venta:", error);
            return "Tipo de venta no especificado";
        }
    };

    // Badge para estado
    const getEstadoBadge = (estado) => {
        switch (estado) {
            case "al dia": return <Badge bg="success">Al día</Badge>;
            case "atrasado": return <Badge bg="warning" text="dark">Atrasado</Badge>;
            case "refinanciado": return <Badge bg="info">Refinanciado</Badge>;
            case "cobro judicial": return <Badge bg="danger">Judicial</Badge>;
            default: return <Badge bg="secondary">{estado}</Badge>;
        }
    };

    // Efecto para actualizar la venta seleccionada
    useEffect(() => {
        if (showVentaDetails && selectedVenta) {
            const ventaActualizada = ventas.find(v => v._id === selectedVenta._id);
            if (ventaActualizada) {
                setSelectedVenta(ventaActualizada);
                setForceUpdate(prev => prev + 1);
            }
        }
    }, [refreshData, ventas]);

    return (
        <div className="p-4">
            <h2>Gestión de Cobros</h2>

            {/* Vista principal de lista */}
            {!showVentaDetails ? (
                <>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre, DNI o contrato..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Form.Group>

                    <ListGroup>
                        {filteredVentas.map((venta) => (
                            <ListGroup.Item key={venta._id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{venta.cliente.nombre} {venta.cliente.apellido}</strong>
                                    <div className="text-muted small">
                                        Contrato: {venta.numeroContrato} | {getTipoVenta(venta)}
                                    </div>
                                    {getEstadoBadge(venta.conducta_o_instancia)}
                                </div>
                                <div>
                                    <Button
                                        variant="outline-info"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => {
                                            setSelectedVenta(venta);
                                            setShowClienteModal(true);
                                        }}
                                    >
                                        <i className="bi bi-person"></i> Cliente
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedVenta(venta);
                                            setShowVentaDetails(true);
                                        }}
                                    >
                                        <i className="bi bi-file-text"></i> Venta
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </>
            ) : (
                /* Vista detallada de la venta */
                <div>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowVentaDetails(false)}
                        className="mb-3"
                    >
                        <i className="bi bi-arrow-left"></i> Volver a la lista
                    </Button>

                    <Card className="mb-3">
                        <Card.Header className="bg-primary text-white">
                            <h5>Venta #{selectedVenta.numeroContrato}</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                <div className="col-md-6">
                                    <h6>Información General</h6>
                                    <p><strong>Fecha:</strong> {selectedVenta.fechaRealizada}</p>
                                    <p><strong>Tipo:</strong> {getTipoVenta(selectedVenta)}</p>
                                    <p><strong>Monto Total:</strong> ${selectedVenta.monto_suscripcion_vta_dir.toLocaleString()}</p>
                                    <p><strong>Método Pago:</strong> {selectedVenta.metodoPago_monto_sus_vta}</p>
                                    <p><strong>Estado:</strong> {getEstadoBadge(selectedVenta.conducta_o_instancia)}</p>
                                </div>

                                <div className="col-md-6">
                                    <h6>Detalles del Producto</h6>
                                    <p><strong>Producto:</strong> {selectedVenta.producto.nombre}</p>

                                    {getTipoVenta(selectedVenta) === "Préstamo" && (
                                        <>
                                            <p><strong>Monto:</strong> ${selectedVenta.producto.detalle.prestamo.montoPrestado?.toLocaleString()}</p>
                                            <p><strong>Plazo:</strong> {selectedVenta.producto.detalle.prestamo.plazo}</p>
                                        </>
                                    )}

                                    {getTipoVenta(selectedVenta) !== "Préstamo" && (
                                        <>
                                            <p><strong>Tipo venta:</strong> {getTipoVenta(selectedVenta)}</p>
                                            {selectedVenta.producto.detalle.venta.itemInventario && (
                                                <>
                                                    <p><strong>nombre:</strong> {selectedVenta.producto.detalle.venta.itemInventario.nombre}</p>
                                                    <p><strong>Modelo:</strong> {selectedVenta.producto.detalle.venta.itemInventario.modelo}</p>
                                                    <p><strong>Serial:</strong> {selectedVenta.producto.detalle.venta.itemInventario.serial}</p>
                                                </>
                                            )}
                                            {selectedVenta.producto.detalle.venta.banderas?.permutada && (
                                                <p><strong>Objeto recibido:</strong> {selectedVenta.producto.detalle.venta.objetoRecibido}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <hr />

                            <Accordion>
                                <Accordion.Item eventKey="0" key={`accordion-${forceUpdate}`}>
                                    <Accordion.Header>
                                        <div className="d-flex justify-content-between w-100 pe-3">
                                            <span>
                                                <strong>Ver Cuotas</strong>
                                                <Badge bg="secondary" className="ms-2">
                                                    Total: {selectedVenta.cuotas?.length || 0}
                                                </Badge>
                                            </span>
                                            <div>
                                                <Badge bg="success" className="me-2">
                                                    Pagadas: {selectedVenta.cuotas?.filter(c => c.estado_cuota === 'pago').length}
                                                </Badge>
                                                <Badge bg="warning" text="dark" className="me-2">
                                                    Pendientes: {selectedVenta.cuotas?.filter(c => c.estado_cuota === 'pendiente').length}
                                                </Badge>
                                                <Badge bg="danger">
                                                    Impagas: {selectedVenta.cuotas?.filter(c => ['no pagado', 'impago'].includes(c.estado_cuota)).length}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body className="p-0">
                                        {selectedVenta.cuotas?.length > 0 ? (
                                            <ListGroup variant="flush">
                                                {selectedVenta.cuotas
                                                    .sort((a, b) => a.numeroCuota - b.numeroCuota)
                                                    .map((cuota) => (
                                                        <CuotaItem
                                                            key={cuota._id}
                                                            cuota={cuota}
                                                            venta={selectedVenta}
                                                            usuario={usuario}
                                                            setRefreshData={setRefreshData}
                                                            navigate={navigate}
                                                        />
                                                    ))}
                                            </ListGroup>
                                        ) : (
                                            <Alert variant="info" className="m-3">
                                                No hay cuotas registradas
                                            </Alert>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {/* Modal solo para datos básicos del cliente */}
            <Modal show={showClienteModal} onHide={() => setShowClienteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Datos del Cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedVenta && (
                        <div>
                            <p><strong>Nombre:</strong> {selectedVenta.cliente.nombre} {selectedVenta.cliente.apellido}</p>
                            <p><strong>DNI:</strong> {selectedVenta.cliente.dni}</p>
                            <p><strong>Teléfono:</strong> {selectedVenta.cliente.telefono}</p>
                            <p><strong>Email:</strong> {selectedVenta.cliente.email || 'No registrado'}</p>
                            <p><strong>Dirección:</strong> {selectedVenta.cliente.direccion}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClienteModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};