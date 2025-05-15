import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { starEditarCliente } from '../Helper/EditarCliente';


export const ModalEditarCliente = ({ show, handleClose, cliente, setRefreshData, navigate }) => {
  const [editedCliente, setEditedCliente] = useState({
    _id: '',
    nombre: '',
    apellido: '',
    nombre_fam: '',
    apellido_fam: '',
    dni: '',
    cuil: '',
    numero_cliente: '',
    situacion_veraz: '',
    email: '',
    numero_telefono: '',
    numero_telefono_2: '',
    direccion_hogar: '',
    direccion_comercial: '',
    localidad: ''
  });

  // Cargar datos del cliente cuando se abre el modal
  useEffect(() => {
    if (cliente) {
      setEditedCliente({
        _id: cliente._id,
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        nombre_fam: cliente.nombre_fam || '',
        apellido_fam: cliente.apellido_fam || '',
        dni: cliente.dni || '',
        cuil: cliente.cuil || '',
        numero_cliente: cliente.numero_cliente || '',
        situacion_veraz: cliente.situacion_veraz || '',
        email: cliente.email || '',
        numero_telefono: cliente.numero_telefono || '',
        numero_telefono_2: cliente.numero_telefono_2 || '',
        direccion_hogar: cliente.direccion_hogar || '',
        direccion_comercial: cliente.direccion_comercial || '',
        localidad: cliente.localidad || ''
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCliente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!editedCliente.nombre.trim() || !editedCliente.apellido.trim()) {
      Swal.fire('Error', 'Nombre y apellido son obligatorios', 'error');
      return;
    }

    if (!editedCliente.dni.trim()) {
      Swal.fire('Error', 'El DNI es obligatorio', 'error');
      return;
    }

    if (!editedCliente.numero_telefono.trim()) {
      Swal.fire('Error', 'El teléfono principal es obligatorio', 'error');
      return;
    }

    if (!editedCliente.direccion_hogar.trim()) {
      Swal.fire('Error', 'La dirección del hogar es obligatoria', 'error');
      return;
    }

    // Validación DNI (8 dígitos numéricos)
    if (!/^\d{8}$/.test(editedCliente.dni)) {
      Swal.fire('Error', 'El DNI debe tener 8 dígitos numéricos', 'error');
      return;
    }

    // Validación CUIL (11 dígitos si existe)
    if (editedCliente.cuil && !/^\d{11}$/.test(editedCliente.cuil)) {
      Swal.fire('Error', 'El CUIL debe tener 11 dígitos numéricos', 'error');
      return;
    }

    // Validación email si existe
    if (editedCliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedCliente.email)) {
      Swal.fire('Error', 'Ingrese un email válido', 'error');
      return;
    }

    // Validación teléfono (entre 8 y 15 dígitos)
    if (!/^\d{7,15}$/.test(editedCliente.numero_telefono)) {
      Swal.fire('Error', 'El teléfono debe tener entre 7 y 15 dígitos', 'error');
      return;
    }

    try {
      await starEditarCliente(editedCliente, setRefreshData, navigate);
      Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
      handleClose();
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el cliente', 'error');
      console.error(error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Sección Información Personal */}
            <Col md={6}>
              <h5>Información Personal</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={editedCliente.nombre}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={editedCliente.apellido}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>DNI *</Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={editedCliente.dni}
                  onChange={handleChange}
                  maxLength="8"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>CUIL</Form.Label>
                <Form.Control
                  type="text"
                  name="cuil"
                  value={editedCliente.cuil}
                  onChange={handleChange}
                  maxLength="11"
                />
              </Form.Group>


              <Form.Group className="mb-3">
                <Form.Label>Situación Veraz</Form.Label>
                <Form.Control
                  type="number"
                  name="situacion_veraz"
                  value={editedCliente.situacion_veraz}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Sección Contacto y Dirección */}
            <Col md={6}>
              <h5>Contacto y Dirección</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editedCliente.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono Principal *</Form.Label>
                <Form.Control
                  type="text"
                  name="numero_telefono"
                  value={editedCliente.numero_telefono}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono Secundario</Form.Label>
                <Form.Control
                  type="text"
                  name="numero_telefono_2"
                  value={editedCliente.numero_telefono_2}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dirección Hogar *</Form.Label>
                <Form.Control
                  type="text"
                  name="direccion_hogar"
                  value={editedCliente.direccion_hogar}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dirección Comercial</Form.Label>
                <Form.Control
                  type="text"
                  name="direccion_comercial"
                  value={editedCliente.direccion_comercial}
                  onChange={handleChange}
                />
              </Form.Group>

            </Col>

            <Form.Group className="mb-3">
                <Form.Label>Localidad</Form.Label>
                <Form.Control
                  type="text"
                  name="localidad"
                  value={editedCliente.localidad}
                  onChange={handleChange}
                />
              </Form.Group>

            {/* Sección Familiares */}
            <Col md={12}>
              <h5 className="mt-3">Datos Familiares</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre Familiar</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_fam"
                      value={editedCliente.nombre_fam}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido Familiar</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido_fam"
                      value={editedCliente.apellido_fam}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};