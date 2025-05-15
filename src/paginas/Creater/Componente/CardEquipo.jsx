import React, { useState } from "react";
import {
    Card,
    Accordion,
    ListGroup,
    Button,
    Form,
} from "react-bootstrap";

import Swal from "sweetalert2";
import { desvincularVendedor } from "../Helper/DesvincularEquipo";
import { vincularVendedor } from "../Helper/VincularVendedor";
import { realizarPago } from "../Helper/RealizarPago";

const Equipos = ({ users, setRefreshData, navigate, responsable }) => {
    const [editarSupervisorId, setEditarSupervisorId] = useState(null);
    const [montosPago, setMontosPago] = useState({});

    // Filtrar vendedores con supervisor asignado
    const vendedoresConSupervisor = users.filter((user) => user.supervisorId);

    // Agrupar vendedores por supervisor
    const equiposMap = vendedoresConSupervisor.reduce((acc, vendedor) => {
        const { supervisorId } = vendedor;
        if (!acc[supervisorId]) acc[supervisorId] = [];
        acc[supervisorId].push(vendedor);
        return acc;
    }, {});

    // Función de ejemplo para vincular
    const handleVincular = async (vendedorId, supervisorId) => {

        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Deseas añadir a este vendedor al equipo de ventas?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, vincular",
            cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {

            console.log(`Vincular vendedor ${vendedorId} al supervisor ${supervisorId}`);
            await vincularVendedor(vendedorId, supervisorId, setRefreshData, navigate)
            setEditarSupervisorId(null); // Cierra el acordeón al vincular


        }



    };

    const handleDesvincular = async (vendedorId) => {


        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Deseas desvincular a este usuario del equipo de ventas?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, desvincular",
            cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {

            console.log(`Desvincular ${vendedorId}`);
            // Aquí podés agregar la lógica para pagar o abrir un modal, etc.
            await desvincularVendedor(vendedorId, setRefreshData, navigate);


        }


    };

    const handlePagarSaldo = async (usuarioId, saldoPendiente, montoIngresado) => {

        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Realizar pago el monto pendiente?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, realizar pago",
            cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {

            if (montoIngresado <= 0) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: 'monto debe ser mayor a 0',
                });
                return; // Detener la ejecución si el monto no es válido
            }

            // Validar que el monto no sea mayor que el saldo pendiente
            if (montoIngresado > saldoPendiente) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `El monto ingresado (${montoIngresado}) es mayor que el saldo pendiente (${saldoPendiente}).`,
                });
                return; // Detener la ejecución si el monto no es válido
            }



            // Si el monto es válido, proceder con el pago
            try {

                console.log({ usuarioId, montoIngresado, saldoPendiente, responsable });
                await realizarPago(usuarioId, montoIngresado, responsable, setRefreshData, navigate);

                // Mostrar mensaje de éxito
                Swal.fire({
                    icon: "success",
                    title: "Pago realizado",
                    text: `Se ha pagado ${montoIngresado}. Saldo pendiente actual: ${saldoPendiente - montoIngresado} a el usuario ${usuarioId}.`,
                });

                // Limpiar el monto ingresado en el estado local
                setMontosPago({});
            } catch (error) {
                // El manejo de errores ya está incluido en starActualizarSaldo
                console.error("Error al realizar el pago:", error);
            }

        }


    };

    return (
        <div className="d-flex flex-wrap gap-4 justify-content-center mt-4">
            {Object.entries(equiposMap).map(([supervisorId, vendedores]) => {
                const supervisor = users.find((user) => user._id === supervisorId);
                if (!supervisor) return null;

                return (
                    <Card
                        key={supervisorId}
                        style={{
                            width: "100%",
                            maxWidth: "600px",
                            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                        }}
                        className="shadow-lg rounded-4"
                    >
                        <Card.Header className="bg-primary text-white">
                            <Card.Title>Equipo de {supervisor.nombre} </Card.Title>
                        </Card.Header>

                        <Card.Body>
                            <Card.Subtitle className="mb-3 text-muted">
                                <strong>Supervisor:</strong> {supervisor.nombre} {supervisor.apellido}
                            </Card.Subtitle>


                            {/* Saldo del Supervisor */}
                            <ListGroup className="mb-2">
                                <ListGroup.Item>
                                    {/* <div><strong>Total:</strong> ${supervisor.saldo?.saldoPendiente || 0}</div> */}

                                    <div><strong>Pendiente:</strong> ${supervisor.saldoPendiente}</div>
                                </ListGroup.Item>
                            </ListGroup>

                            <ListGroup>
                                <ListGroup.Item className="d-grid gap-2">
                                    <Form.Group className="mb-3" controlId={`formPago-${supervisorId}`}>
                                        <Form.Label>Monto a pagar</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            value={montosPago[supervisorId] || ""}
                                            onChange={(e) =>
                                                setMontosPago({
                                                    ...montosPago,
                                                    [supervisorId]: Number(e.target.value),
                                                })
                                            }
                                            placeholder="Ingresar monto"
                                        />

                                        <Button
                                            className="m-3"
                                            variant="success"
                                            size="sm"
                                            onClick={() =>
                                                handlePagarSaldo(
                                                    supervisor._id,
                                                    supervisor.saldoPendiente,
                                                    montosPago[supervisor._id] || 0
                                                )
                                            }
                                        >
                                            Pagar saldo
                                        </Button>
                                    </Form.Group>
                                </ListGroup.Item>
                            </ListGroup>

                            {/* Historial del Supervisor */}
                            <Accordion className="mb-3">
                                <Accordion.Item eventKey="sup-historial">
                                    <Accordion.Header>Historial de pagos del supervisor</Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup variant="flush">
                                            {supervisor.saldoRendido.length > 0 ? (
                                                supervisor.saldoRendido.map((pago, i) => (
                                                    <ListGroup.Item key={i}>
                                                        <div><strong>Monto:</strong> ${pago.monto}</div>
                                                        <div><strong>Fecha:</strong> {pago.fecha}</div>
                                                        <div><strong>Hecho por:</strong> {pago.responsable}</div>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <div className="text-muted">No hay pagos registrados.</div>
                                            )}
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                            {/* Vendedores */}
                            <Accordion alwaysOpen>
                                {vendedores.map((vendedor, idx) => (
                                    <Accordion.Item eventKey={idx.toString()} key={vendedor._id}>
                                        <Accordion.Header>{vendedor.nombre} {vendedor.apellido}</Accordion.Header>
                                        <Accordion.Body>
                                            <ListGroup>
                                                <ListGroup.Item>
                                                    {/* <div><strong>Total:</strong> ${vendedor.saldo?.saldo_total || 0}</div> */}

                                                    <div><strong>Pendiente:</strong> ${vendedor.saldoPendiente}</div>

                                                    <div className="d-flex justify-content-end mt-2">

                                                    </div>
                                                </ListGroup.Item>
                                            </ListGroup>

                                            <ListGroup>
                                                <ListGroup.Item className="d-grid gap-2">
                                                    <Form.Group className="mb-3" controlId={`formPago-${vendedor._id}`}>
                                                        <Form.Label>Monto a pagar</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            value={montosPago[vendedor._id] || ""}
                                                            onChange={(e) =>
                                                                setMontosPago({
                                                                    ...montosPago,
                                                                    [vendedor._id]: Number(e.target.value),
                                                                })
                                                            }
                                                            placeholder="Ingresar monto"
                                                        />

                                                        <Button
                                                            className="m-3"
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePagarSaldo(
                                                                    vendedor._id,
                                                                    vendedor.saldoPendiente,
                                                                    montosPago[vendedor._id] || 0
                                                                )
                                                            }
                                                        >
                                                            Pagar saldo
                                                        </Button>
                                                    </Form.Group>
                                                </ListGroup.Item>
                                            </ListGroup>

                                            {/* Historial vendedor */}
                                            <Accordion className="mt-3">
                                                <Accordion.Item eventKey={`vendedor-historial-${vendedor._id}`}>
                                                    <Accordion.Header>Historial de pagos</Accordion.Header>
                                                    <Accordion.Body>
                                                        <ListGroup variant="flush">
                                                            {vendedor.saldoRendido.length > 0 ? (
                                                                vendedor.saldoRendido.map((pago, i) => (
                                                                    <ListGroup.Item key={i}>
                                                                        <div><strong>Monto:</strong> ${pago.monto}</div>
                                                                        <div><strong>Fecha:</strong> {pago.fecha}</div>
                                                                        <div><strong>Hecho por:</strong> {pago.responsable}</div>
                                                                    </ListGroup.Item>
                                                                ))
                                                            ) : (
                                                                <div className="text-muted">No hay pagos registrados.</div>
                                                            )}
                                                        </ListGroup>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>

                                        
                                                

                                                <div className="d-flex justify-content-end mt-2 gap-2">

                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDesvincular(vendedor._id)}
                                                    >
                                                        Desvincular
                                                    </Button>
                                                </div>
                                           

                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>

                            {/* Botón Editar Equipo */}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="m-3"
                                onClick={() =>
                                    setEditarSupervisorId(
                                        editarSupervisorId === supervisorId ? null : supervisorId
                                    )
                                }
                            >
                                {editarSupervisorId === supervisorId
                                    ? "Cerrar edición"
                                    : "Editar equipo"}
                            </Button>

                            {/* Acordeón para agregar nuevos vendedores */}
                            {editarSupervisorId === supervisorId && (
                                <Accordion className="mb-3">
                                    <Accordion.Item eventKey={`editar-${supervisorId}`}>
                                        <Accordion.Header>Agregar vendedores al equipo</Accordion.Header>
                                        <Accordion.Body>
                                            <ListGroup>
                                                {users
                                                    .filter(
                                                        (user) =>
                                                            !user.supervisorId &&
                                                            user.rol === "vendedor"
                                                    )
                                                    .map((v) => (
                                                        <ListGroup.Item
                                                            key={v._id}
                                                            className="d-flex justify-content-between align-items-center"
                                                        >
                                                            {v.nombre}
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                onClick={() =>
                                                                    handleVincular(v._id, supervisorId)
                                                                }
                                                            >
                                                                Vincular
                                                            </Button>
                                                        </ListGroup.Item>
                                                    ))}
                                            </ListGroup>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}

                        </Card.Body>
                    </Card>
                );
            })}
        </div>
    );
};

export default Equipos;