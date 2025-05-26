import React, { useState } from "react";
import { Button, Form, Badge, ListGroup, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import { starCobrarCuota } from "../Helper/CobrarCuota";
import { starEditarCuota } from "../Helper/EditarCuota";

const CuotaItem = ({ cuota, venta, usuario, setRefreshData, navigate }) => {
    const [activeForm, setActiveForm] = useState(null);
    const [metodoPago, setMetodoPago] = useState("");
    const [montoCobrado, setMontoCobrado] = useState("");
    const [comentario, setComentario] = useState("");
    const [fechaCobro, setFechaCobro] = useState("");
     const [nuevoMonto, setNuevoMonto] = useState(cuota.montoCuota); // Estado para el nuevo mont
    const [error, setError] = useState(null);

    const resetForm = () => {
        setMetodoPago("");
        setMontoCobrado("");
        setComentario("");
        setFechaCobro("");
        setNuevoMonto(cuota.montoCuota); // Resetear al monto original
        setActiveForm(null);
        setError(null);
    };

    // manda el estado y datos de la cobranza de una cuota
    const handleSubmit = async (estado) => {
        try {
            setError(null);

            // Validaciones específicas por estado
            switch (estado) {
                case "pago":
                    if (!metodoPago.trim()) {
                        throw new Error("Debe seleccionar un método de pago");
                    }
                    break;

                case "pendiente":
                    if (!fechaCobro) throw new Error("La fecha de próximo cobro es obligatoria");
                    if (!comentario.trim()) throw new Error("El comentario es obligatorio");
                    if (montoCobrado && !metodoPago) {
                        throw new Error("Si ingresa un monto, debe seleccionar método de pago");
                    }
                    break;

                case "no pagado":
                    if (!comentario.trim()) throw new Error("Debe especificar la razón del no pago");
                    break;
            }
            console.log(venta)

            // Preparar payload para el backend
            const payload = {
                ventaId: venta._id,
                cuotaId: cuota._id,
                estado_cuota: estado,
                comentario: comentario.trim(),
                cobrador: {
                    _id: usuario._id,
                    dni: usuario.dni,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido
                }
            };

            // Campos condicionales
            if (estado === "pago") {
                payload.metodoPago = metodoPago;
                payload.montoCuota = cuota.montoCuota; // Pago completo
            }

            if (estado === "pendiente") {
                payload.fechaCobro = fechaCobro;
                if (montoCobrado) {
                    payload.montoCuota = parseFloat(montoCobrado);
                    payload.metodoPago = metodoPago;
                }
            }


            console.log("Datos enviados al backend:", payload);
            starCobrarCuota(payload, setRefreshData, navigate)

            resetForm();
            //setRefreshData();

        } catch (error) {
            setError(error.message);
            console.error("Error en handleSubmit:", error);
        }
    };

    const getEstadoBadge = () => {
        const estado = cuota.estado_cuota;
        const variant = {
            'pago': 'success',
            'pendiente': 'warning',
            'no pagado': 'danger',
            'impago': 'secondary'
        }[estado] || 'light';

        return <Badge bg={variant}>{estado}</Badge>;
    };

    //edita monto de la cuota
    const handleEditarMonto = async () => {
        try {
            if (!nuevoMonto || nuevoMonto <= 0) {
                throw new Error("El monto debe ser mayor a cero");
            }

            const payload = {
                ventaId: venta._id,
                cuotaId: cuota._id,
                estado_cuota: cuota.estado_cuota, // Mantener el estado actual
                montoCuota: parseFloat(nuevoMonto),
                cobrador: {
                    _id: usuario._id,
                    dni: usuario.dni,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido
                },
                comentario: "Monto de cuota modificado" // Puedes personalizar esto
            };

            console.log("Datos enviados para editar monto:", payload);
            await starEditarCuota(payload, setRefreshData, navigate);

            resetForm();
            Swal.fire({
                icon: 'success',
                title: 'Monto actualizado',
                text: `El monto de la cuota se ha actualizado a $${nuevoMonto.toLocaleString('es-AR')}`,
                timer: 2000
            });
        } catch (error) {
            setError(error.message);
            console.error("Error al editar monto:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        }
    };


    const renderForm = () => {
        switch (activeForm) {
            case "pagar":
                return (
                    <div className="mt-2" style={{ minWidth: '250px' }}>
                        <Form.Select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className="mb-2"
                            size="sm"
                            required
                        >
                            <option value="">Seleccione un método de pago</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="tarjeta_credito">Tarjeta de crédito</option>
                            <option value="tarjeta_debito">Tarjeta de débito</option>
                            <option value="dolares">Dólares</option>
                            <option value="usdt">USDT</option>
                        </Form.Select>

                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleSubmit("pago")}
                                disabled={!metodoPago}
                            >
                                Confirmar Pago
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={resetForm}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                );

            case "pendiente":
                return (
                    <div className="mt-2" style={{ minWidth: '250px' }}>
                        <Form.Group className="mb-2">
                            <Form.Label>Próxima fecha de cobro</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaCobro}
                                onChange={(e) => setFechaCobro(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Comentario</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Monto abonado (opcional)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max={cuota.montoCuota}
                                step="0.01"
                                value={montoCobrado}
                                onChange={(e) => setMontoCobrado(e.target.value)}
                                placeholder="Ej: 5000"
                            />
                        </Form.Group>

                        {montoCobrado && (
                            <Form.Group className="mb-2">
                                <Form.Label>Método de pago</Form.Label>
                                <Form.Select
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                >
                                    <option value="">Seleccione método</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="tarjeta">Tarjeta</option>
                                </Form.Select>
                            </Form.Group>
                        )}

                        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleSubmit("pendiente")}
                                disabled={!fechaCobro || !comentario.trim() || (montoCobrado && !metodoPago)}
                            >
                                Guardar Pendiente
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={resetForm}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                );

            case "no pagado":
                return (
                    <div className="mt-2" style={{ minWidth: '250px' }}>
                        <Form.Group className="mb-2">
                            <Form.Label>Razón del no pago</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleSubmit("no pagado")}
                                disabled={!comentario.trim()}
                            >
                                Confirmar No Pago
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={resetForm}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                );

            case "editarMonto":
                return (
                    <div className="mt-2" style={{ minWidth: '250px' }}>
                        <Form.Group className="mb-2">
                            <Form.Label>Nuevo monto de cuota</Form.Label>
                            <Form.Control
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={nuevoMonto}
                                onChange={(e) => setNuevoMonto(e.target.value)}
                                placeholder={`Monto actual: $${cuota.montoCuota?.toLocaleString('es-AR')}`}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Comentario (opcional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                            />
                        </Form.Group>

                        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleEditarMonto}
                                disabled={!nuevoMonto || nuevoMonto <= 0}
                            >
                                Confirmar Cambio
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={resetForm}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                );


            default:
                return null;
        }
    };

    return (
        <ListGroup.Item className="d-flex flex-column flex-md-row justify-content-between align-items-start">
            <div className="me-auto mb-2 mb-md-0">
                <div className="fw-bold d-flex align-items-center gap-2">
                    Cuota #{cuota.numeroCuota}
                    {getEstadoBadge()}
                </div>
                <div className="mt-1">
                    <span className="text-muted">Monto: </span>
                    <strong>${cuota.montoCuota?.toLocaleString('es-AR')}</strong>
                </div>
                <div className="mt-1">
                    <span className="text-muted">Fecha de cobro: </span>
                    <strong>{cuota.fechaCobro}</strong>
                </div>
                {cuota.comentario && (
                    <div className="mt-1 small">
                        <span className="text-muted">Comentario: </span>
                        {cuota.comentario}
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            {!cuota.estado_cuota || ["pendiente", "no pagado", "impago"].includes(cuota.estado_cuota) ? (
                !activeForm ? (
                    <div className="w-100 w-md-auto"> {/* Ocupa ancho completo en móviles */}
                        {!cuota.estado_cuota || ["pendiente", "no pagado", "impago"].includes(cuota.estado_cuota) ? (
                            !activeForm ? (
                                <div className="d-flex flex-wrap gap-1 justify-content-end">
                                    <Button variant="outline-success" size="sm" onClick={() => setActiveForm("pagar")}>
                                        <i className="bi bi-cash me-1"></i> Pagar
                                    </Button>
                                    <Button variant="outline-warning" size="sm" onClick={() => setActiveForm("pendiente")}>
                                        <i className="bi bi-clock me-1"></i> Pendiente
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => setActiveForm("no pagado")}>
                                        <i className="bi bi-x-circle me-1"></i> No Pagará
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => setActiveForm("editarMonto")}
                                    >
                                        <i className="bi bi-pencil me-1"></i> Editar Monto
                                    </Button>
                                </div>
                            ) : (
                                <Accordion className="mt-2 mt-md-0"> {/* Contenedor para el formulario */}
                                    <Accordion.Item eventKey="0" className="border-0">
                                        <Accordion.Body className="p-0">
                                            {renderForm()}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )
                        ) : null}
                    </div>
                ) : (
                    renderForm()
                )
            ) : null}
        </ListGroup.Item>
    );
};

export default CuotaItem;