import React, { useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import { starEditarProductos } from "../Helper/EditarProducto";
import { GestStock } from "../GestStock";
import { starCambiarEstado } from "../Helper/cambiarEstadoProd";

const CardProducto = ({ usuario, producto, handleStock, setRefreshData, navigate }) => {
    const [showModal, setShowModal] = useState(false);
  
    const [estadoActivo, setEstadoActivo] = useState(producto.estado);
    const [formData, setFormData] = useState({ ...producto });

    const handleCambiarEstado = () => {
        // Aquí deberías hacer la llamada a la API si corresponde
        starCambiarEstado(formData, setRefreshData, navigate)
        setEstadoActivo(!estadoActivo);
        // También podrías notificar al servidor con fetch/axios
    };

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);


    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleGuardarCambios = () => {
        // Aquí podrías hacer la llamada a tu API para actualizar el producto
        starEditarProductos(formData, setRefreshData, navigate)
        console.log("Cambios guardados:", formData);
        handleCloseModal();
    };

    const {
        nombre,
        descripcion,
        tipo,
        bandera,
        detalles
    } = formData;


    return (
        <>

            <Card className="card p-3 mb-5 bg-white m-3 col-3 col-md-4 col-xl-3 shadow-lg rounded-start-5"
                border="light"
                style={{ width: '20rem', height: '30rem', overflow: 'auto' }}
            >
                <Card.Title className="text-center">{nombre}</Card.Title>
                <hr />
                <Card.Body>
                    <Card.Text>{descripcion || 'Sin descripción disponible.'}</Card.Text>
                    <hr />


                    {tipo === 'prestamo' && detalles.prestamo && (
                        <>

                            <h6>Detalles de Préstamo:</h6>
                            <p>Capital Total: <strong>${detalles.prestamo.capitalTotal}</strong></p>
                            <p>Monto Máximo x Usuario: <strong>${detalles.prestamo.montoMaximoPorUsuario}</strong></p>
                            <p>Plazo de Cobranza: <strong>{detalles.prestamo.plazoCobranza}</strong></p>
                        </>
                    )}

                    {tipo === 'sistema_venta' && detalles.venta && (
                        <>

                            <div>
                                <h6>Modalidades:</h6>
                                <ul>
                                    <li>Venta Directa: <strong>{bandera.venta_directa ? 'Sí' : 'No'}</strong></li>
                                    <li>Plan a largo plazo: <strong>{bandera.plan ? 'Sí' : 'No'}</strong></li>
                                    <li>Entrega Inmediata: <strong>{bandera.entrega_inmediata ? 'Sí' : 'No'}</strong></li>
                                    <li>venta Permutada: <strong>{bandera.permutada ? 'Sí' : 'No'}</strong></li>
                                </ul>
                            </div>

                            <hr />
                            <h6>Detalles de Venta:</h6>
                            <p>Coste Administrativo: <strong>${detalles.venta.costoAdministrativo}</strong></p>
                            <p>Plazo: <strong>{detalles.venta.plazo}</strong></p>
                            <p>Plazos Pactados: <strong>{detalles.venta.plazosPactados?.join(", ") || 'N/A'}</strong></p>
                            <p>Inventario: <strong>{detalles.venta.inventario?.length || 0} ítems</strong></p>

                            <div className="d-flex flex-column gap-2 mb-2">
                                <Button variant="success" onClick={() => handleStock(producto)}>
                                    Gestionar Inventario
                                </Button>
                            </div>


                        </>

                    )}

                    <div className="d-flex flex-column gap-2">
                        <Button
                            variant={estadoActivo ? "danger" : "success"}
                            onClick={handleCambiarEstado}
                        >
                            {estadoActivo ? "Baja de producto" : "Activar producto"}
                        </Button>

                        <Button variant="primary" onClick={handleShowModal}>
                            Editar producto
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Editar Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion"
                                rows={3}
                                value={formData.descripcion}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                            >
                                <option value="prestamo">Préstamo</option>
                                <option value="sistema_venta">Sistema de Venta</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Campos específicos si el tipo es préstamo */}
                        {formData.tipo === "prestamo" && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Capital Total</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="detalles.prestamo.capitalTotal"
                                        value={formData.detalles?.prestamo?.capitalTotal || ''}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                detalles: {
                                                    ...prev.detalles,
                                                    prestamo: {
                                                        ...prev.detalles.prestamo,
                                                        capitalTotal: e.target.value,
                                                    },
                                                },
                                            }))
                                        }
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Monto Máximo por Usuario</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="detalles.prestamo.montoMaximoPorUsuario"
                                        value={formData.detalles?.prestamo?.montoMaximoPorUsuario || ''}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                detalles: {
                                                    ...prev.detalles,
                                                    prestamo: {
                                                        ...prev.detalles.prestamo,
                                                        montoMaximoPorUsuario: e.target.value,
                                                    },
                                                },
                                            }))
                                        }
                                    />
                                </Form.Group>
                            </>
                        )}

                        {/* Campos específicos si el tipo es sistema de venta */}
                        {formData.tipo === "sistema_venta" && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Costo Administrativo</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="detalles.venta.costoAdministrativo"
                                        value={formData.detalles?.venta?.costoAdministrativo || ''}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                detalles: {
                                                    ...prev.detalles,
                                                    venta: {
                                                        ...prev.detalles.venta,
                                                        costoAdministrativo: e.target.value,
                                                    },
                                                },
                                            }))
                                        }
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Plazo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="detalles.venta.plazo"
                                        value={formData.detalles?.venta?.plazo || ''}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                detalles: {
                                                    ...prev.detalles,
                                                    venta: {
                                                        ...prev.detalles.venta,
                                                        plazo: e.target.value,
                                                    },
                                                },
                                            }))
                                        }
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleGuardarCambios}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    );
};

export default CardProducto;
