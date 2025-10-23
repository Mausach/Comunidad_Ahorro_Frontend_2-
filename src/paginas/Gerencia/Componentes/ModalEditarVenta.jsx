import React, { useState, useEffect } from 'react';
import {
  Modal, Tabs, Tab, Form, Button, Row, Col,
  Accordion, Card, Badge, Alert
} from 'react-bootstrap';
import { starEditarVenta } from '../Helper/Editar_Ventas';

const EditarVentaModal = ({  show, 
  onHide, 
  venta, 
  navigate, 
  setRefreshData }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Inicializar formData con los datos de la venta
  useEffect(() => {
    if (venta) {
      setFormData(venta);
    }
  }, [venta]);

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // FUNCIÓN PARA NORMALIZAR FECHAS ANTES DE ENVIAR
  const normalizarFechasParaBackend = (datos) => {
    const datosNormalizados = { ...datos };

    // Normalizar fechaRealizada
    if (datosNormalizados.fechaRealizada) {
      if (typeof datosNormalizados.fechaRealizada === 'string') {
        // Solo convertir si no está vacío
        datosNormalizados.fechaRealizada = new Date(datosNormalizados.fechaRealizada);
      }
    }

    // Normalizar fechas de cuotas si existen
    if (datosNormalizados.cuotas && Array.isArray(datosNormalizados.cuotas)) {
      datosNormalizados.cuotas = datosNormalizados.cuotas.map(cuota => {
        const cuotaNormalizada = { ...cuota };

        // Normalizar fechaCobro - solo si tiene valor
        if (cuotaNormalizada.fechaCobro && cuotaNormalizada.fechaCobro !== '') {
          if (typeof cuotaNormalizada.fechaCobro === 'string') {
            cuotaNormalizada.fechaCobro = new Date(cuotaNormalizada.fechaCobro);
          }
        } else {
          // Mantener null si no hay fecha seleccionada
          cuotaNormalizada.fechaCobro = cuota.fechaCobro || null;
        }

        // Normalizar fechaCobrada (si existe)
        if (cuotaNormalizada.fechaCobrada && cuotaNormalizada.fechaCobrada !== '') {
          if (typeof cuotaNormalizada.fechaCobrada === 'string') {
            cuotaNormalizada.fechaCobrada = new Date(cuotaNormalizada.fechaCobrada);
          }
        } else {
          cuotaNormalizada.fechaCobrada = cuota.fechaCobrada || null;
        }

        return cuotaNormalizada;
      });
    }

    return datosNormalizados;
  };

 

  const handleGuardar = async () => {
  setLoading(true);
  try {
    const datosNormalizados = normalizarFechasParaBackend(formData);

    // ✅ Solo llamar a la API
    await starEditarVenta(
      venta._id,
      datosNormalizados,
      setRefreshData,
      navigate
    );

    // ✅ SOLO refrescar datos - ELIMINAR onUpdate
    
    onHide(); // Cerrar modal

  } catch (error) {
    console.error('Error al guardar:', error);
  }
  setLoading(false);
};

  const handleAgregarCuota = () => {
    const nuevaCuota = {
      numeroCuota: formData.cuotas ? formData.cuotas.length + 1 : 1,
      montoCuota: 0,
      metodoPago: null, // ✅ Cambiado de '' a null
      estado_cuota: 'pendiente',
      fechaCobro: null, // ✅ Cambiado de new Date() a null
      comentario: ''
    };

    setFormData(prev => ({
      ...prev,
      cuotas: [...(prev.cuotas || []), nuevaCuota]
    }));
  };

  const handleRemoverCuota = (index) => {
    setFormData(prev => ({
      ...prev,
      cuotas: prev.cuotas.filter((_, i) => i !== index)
    }));
  };


  const handleCuotaChange = (index, field, value) => {
    setFormData(prev => {
      const nuevasCuotas = [...prev.cuotas];

      // Solo actualizar si el valor no está vacío
      if (value !== '' && value !== null) {
        nuevasCuotas[index] = {
          ...nuevasCuotas[index],
          [field]: value
        };
      }
      // Si está vacío, mantener el valor original de la cuota
      // No hacemos cambios en ese caso

      return { ...prev, cuotas: nuevasCuotas };
    });
  };

  if (!venta) return null;

  return (
    <Modal size="xl" show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          Editar Venta - {venta.numeroContrato}
          <Badge bg="secondary" className="ms-2">
            {venta.conducta_o_instancia}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">

          {/* PESTAÑA INFORMACIÓN GENERAL */}
          <Tab eventKey="general" title="📋 General">
            <InformacionGeneral
              formData={formData}
              onChange={handleInputChange}
            />
          </Tab>

          {/* PESTAÑA PRODUCTO */}
          <Tab eventKey="producto" title="📦 Producto">
            <InformacionProducto
              formData={formData}
              onChange={handleInputChange}
            />
          </Tab>

          {/* PESTAÑA CUOTAS */}
          <Tab eventKey="cuotas" title="📅 Cuotas">
            <GestionCuotas
              cuotas={formData.cuotas || []}
              onAdd={handleAgregarCuota}
              onRemove={handleRemoverCuota}
              onChange={handleCuotaChange}
            />
          </Tab>

          {/* PESTAÑA CLIENTE */}
          <Tab eventKey="cliente" title="👤 Cliente">
            <InformacionCliente
              formData={formData}
              onChange={handleInputChange}
            />
          </Tab>

        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleGuardar}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// COMPONENTE INFORMACIÓN GENERAL - CORREGIDO CON type="date"
const InformacionGeneral = ({ formData, onChange }) => {

  // Función para formatear fecha al input date
  const formatearFechaParaInput = (fecha) => {
    if (!fecha) return '';

    try {
      // Si es string formateada "dd/mm/yyyy" del backend
      if (typeof fecha === 'string' && fecha.includes('/')) {
        const [day, month, year] = fecha.split('/');
        return `${year}-${month}-${day}`; // Convertir a YYYY-MM-DD
      }

      // Si es Date object o ISO string
      const dateObj = new Date(fecha);
      if (isNaN(dateObj.getTime())) return '';

      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  };

  // Función para obtener el texto amigable del método de pago
  const getMetodoPagoTexto = (metodo) => {
    switch (metodo) {
      case 'efectivo': return 'Efectivo 💵';
      case 'transferencia': return 'Transferencia 🏦';
      case 'tarjeta': return 'Tarjeta 💳';
      default: return metodo || 'No especificado';
    }
  };

  return (
    <Row>
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Número de Contrato</Form.Label>
          <Form.Control
            type="text"
            value={formData.numeroContrato || ''}
            onChange={(e) => onChange('numeroContrato', e.target.value)}
          />
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Fecha Realizada</Form.Label>
          <Form.Control
            type="date"
            value={formatearFechaParaInput(formData.fechaRealizada)}
            onChange={(e) => onChange('fechaRealizada', e.target.value)}
          />
          <Form.Text className="text-muted">
            Formato: DD/MM/AAAA
          </Form.Text>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Método Pago Principal</Form.Label>
          <div className="d-flex align-items-center gap-2">
            {/* Mostrar el método actual como badge */}
            {formData.metodoPago_monto_sus_vta && (
              <Badge
                bg="primary"
                className="fs-6 px-3 py-2"
                style={{ minWidth: '120px' }}
              >
                {getMetodoPagoTexto(formData.metodoPago_monto_sus_vta)}
              </Badge>
            )}

            {/* Select para cambiar el método */}
            <Form.Select
              value={formData.metodoPago_monto_sus_vta || ''}
              onChange={(e) => onChange('metodoPago_monto_sus_vta', e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Cambiar método...</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_credito">Tarjeta Crédito</option>
              <option value="tarjeta_debito">Tarjeta Débito</option>
              <option value="dolares">Dólares</option>
              <option value="usdt">USDT</option>
            </Form.Select>
          </div>
          <Form.Text className="text-muted">
            Método actual: {getMetodoPagoTexto(formData.metodoPago_monto_sus_vta)}
          </Form.Text>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Monto Principal</Form.Label>
          <Form.Control
            type="number"
            value={formData.monto_suscripcion_vta_dir || 0}
            onChange={(e) => onChange('monto_suscripcion_vta_dir', Number(e.target.value))}
          />
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Conducta/Instancia</Form.Label>
          <Form.Select
            value={formData.conducta_o_instancia || 'al dia'}
            onChange={(e) => onChange('conducta_o_instancia', e.target.value)}
          >
            <option value="al dia">Al día</option>
            <option value="canselado">Cancelado</option>
            <option value="refinanciado">Refinanciado</option>
            <option value="atrasado">Atrasado</option>
            <option value="cobro judicial">Cobro Judicial</option>
            <option value="caducado">Caducado</option>
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            label="Estado Activo"
            checked={formData.estado !== false}
            onChange={(e) => onChange('estado', e.target.checked)}
          />
        </Form.Group>
      </Col>
    </Row>
  );
};
// COMPONENTE INFORMACIÓN PRODUCTO MEJORADO (sin cambios)
const InformacionProducto = ({ formData, onChange }) => (
  <Accordion defaultActiveKey="0">
   

    <Accordion.Item eventKey="1">
      <Accordion.Header>📦 Item de Inventario</Accordion.Header>
      <Accordion.Body>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Item *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Laptop Dell, iPhone 13..."
                value={formData.producto?.detalle?.venta?.itemInventario?.nombre || ''}
                onChange={(e) => onChange('producto.detalle.venta.itemInventario.nombre', e.target.value)}
              />
              <Form.Text className="text-muted">
                Nombre descriptivo del producto
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Modelo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: XPS 13, SM-G998B..."
                value={formData.producto?.detalle?.venta?.itemInventario?.modelo || ''}
                onChange={(e) => onChange('producto.detalle.venta.itemInventario.modelo', e.target.value)}
              />
              <Form.Text className="text-muted">
                Modelo específico del producto
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Serial/N° Serie *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: SN123456789..."
                value={formData.producto?.detalle?.venta?.itemInventario?.serial || ''}
                onChange={(e) => onChange('producto.detalle.venta.itemInventario.serial', e.target.value)}
              />
              <Form.Text className="text-muted">
                Número de serie único del producto
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Información adicional para ventas permutadas */}
        {(formData.producto?.detalle?.venta?.banderas?.permutada) && (
          <>
            <hr />
            <h6>Información de Permuta</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Objeto Recibido</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.producto?.detalle?.venta?.objetoRecibido || ''}
                    onChange={(e) => onChange('producto.detalle.venta.objetoRecibido', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monto Objeto Recibido</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.producto?.detalle?.venta?.montoObjetoRecibido || 0}
                    onChange={(e) => onChange('producto.detalle.venta.montoObjetoRecibido', Number(e.target.value))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}
      </Accordion.Body>
    </Accordion.Item>

    {/* Sección para préstamos */}
    {formData.producto?.detalle?.prestamo && (
      <Accordion.Item eventKey="2">
        <Accordion.Header>💰 Información de Préstamo</Accordion.Header>
        <Accordion.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Monto Prestado</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.producto?.detalle?.prestamo?.montoPrestado || 0}
                  onChange={(e) => onChange('producto.detalle.prestamo.montoPrestado', Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Plazo</Form.Label>
                <Form.Select
                  value={formData.producto?.detalle?.prestamo?.plazo || ''}
                  onChange={(e) => onChange('producto.detalle.prestamo.plazo', e.target.value)}
                >
                  <option value="">Seleccionar plazo...</option>
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    )}
  </Accordion>
);


// COMPONENTE GESTIÓN DE CUOTAS - CORREGIDO PARA MANTENER VALORES ORIGINALES
const GestionCuotas = ({ cuotas, onAdd, onRemove, onChange }) => {

  const formatearFechaParaInput = (fecha) => {
    if (!fecha) return '';

    try {
      // Si es string formateada "dd/mm/yyyy" del backend
      if (typeof fecha === 'string' && fecha.includes('/')) {
        const [day, month, year] = fecha.split('/');
        return `${year}-${month}-${day}`;
      }

      // Si es Date object o ISO string
      const dateObj = new Date(fecha);
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Función para manejar cambios manteniendo valores originales si están vacíos
  const handleCuotaChange = (index, field, value) => {
    // Si el campo está vacío y la cuota original tenía un valor, mantener el original
    if ((value === '' || value === null) && cuotas[index] && cuotas[index][field] !== undefined) {
      // No hacer cambio, mantener el valor original
      return;
    }

    // Solo actualizar si hay un valor nuevo
    onChange(index, field, value);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Gestión de Cuotas</h5>
        <Button variant="success" size="sm" onClick={onAdd}>
          + Agregar Cuota
        </Button>
      </div>

      {cuotas.length === 0 ? (
        <Alert variant="info">No hay cuotas registradas</Alert>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {cuotas.map((cuota, index) => (
            <Card key={index} className="mb-2">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">N° Cuota</Form.Label>
                      <Form.Control
                        type="number"
                        value={cuota.numeroCuota || ''}
                        onChange={(e) => handleCuotaChange(index, 'numeroCuota', Number(e.target.value))}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">Monto</Form.Label>
                      <Form.Control
                        type="number"
                        value={cuota.montoCuota || ''}
                        onChange={(e) => handleCuotaChange(index, 'montoCuota', Number(e.target.value))}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">Fecha Cobro</Form.Label>
                      <Form.Control
                        type="date"
                        value={formatearFechaParaInput(cuota.fechaCobro)}
                        onChange={(e) => handleCuotaChange(index, 'fechaCobro', e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">Método Pago</Form.Label>
                      <Form.Select
                        value={cuota.metodoPago || ''}
                        onChange={(e) => handleCuotaChange(index, 'metodoPago', e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">Estado</Form.Label>
                      <Form.Select
                        value={cuota.estado_cuota || 'pendiente'}
                        onChange={(e) => handleCuotaChange(index, 'estado_cuota', e.target.value)}
                      >
                        <option value="pago">Pagado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="no pagado">No pagado</option>
                        <option value="impago">Impago</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={1}>
                    <Form.Group>
                      <Form.Label className="small text-white">.</Form.Label>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="w-100"
                      >
                        ✕
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Comentario adicional si existe */}
                {cuota.comentario && (
                  <Row className="mt-2">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="small">Comentario</Form.Label>
                        <Form.Control
                          type="text"
                          value={cuota.comentario || ''}
                          onChange={(e) => handleCuotaChange(index, 'comentario', e.target.value)}
                          placeholder="Comentario sobre la cuota..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// COMPONENTE INFORMACIÓN CLIENTE ACTUALIZADO
const InformacionCliente = ({ formData, onChange }) => (
  <Row>
    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Nombre *</Form.Label>
        <Form.Control
          type="text"
          value={formData.cliente?.nombre || ''}
          onChange={(e) => onChange('cliente.nombre', e.target.value)}
          placeholder="Nombre del cliente"
        />
      </Form.Group>
    </Col>

    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Apellido *</Form.Label>
        <Form.Control
          type="text"
          value={formData.cliente?.apellido || ''}
          onChange={(e) => onChange('cliente.apellido', e.target.value)}
          placeholder="Apellido del cliente"
        />
      </Form.Group>
    </Col>

    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>DNI *</Form.Label>
        <Form.Control
          type="text"
          value={formData.cliente?.dni || ''}
          onChange={(e) => onChange('cliente.dni', e.target.value)}
          placeholder="Número de documento"
        />
      </Form.Group>
    </Col>

    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Teléfono</Form.Label>
        <Form.Control
          type="text"
          value={formData.cliente?.telefono || ''}
          onChange={(e) => onChange('cliente.telefono', e.target.value)}
          placeholder="Número de contacto"
        />
      </Form.Group>
    </Col>

    <Col md={12}>
      <Form.Group className="mb-3">
        <Form.Label>Dirección Principal</Form.Label>
        <Form.Control
          type="text"
          value={formData.cliente?.direccion || ''}
          onChange={(e) => onChange('cliente.direccion', e.target.value)}
          placeholder="Dirección completa del cliente"
        />
        <Form.Text className="text-muted">
          Calle, número, barrio, ciudad
        </Form.Text>
      </Form.Group>
    </Col>

    <Col md={12}>
      <Form.Group className="mb-3">
        <Form.Label>Dirección Secundaria / Referencia</Form.Label>
        <Form.Control
          type="text"
          value={formData.cliente?.direccion_2 || ''}
          onChange={(e) => onChange('cliente.direccion_2', e.target.value)}
          placeholder="Dirección alternativa o puntos de referencia"
        />
        <Form.Text className="text-muted">
          Puntos de referencia, dirección de trabajo, etc.
        </Form.Text>
      </Form.Group>
    </Col>

    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Nombre Familiar/Referencia</Form.Label>
        <Form.Control
          type="text"
          value={formData.cliente?.nombre_fam || ''}
          onChange={(e) => onChange('cliente.nombre_fam', e.target.value)}
          placeholder="Nombre del familiar o contacto"
        />
        <Form.Text className="text-muted">
          Persona de referencia o familiar directo
        </Form.Text>
      </Form.Group>
    </Col>

    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Apellido Familiar/Referencia</Form.Label>
        <Form.Control
          type="text"
          value={formData.cliente?.apellido_fam || ''}
          onChange={(e) => onChange('cliente.apellido_fam', e.target.value)}
          placeholder="Apellido del familiar o contacto"
        />
      </Form.Group>
    </Col>
  </Row>
);

export default EditarVentaModal;