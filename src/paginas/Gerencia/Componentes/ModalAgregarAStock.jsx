import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { starCrearItems } from '../Helper/agregarStock';

export const ModalCrearItem = ({ show, handleClose, handleBackStock, setRefreshData, navigate,producto }) => {
  const [cantidad, setCantidad] = useState(0);
  const [nombreItem, setNombreItem] = useState('');
  const [modelo, setModelo] = useState('');
  const [seriales, setSeriales] = useState([]);
  const _id=producto._id;

  // Actualizar el número de campos de serial al ingresar la cantidad
  const handleCantidadChange = (e) => {
    const nuevaCantidad = parseInt(e.target.value) || 0;
    setCantidad(nuevaCantidad);
    setSeriales(Array(nuevaCantidad).fill(''));
  };

  // Actualizar un serial específico
  const handleSerialChange = (index, value) => {
    const nuevosSeriales = [...seriales];
    nuevosSeriales[index] = value;
    setSeriales(nuevosSeriales);
  };

  // Guardar (por ahora solo mostrar por consola)
  const handleGuardar = async () => {
    const inventario = seriales.map((serial) => ({
      serial: serial.trim(),
      nombreItem: nombreItem.trim(),
      modelo: modelo.trim(),
      estado: 'disponible',
      fecha_ingreso: new Date().toISOString()
    }));
  
    // 👇 Simulación del body listo para backend
    const body = { inventario,_id };
    console.log('Body para enviar al backend:', body);
  starCrearItems(body,setRefreshData,navigate);
  handleBackStock()
  
  
    handleClose();
    setCantidad(0);
    setNombreItem('');
    setModelo('');
    setSeriales([]);
    
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Crear Ítems de Inventario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Cantidad de ítems a agregar</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={cantidad}
              onChange={handleCantidadChange}
            />
          </Form.Group>

          {cantidad > 0 && (
            <>
              <Row className="mt-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Nombre del Ítem</Form.Label>
                    <Form.Control
                      type="text"
                      value={nombreItem}
                      onChange={(e) => setNombreItem(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Modelo</Form.Label>
                    <Form.Control
                      type="text"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-3">
                <h5>Seriales (IMEI)</h5>
                {seriales.map((serial, idx) => (
                  <Form.Group key={idx} className="mb-2">
                    <Form.Label>Serial #{idx + 1}</Form.Label>
                    <Form.Control
                      type="text"
                      value={serial}
                      onChange={(e) => handleSerialChange(idx, e.target.value)}
                    />
                  </Form.Group>
                ))}
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardar} disabled={seriales.some(s => s.trim() === '') || !nombreItem || !modelo}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};