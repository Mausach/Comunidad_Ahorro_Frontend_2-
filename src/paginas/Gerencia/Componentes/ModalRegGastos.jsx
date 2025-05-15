import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { starCrearGastos } from '../Helper/CrearGastos';
//import { starCrearGastos } from '../../Helpers/AltaGastos';

export const ModalRegistGasto = ({ show, handleClose, usuario, setRefreshData, navigate }) => {
   
  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar que el monto sea mayor que 0
    if (monto <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Monto inválido',
        text: 'El monto debe ser mayor que 0.',
      });
      return;
    }

    // Validar que la descripción no esté vacía
    if (!descripcion.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Descripción vacía',
        text: 'La descripción no puede estar vacía.',
      });
      return;
    }
    const gasData = {

         descripcion_gasto:descripcion,
            Monto_gasto: monto,
            responsable:  usuario.nombre+' '+usuario.apellido

    };

    // Llamar a la función handleSave con los datos del gasto
    starCrearGastos(gasData, setRefreshData, navigate)



    // Limpiar el formulario y cerrar el modal
    setMonto(0);
    setDescripcion('');
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Registrar Gasto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="monto">
            <Form.Label>Monto</Form.Label>
            <Form.Control
              type="number"
              value={monto}
              onChange={(e) => setMonto(parseFloat(e.target.value))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="descripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};