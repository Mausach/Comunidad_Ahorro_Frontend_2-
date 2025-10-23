import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';

export const ModalVentaSistema = ({
  show,
  handleClose,
  cliente,
  item,
  tipoVenta,
  users,
  usuario,
  onVentaCreada
}) => {
  const [ventaData, setVentaData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar usuarios según rol
  const vendedores = usuario.rol === 'supervisor'
    ? users.filter(user => user.rol === "vendedor" && user.supervisorId === usuario._id)
    : users.filter(user => user.rol === "vendedor");

  const cobradores = users.filter(user => user.rol === "cobrador");
  const supervisores = users.filter(user => user.rol === "supervisor");

  // Determinar las banderas según el tipo de venta
  const getBanderasVenta = () => {
    switch (tipoVenta) {
      case 'Venta directa':
        return { venta_directa: true, plan: false, entrega_inmediata: false, permutada: false, pactadas: [] };
      case 'Entrega inmediata':
        return { venta_directa: false, plan: false, entrega_inmediata: true, permutada: false, pactadas: [] };
      case 'Venta Permutada':
        return { venta_directa: false, plan: false, entrega_inmediata: false, permutada: true, pactadas: [] };
      case 'Plan a largo plazo':
      case 'Venta sistema 2':
      case 'Venta sistema 3':
        return {
          venta_directa: false,
          plan: true,
          entrega_inmediata: false,
          permutada: false,
          pactadas: tipoVenta === 'Venta sistema 2' ? [5] :
                   tipoVenta === 'Venta sistema 3' ? [5, 7, 10, 12] : []
        };
      default:
        return { venta_directa: false, plan: false, entrega_inmediata: false, permutada: false, pactadas: [] };
    }
  };

  // Autoasignar supervisor si es supervisor
  useEffect(() => {
    if (usuario.rol === 'supervisor') {
      setVentaData(prev => ({
        ...prev,
        sup_id: usuario._id,
        nombre_S: usuario.nombre,
        apellido_S: usuario.apellido,
        dni_S: usuario.dni,
      }));
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' && value < 0 ? 0 : value;

    if (name === "vendedor") {
      const vendedorSeleccionado = vendedores.find(v => v._id === value);
      setVentaData(prev => ({
        ...prev,
        ve_id: value,
        nombre_V: vendedorSeleccionado?.nombre || "",
        apellido_V: vendedorSeleccionado?.apellido || "",
        dni_V: vendedorSeleccionado?.dni || "",
      }));
    } else if (name === "supervisor" && usuario.rol !== 'supervisor') {
      const supervisorSeleccionado = supervisores.find(s => s._id === value);
      setVentaData(prev => ({
        ...prev,
        sup_id: value,
        nombre_S: supervisorSeleccionado?.nombre || "",
        apellido_S: supervisorSeleccionado?.apellido || "",
        dni_S: supervisorSeleccionado?.dni || "",
      }));
    } else if (name === "cobrador") {
      const cobradorSeleccionado = cobradores.find(c => c._id === value);
      setVentaData(prev => ({
        ...prev,
        cob_id: value,
        nombre_C: cobradorSeleccionado?.nombre || "",
        apellido_C: cobradorSeleccionado?.apellido || "",
        dni_C: cobradorSeleccionado?.dni || "",
      }));
    } else {
      setVentaData(prev => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const validarVenta = () => {
    if (!ventaData.numeroContrato) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El número de contrato es obligatorio.',
      });
      return false;
    }

    if (!ventaData.monto_suscripcion_vta_dir || !ventaData.metodoPago_monto_sus_vta) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El monto principal y método de pago son obligatorios.',
      });
      return false;
    }

    const banderas = getBanderasVenta();
    if ((banderas.plan || banderas.entrega_inmediata) && 
        (!ventaData.cantidad_cuotas || !ventaData.monto_cuota)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La cantidad de cuotas y el monto por cuota son obligatorios.',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarVenta()) return;

    setIsLoading(true);
    try {
      const banderas = getBanderasVenta();
      const datosCompletos = {
        ...ventaData,
        ...cliente, // Incluimos todos los datos del cliente
        clienteNuevo: true,
        nombreProd: item.nombre,
        tipo: "sistema_venta",
        productoId: item._id,
        nombre_I: item.nombre,
        modelo: item.modelo,
        serial: item.imei_serial || item.numero_serie,
        costeAdmin: 0,
        ventaDirecta: banderas.venta_directa,
        largoPlazo: banderas.plan,
        entregaInmediata: banderas.entrega_inmediata,
        permutada: banderas.permutada,
        pactadas: banderas.pactadas,
        tipoVenta: tipoVenta
      };

      onVentaCreada(datosCompletos);
    } catch (error) {
      console.error('Error al procesar venta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar la venta. Intente nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSeccionVenta = () => {
    const banderas = getBanderasVenta();

    return (
      <>
        <h5 className="mt-4">Datos de la Venta</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control type="text" value={item.nombre} readOnly />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Modelo/Serial</Form.Label>
              <Form.Control
                type="text"
                value={`${item.modelo} - ${item.imei_serial || item.numero_serie}`}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>

        <h6 className="mt-3">Tipo de Venta: {tipoVenta}</h6>

        {(banderas.plan || banderas.entrega_inmediata || banderas.permutada) && (
          <>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monto de la Cuota</Form.Label>
                  <Form.Control
                    type="number"
                    name="monto_cuota"
                    value={ventaData.monto_cuota || ''}
                    onChange={handleChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cantidad de Cuotas</Form.Label>
                  <Form.Control
                    type="number"
                    name="cantidad_cuotas"
                    value={ventaData.cantidad_cuotas || ''}
                    onChange={handleChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cobrador asignado</Form.Label>
                  <Form.Select
                    name="cobrador"
                    value={ventaData.cob_id || ''}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione un cobrador</option>
                    {cobradores.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.nombre} {user.apellido}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Plazo</Form.Label>
                  <Form.Select
                    name="plazo"
                    value={ventaData.plazo || ''}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar plazo</option>
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        {banderas.permutada && (
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Producto recibido en permuta</Form.Label>
                <Form.Control
                  type="text"
                  name="producto_permuta"
                  value={ventaData.producto_permuta || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Valor estimado del producto</Form.Label>
                <Form.Control
                  type="number"
                  name="valor_permuta"
                  value={ventaData.valor_permuta || ''}
                  onChange={handleChange}
                  min="0"
                />
              </Form.Group>
            </Col>
          </Row>
        )}
      </>
    );
  };

  const renderDatosContrato = () => (
    <>
      <h5 className="mt-4">Datos del Contrato</h5>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Número de Contrato *</Form.Label>
            <Form.Control
              type="text"
              name="numeroContrato"
              value={ventaData.numeroContrato || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha Realizada</Form.Label>
            <Form.Control
              type="date"
              name="fechaRealizada"
              value={ventaData.fechaRealizada || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Monto Principal *</Form.Label>
            <Form.Control
              type="number"
              name="monto_suscripcion_vta_dir"
              value={ventaData.monto_suscripcion_vta_dir || 0}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Método de Pago Principal *</Form.Label>
            <Form.Select
              name="metodoPago_monto_sus_vta"
              value={ventaData.metodoPago_monto_sus_vta || ''}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione método</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_credito">Tarjeta Crédito</option>
              <option value="tarjeta_debito">Tarjeta Débito</option>
              <option value="dolares">Dólares</option>
              <option value="usdt">USDT</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Montos adicionales 2 y 3 */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Monto 2</Form.Label>
            <Form.Control
              type="number"
              name="monto_2"
              value={ventaData.monto_2 || 0}
              onChange={handleChange}
              min="0"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Método de Pago 2</Form.Label>
            <Form.Select
              name="metodoPago_2"
              value={ventaData.metodoPago_2 || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione método</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_credito">Tarjeta Crédito</option>
              <option value="tarjeta_debito">Tarjeta Débito</option>
              <option value="dolares">Dólares</option>
              <option value="usdt">USDT</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Monto 3</Form.Label>
            <Form.Control
              type="number"
              name="monto_3"
              value={ventaData.monto_3 || 0}
              onChange={handleChange}
              min="0"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Método de Pago 3</Form.Label>
            <Form.Select
              name="metodoPago_3"
              value={ventaData.metodoPago_3 || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione método</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_credito">Tarjeta Crédito</option>
              <option value="tarjeta_debito">Tarjeta Débito</option>
              <option value="dolares">Dólares</option>
              <option value="usdt">USDT</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Vendedor asignado</Form.Label>
            <Form.Select
              name="vendedor"
              value={ventaData.ve_id || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione vendedor</option>
              {vendedores.map(user => (
                <option key={user._id} value={user._id}>
                  {user.nombre} {user.apellido}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {usuario.rol !== 'supervisor' ? (
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Supervisor</Form.Label>
              <Form.Select
                name="supervisor"
                value={ventaData.sup_id || ''}
                onChange={handleChange}
              >
                <option value="">Seleccione supervisor</option>
                {supervisores.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.nombre} {user.apellido}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        ) : (
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Supervisor</Form.Label>
              <Form.Control
                type="text"
                value={`${usuario.nombre} ${usuario.apellido}`}
                readOnly
              />
            </Form.Group>
          </Col>
        )}

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo tarjeta</Form.Label>
            <Form.Select
              name="tarjeta_tipo"
              value={ventaData.tarjeta_tipo || ''}
              onChange={handleChange}
            >
              <option value="">Seleccionar tipo</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
           <div className='d-flex align-items-center justify-content-center'>
            <i className="bi bi-1-circle-fill  text-primary pe-5"> </i>
            <i className="bi bi-arrow-right pe-5"> </i>
            <i className="bi bi-2-circle-fill  text-primary"> </i>
          </div>
          Procesar Venta - {tipoVenta}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {renderSeccionVenta()}
          {renderDatosContrato()}

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Finalizar Venta'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};