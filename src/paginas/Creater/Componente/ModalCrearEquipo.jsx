import React, { useState } from "react";
import { Button, Modal, Form, ListGroup, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import { starCrearEquipoVenta } from "../Helper/AltaEquipo";

const ModalCrearEquipoVenta = ({
    showCreateEquipoven,
    handleCloseCreateEquipo,
    setRefreshData,
    navigate,
    users
}) => {
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [selectedSellers, setSelectedSellers] = useState([]);

    // Filtrar supervisores y vendedores
    const filteredSupervisors = users?.filter(user => user.rol === "supervisor" && user.estado === true) || [];
    const filteredSellers = users?.filter(user => user.rol === "vendedor" && user.estado === true) || [];

    // Manejar selección de supervisor
    const handleSelectSupervisor = (event) => {
        const supervisorId = event.target.value;
        const supervisor = users.find(user => user._id === supervisorId);
        setSelectedSupervisor(supervisor);
    };

    // Manejar selección de vendedores
    const handleSelectSeller = (event) => {
        const sellerId = event.target.value;
        if (!sellerId) return;
        
        const seller = users.find(user => user._id === sellerId);
        if (seller && !selectedSellers.some(s => s._id === sellerId)) {
            setSelectedSellers(prev => [...prev, seller]);
        }
        event.target.value = ""; // Resetear el select
    };

    // Eliminar un vendedor de la lista
    const handleRemoveSeller = (sellerId) => {
        setSelectedSellers(prev => prev.filter(seller => seller._id !== sellerId));
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSupervisor) {
            Swal.fire("Error", "Seleccione un supervisor", "error");
            return;
        }
        if (selectedSellers.length === 0) {
            Swal.fire("Error", "Seleccione al menos un vendedor", "error");
            return;
        }

        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Deseas crear este equipo de ventas?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, crear",
            cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {
            const equipoVenta = {
                supervisorId: selectedSupervisor._id,
                vendedoresIds: selectedSellers.map(seller => seller._id),
            };

            console.log("Datos a enviar:", equipoVenta);
             await starCrearEquipoVenta(equipoVenta, setRefreshData, navigate);

            // Resetear campos
            setSelectedSupervisor(null);
            setSelectedSellers([]);
            handleCloseCreateEquipo();
        }
    };

    return (
        <Modal show={showCreateEquipoven} onHide={handleCloseCreateEquipo} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Crear Equipo de Venta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {/* Supervisor */}
                    <Form.Group className="mb-3">
                        <Form.Label>Supervisor</Form.Label>
                        <Form.Select 
                            onChange={handleSelectSupervisor} 
                            value={selectedSupervisor?._id || ""}
                            required
                        >
                            <option value="">Seleccione un supervisor</option>
                            {filteredSupervisors.map(sup => (
                                <option key={sup._id} value={sup._id}>
                                    {sup.nombre} {sup.apellido}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Vendedores */}
                    <Form.Group className="mb-3">
                        <Form.Label>Vendedores</Form.Label>
                        <Form.Select onChange={handleSelectSeller} value="">
                            <option value="">Seleccione vendedores</option>
                            {filteredSellers
                                .filter(seller => 
                                    !selectedSellers.some(s => s._id === seller._id) && 
                                    seller._id !== selectedSupervisor?._id
                                )
                                .map(seller => (
                                    <option key={seller._id} value={seller._id}>
                                        {seller.nombre} {seller.apellido}
                                    </option>
                                ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Lista de vendedores seleccionados */}
                    {selectedSellers.length > 0 && (
                        <Form.Group className="mb-3">
                            <Form.Label>Vendedores seleccionados</Form.Label>
                            <ListGroup>
                                {selectedSellers.map(seller => (
                                    <ListGroup.Item 
                                        key={seller._id} 
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <span>
                                            {seller.nombre} {seller.apellido}
                                        </span>
                                        <Badge 
                                            bg="danger" 
                                            style={{ cursor: "pointer" }} 
                                            onClick={() => handleRemoveSeller(seller._id)}
                                        >
                                            X
                                        </Badge>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Form.Group>
                    )}

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseCreateEquipo}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Crear Equipo
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalCrearEquipoVenta;