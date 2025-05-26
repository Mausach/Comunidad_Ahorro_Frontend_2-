import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { starEditItem } from '../Helper/EditarItem';

export const ModalEditarInventario = ({ show, handleClose, item, setRefreshData, navigate, }) => {
  const [editedItem, setEditedItem] = useState({
    nombre: '',
    modelo: '',
    imei_serial: '',
    numero_serie: '',
    estado: 'disponible',
    memoria_ram: '',
    almacenamiento: '',
    bateria: '',
    color: '',
    caracteristicas: '',
    precio_compra: 0,
    precio_venta: 0,
    tipo: 'dispositivo',
    categoria_accesorio: 'otros'
  });

  useEffect(() => {
    if (item) {
      setEditedItem({
        nombre: item.nombre || '',
        modelo: item.modelo || '',
        imei_serial: item.imei_serial || '',
        numero_serie: item.numero_serie || '',
        estado: item.estado || 'disponible',
        memoria_ram: item.memoria_ram || '',
        almacenamiento: item.almacenamiento || '',
        bateria: item.bateria || '',
        color: item.color || '',
        caracteristicas: item.caracteristicas || '',
        precio_compra: item.precio_compra || 0,
        precio_venta: item.precio_venta || 0,
        tipo: item.tipo || 'dispositivo',
        categoria_accesorio: item.categoria_accesorio || 'otros'
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!editedItem.nombre.trim() || !editedItem.estado.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Campos requeridos',
        text: 'Nombre y estado son campos obligatorios',
      });
      return;
    }

    if (editedItem.tipo === 'dispositivo' && !editedItem.modelo.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Modelo requerido',
        text: 'Para dispositivos, el modelo es obligatorio',
      });
      return;
    }

    try {
      const body = {
        id: item._id,
        datosActualizados: editedItem  // Cambiado de "updates" a "datosActualizados"
      };



      console.log('Datos a enviar:', body);
      await starEditItem(body, setRefreshData, navigate);

      Swal.fire({
        icon: 'success',
        title: 'Ítem actualizado',
        showConfirmButton: false,
        timer: 1500
      });

      handleClose();
    } catch (error) {
      console.error('Error al editar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.msg || 'No se pudo actualizar el ítem',
      });
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ítem de Inventario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre*</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={editedItem.nombre}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  name="tipo"
                  value={editedItem.tipo}
                  onChange={handleChange}
                >
                  <option value="dispositivo">Dispositivo</option>
                  <option value="accesorio">Accesorio</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {editedItem.tipo === 'dispositivo' && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Modelo*</Form.Label>
                    <Form.Control
                      type="text"
                      name="modelo"
                      value={editedItem.modelo}
                      onChange={handleChange}
                      required={editedItem.tipo === 'dispositivo'}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Color</Form.Label>
                    <Form.Control
                      type="text"
                      name="color"
                      value={editedItem.color}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Memoria RAM</Form.Label>
                    <Form.Control
                      type="text"
                      name="memoria_ram"
                      value={editedItem.memoria_ram}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Almacenamiento</Form.Label>
                    <Form.Control
                      type="text"
                      name="almacenamiento"
                      value={editedItem.almacenamiento}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Batería</Form.Label>
                    <Form.Control
                      type="text"
                      name="bateria"
                      value={editedItem.bateria}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {editedItem.tipo === 'accesorio' && (
            <Form.Group className="mb-3">
              <Form.Label>Categoría Accesorio</Form.Label>
              <Form.Select
                name="categoria_accesorio"
                value={editedItem.categoria_accesorio}
                onChange={handleChange}
              >
                <option value="cargador">Cargador</option>
                <option value="auricular">Auricular</option>
                <option value="funda">Funda</option>
                <option value="protector">Protector</option>
                <option value="cable">Cable</option>
                <option value="otros">Otros</option>
              </Form.Select>
            </Form.Group>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>IMEI/Serial</Form.Label>
                <Form.Control
                  type="text"
                  name="imei_serial"
                  value={editedItem.imei_serial}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Número de Serie</Form.Label>
                <Form.Control
                  type="text"
                  name="numero_serie"
                  value={editedItem.numero_serie}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Características</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="caracteristicas"
              value={editedItem.caracteristicas}
              onChange={handleChange}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Precio de Compra</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio_compra"
                  value={editedItem.precio_compra}
                  onChange={handleNumberChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Precio de Venta</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio_venta"
                  value={editedItem.precio_venta}
                  onChange={handleNumberChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Estado*</Form.Label>
            <Form.Select
              name="estado"
              value={editedItem.estado}
              onChange={handleChange}
              required
            >
              <option value="disponible">Disponible</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
              <option value="en_reparacion">En reparación</option>
              <option value="perdido">Perdido</option>
              <option value="dañado">Dañado</option>
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
