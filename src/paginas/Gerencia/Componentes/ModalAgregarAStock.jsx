import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { starCrearItems } from '../Helper/agregarStock';


export const ModalCrearItem = ({ show, handleClose, setRefreshData, navigate }) => {
  const [activeTab, setActiveTab] = useState('dispositivo');
  const [cantidad, setCantidad] = useState(0);
  const [nombreItem, setNombreItem] = useState('');
  const [modelo, setModelo] = useState('');
  const [seriales, setSeriales] = useState([]);
  const [memoriaRam, setMemoriaRam] = useState('');
  const [almacenamiento, setAlmacenamiento] = useState('');
  const [bateria, setBateria] = useState('');
  const [color, setColor] = useState('');
  const [caracteristicas, setCaracteristicas] = useState('');
  const [categoriaAccesorio, setCategoriaAccesorio] = useState('otros');
  const [precioCompra, setPrecioCompra] = useState(0);
  const [precioVenta, setPrecioVenta] = useState(0);
  
  //const _id = producto._id;

  const handleCantidadChange = (e) => {
    const nuevaCantidad = parseInt(e.target.value) || 0;
    setCantidad(nuevaCantidad);
    setSeriales(Array(nuevaCantidad).fill(''));
  };

  const handleSerialChange = (index, value) => {
    const nuevosSeriales = [...seriales];
    nuevosSeriales[index] = value;
    setSeriales(nuevosSeriales);
  };

  const handleGuardar = async () => {
    const items = seriales.map((serial) => {
      const itemBase = {
        nombre: nombreItem.trim(),
        tipo: activeTab,
        estado: 'disponible',
        fecha_ingreso: new Date().toISOString(),
        precio_compra: parseFloat(precioCompra) || 0,
        precio_venta: parseFloat(precioVenta) || 0,
        imei_serial: serial.trim(),
        numero_serie: serial.trim() // Puedes ajustar esto según necesites
      };

      if (activeTab === 'dispositivo') {
        return {
          ...itemBase,
          modelo: modelo.trim(),
          memoria_ram: memoriaRam.trim(),
          almacenamiento: almacenamiento.trim(),
          bateria: bateria.trim(),
          color: color.trim(),
          caracteristicas: caracteristicas.trim()
        };
      } else {
        return {
          ...itemBase,
          categoria_accesorio: categoriaAccesorio,
          caracteristicas: caracteristicas.trim()
        };
      }
    });

    const body = { items};
    console.log('Body para enviar al backend:', body);
    await starCrearItems(body, setRefreshData, navigate);
    
    // Resetear el formulario
    handleReset();
    handleClose();
  };

  const handleReset = () => {
    setCantidad(0);
    setNombreItem('');
    setModelo('');
    setSeriales([]);
    setMemoriaRam('');
    setAlmacenamiento('');
    setBateria('');
    setColor('');
    setCaracteristicas('');
    setCategoriaAccesorio('otros');
    setPrecioCompra(0);
    setPrecioVenta(0);
  };

  const validarFormulario = () => {
    if (seriales.some(s => s.trim() === '')) return true;
    if (!nombreItem.trim()) return true;
    if (activeTab === 'dispositivo' && !modelo.trim()) return true;
    if (activeTab === 'accesorio' && !categoriaAccesorio) return true;
    return false;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Items al Inventario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          <Tab eventKey="dispositivo" title="Dispositivo">
            <Form className="mt-3">
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
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Nombre del dispositivo*</Form.Label>
                        <Form.Control
                          type="text"
                          value={nombreItem}
                          onChange={(e) => setNombreItem(e.target.value)}
                          placeholder="Ej: SMARTPHONE SAMSUNG"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Modelo*</Form.Label>
                        <Form.Control
                          type="text"
                          value={modelo}
                          onChange={(e) => setModelo(e.target.value)}
                          placeholder="Ej: GALAXY S21"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Memoria RAM</Form.Label>
                        <Form.Control
                          type="text"
                          value={memoriaRam}
                          onChange={(e) => setMemoriaRam(e.target.value)}
                          placeholder="Ej: 8GB"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Almacenamiento</Form.Label>
                        <Form.Control
                          type="text"
                          value={almacenamiento}
                          onChange={(e) => setAlmacenamiento(e.target.value)}
                          placeholder="Ej: 128GB"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Batería</Form.Label>
                        <Form.Control
                          type="text"
                          value={bateria}
                          onChange={(e) => setBateria(e.target.value)}
                          placeholder="Ej: 4000mAh"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Color</Form.Label>
                        <Form.Control
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          placeholder="Ej: Negro"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Características</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={caracteristicas}
                          onChange={(e) => setCaracteristicas(e.target.value)}
                          placeholder="Descripción adicional"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="mt-3">
                    <h5>Seriales (IMEI/Número de serie)*</h5>
                    {seriales.map((serial, idx) => (
                      <Form.Group key={idx} className="mb-2">
                        <Form.Label>Item #{idx + 1}</Form.Label>
                        <Form.Control
                          type="text"
                          value={serial}
                          onChange={(e) => handleSerialChange(idx, e.target.value)}
                          placeholder="Ingrese el IMEI o número de serie"
                        />
                      </Form.Group>
                    ))}
                  </div>
                </>
              )}
            </Form>
          </Tab>

          <Tab eventKey="accesorio" title="Accesorio">
            <Form className="mt-3">
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
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Nombre del accesorio*</Form.Label>
                        <Form.Control
                          type="text"
                          value={nombreItem}
                          onChange={(e) => setNombreItem(e.target.value)}
                          placeholder="Ej: AURICULARES INALÁMBRICOS"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Categoría*</Form.Label>
                        <Form.Select
                          value={categoriaAccesorio}
                          onChange={(e) => setCategoriaAccesorio(e.target.value)}
                        >
                          <option value="cargador">Cargador</option>
                          <option value="auricular">Auricular</option>
                          <option value="funda">Funda</option>
                          <option value="protector">Protector</option>
                          <option value="cable">Cable</option>
                          <option value="otros">Otros</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mt-3">
                    <Form.Label>Características</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={caracteristicas}
                      onChange={(e) => setCaracteristicas(e.target.value)}
                      placeholder="Descripción del accesorio, compatibilidad, etc."
                    />
                  </Form.Group>

                  <div className="mt-3">
                    <h5>Identificación (Serial/Número de serie)*</h5>
                    {seriales.map((serial, idx) => (
                      <Form.Group key={idx} className="mb-2">
                        <Form.Label>Item #{idx + 1}</Form.Label>
                        <Form.Control
                          type="text"
                          value={serial}
                          onChange={(e) => handleSerialChange(idx, e.target.value)}
                          placeholder="Ingrese el número de serie o identificador"
                        />
                      </Form.Group>
                    ))}
                  </div>
                </>
              )}
            </Form>
          </Tab>
        </Tabs>

        {/* Sección común para ambos tipos */}
        {cantidad > 0 && (
          <div className="mt-3 p-3 border-top">
            <h5>Información económica</h5>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Precio de compra unitario</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Precio de venta unitario</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { handleReset(); handleClose(); }}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleGuardar} 
          disabled={validarFormulario()}
        >
          Guardar Items
        </Button>
      </Modal.Footer>
    </Modal>
  );
};