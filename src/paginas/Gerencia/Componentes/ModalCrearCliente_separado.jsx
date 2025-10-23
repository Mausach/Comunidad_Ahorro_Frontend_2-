import React, { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';

export const ModalClienteSistema = ({
  show,
  handleClose,
  onClienteCreado,
  esNuevoCliente = true
}) => {
  const [clienteData, setClienteData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClienteData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarCliente = () => {
    if (esNuevoCliente) {
      const requiredFields = [
        'apellido', 'nombre', 'direccion_hogar', 'dni',
        'numero_telefono', 'apellido_fam', 'nombre_fam', 'localidad'
      ];

      for (const field of requiredFields) {
        if (!clienteData[field] || clienteData[field].trim() === '') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `El campo ${field} es obligatorio.`,
          });
          return false;
        }
      }
    } else if (!clienteData.dni || clienteData.dni.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'DNI obligatorio',
        text: 'Por favor, ingrese el DNI del cliente.',
      });
      return false;
    }

    // Validar DNI
    if (clienteData.dni && (clienteData.dni.length !== 8 || isNaN(clienteData.dni))) {
      Swal.fire({
        icon: 'error',
        title: 'DNI inválido',
        text: 'El DNI debe tener 8 caracteres numéricos.',
      });
      return false;
    }

    // Validar email si existe
    if (clienteData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Email inválido',
        text: 'Por favor, ingrese un email válido.',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCliente()) return;

    setIsLoading(true);
    try {
      // Simulamos la creación exitosa del cliente
      onClienteCreado(clienteData);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el cliente. Intente nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
             <div className='d-flex align-items-center justify-content-center'>
            <i className="bi bi-1-circle-fill  text-primary pe-5"> </i>
            <i className="bi bi-arrow-right pe-5"> </i>
            <i className="bi bi-2-circle  text-primary"> </i>
          </div>
          {esNuevoCliente ? 'Crear Nuevo Cliente ' : 'Cliente Existente'}
        
        
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
           
          {esNuevoCliente ? (
            <>
              <h5>Datos del Cliente</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombres *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={clienteData.nombre || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido"
                      value={clienteData.apellido || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre Familiar *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_fam"
                      value={clienteData.nombre_fam || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido Familiar *</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido_fam"
                      value={clienteData.apellido_fam || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>DNI *</Form.Label>
                    <Form.Control
                      type="text"
                      name="dni"
                      value={clienteData.dni || ''}
                      onChange={handleChange}
                      required
                      minLength={8}
                      maxLength={8}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>CUIL</Form.Label>
                    <Form.Control
                      type="text"
                      name="cuil"
                      value={clienteData.cuil || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Situación Veraz</Form.Label>
                    <Form.Select
                      name="situacion_veraz"
                      value={clienteData.situacion_veraz || ''}
                      onChange={handleChange}
                    >
                      <option value="">Seleccione situación</option>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4">Contacto</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={clienteData.email || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono Principal *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="numero_telefono"
                      value={clienteData.numero_telefono || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono Alternativo</Form.Label>
                    <Form.Control
                      type="tel"
                      name="numero_telefono_2"
                      value={clienteData.numero_telefono_2 || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4">Dirección</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección del Hogar *</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion_hogar"
                      value={clienteData.direccion_hogar || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección Comercial</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion_comercial"
                      value={clienteData.direccion_comercial || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Localidad *</Form.Label>
                    <Form.Control
                      type="text"
                      name="localidad"
                      value={clienteData.localidad || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <h5>Cliente Existente</h5>
              <Form.Group className="mb-3">
                <Form.Label>DNI del cliente *</Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={clienteData.dni || ''}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={8}
                  required
                />
              </Form.Group>
            </>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Continuar a Venta'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};