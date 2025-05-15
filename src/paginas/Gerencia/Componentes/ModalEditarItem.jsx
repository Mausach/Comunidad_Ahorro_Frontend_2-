import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { starEditItem } from '../Helper/EditarItem';


export const ModalEditarInventario = ({ show, handleClose, handleBackStock ,item, setRefreshData, navigate,producto }) => {
  const [editedItem, setEditedItem] = useState({
    id: '',
    nombreItem: '',
    modelo: '',
    serial: '',
    estado: 'disponible',
  });
  const productoId=producto._id

  useEffect(() => {
    if (item) {
      setEditedItem({
        id: item._id || item.id,
        nombreItem: item.nombreItem || '',
        modelo: item.modelo || '',
        serial: item.serial || '',
        estado: item.estado || 'disponible',
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nombreItem, modelo, serial, estado } = editedItem;

    if (!nombreItem.trim() || !modelo.trim() || !serial.trim() || !estado.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Campos vacíos',
        text: 'Todos los campos son obligatorios.',
      });
      return;
    }

    try {
        console.log(editedItem)
        const camposActualizados=editedItem
        const body = { productoId,serial,camposActualizados };
        starEditItem(body, setRefreshData, navigate);
      handleClose();
      handleBackStock();
     
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo editar el ítem. Intenta nuevamente.',
      });
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Inventario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Ítem</Form.Label>
            <Form.Control
              type="text"
              name="nombreItem"
              value={editedItem.nombreItem}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Modelo</Form.Label>
            <Form.Control
              type="text"
              name="modelo"
              value={editedItem.modelo}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Serial</Form.Label>
            <Form.Control
              type="text"
              name="serial"
              value={editedItem.serial}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={editedItem.estado}
              onChange={handleChange}
            >
              <option value="disponible">Disponible</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
              <option value="en_reparacion">En reparación</option>
            </Form.Select>
          </Form.Group>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
