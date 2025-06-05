import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap'
import Swal from 'sweetalert2'
import { starCrearVentaCliente } from '../Helper/crearVenta'

export const ModalVentaSistema = ({
  showCreateModal,
  handleCloseCreateModal,
  setRefreshData,
  navigate,
  esNuevoCliente,
  item, // Cambiamos producto por item
  tipoVenta, // Añadimos tipoVenta como prop
  users,
  usuario
}) => {
  const [newUser, setNewUser] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar usuarios según rol
  const vendedores = usuario.rol === 'supervisor'
    ? users.filter(user => user.rol === "vendedor" && user.supervisorId === usuario._id)
    : users.filter(user => user.rol === "vendedor")

  const cobradores = users.filter(user => user.rol === "cobrador")
  const supervisores = users.filter(user => user.rol === "supervisor")

  // Determinar las banderas según el tipo de venta
  const getBanderasVenta = () => {
    switch (tipoVenta) {
      case 'Venta directa':
        return {
          venta_directa: true,
          plan: false,
          entrega_inmediata: false,
          permutada: false,
          pactadas: []
        }
      case 'Entrega inmediata':
        return {
          venta_directa: false,
          plan: false,
          entrega_inmediata: true,
          permutada: false,
          pactadas: []
        }
      case 'Venta Permutada':
        return {
          venta_directa: false,
          plan: false,
          entrega_inmediata: false,
          permutada: true,
          pactadas: []
        }
      case 'Plan a largo plazo':
      case 'Venta sistema 2':
      case 'Venta sistema 3':
        return {
          venta_directa: false,
          plan: true,  // Todos estos tipos tendrán plan:true
          entrega_inmediata: false,
          permutada: false,
          pactadas: tipoVenta === 'Venta sistema 2' ? [5] :
            tipoVenta === 'Venta sistema 3' ? [5, 7, 10, 12] : []
        }
      default:
        return {
          venta_directa: false,
          plan: false,
          entrega_inmediata: false,
          permutada: false,
          pactadas: []
        }
    }
  }

  // Autoasignar supervisor si el usuario es supervisor
  useEffect(() => {
    if (usuario.rol === 'supervisor') {
      setNewUser(prev => ({
        ...prev,
        sup_id: usuario._id,
        nombre_S: usuario.nombre,
        apellido_S: usuario.apellido,
        dni_S: usuario.dni,
      }))
    }
  }, [usuario])

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    let processedValue = value
    if (type === 'number' && value < 0) {
      processedValue = 0
    }

    if (name === "vendedor") {
      const vendedorSeleccionado = vendedores.find(v => v._id === value)
      setNewUser(prev => ({
        ...prev,
        ve_id: value,
        nombre_V: vendedorSeleccionado?.nombre || "",
        apellido_V: vendedorSeleccionado?.apellido || "",
        dni_V: vendedorSeleccionado?.dni || "",
      }))
    } else if (name === "supervisor" && usuario.rol !== 'supervisor') {
      const supervisorSeleccionado = supervisores.find(s => s._id === value)
      setNewUser(prev => ({
        ...prev,
        sup_id: value,
        nombre_S: supervisorSeleccionado?.nombre || "",
        apellido_S: supervisorSeleccionado?.apellido || "",
        dni_S: supervisorSeleccionado?.dni || "",
      }))
    } else if (name === "cobrador") {
      const cobradorSeleccionado = cobradores.find(c => c._id === value)
      setNewUser(prev => ({
        ...prev,
        cob_id: value,
        nombre_C: cobradorSeleccionado?.nombre || "",
        apellido_C: cobradorSeleccionado?.apellido || "",
        dni_C: cobradorSeleccionado?.dni || "",
      }))
    } else {
      setNewUser(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : processedValue,
      }))
    }
  }

  // Validaciones comunes
  const validarCampos = () => {
    if (esNuevoCliente) {
      const requiredFields = [
        'apellido', 'nombre', 'direccion_hogar', 'dni',
        'numero_telefono', 'apellido_fam', 'nombre_fam', 'localidad'
      ]

      for (const field of requiredFields) {
        if (!newUser[field] || newUser[field].trim() === '') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `El campo ${field} es obligatorio. Por favor, complételo.`,
          })
          return false
        }
      }
    } else if (!newUser.dni || newUser.dni.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'DNI obligatorio',
        text: 'Por favor, ingrese el DNI del cliente.',
      })
      return false
    }

    // Validar DNI
    if (newUser.dni.length !== 8 || isNaN(newUser.dni)) {
      Swal.fire({
        icon: 'error',
        title: 'DNI inválido',
        text: 'El DNI debe tener 8 caracteres numéricos.',
      })
      return false
    }

    // Validar email si existe
    if (newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Email inválido',
        text: 'Por favor, ingrese un email válido.',
      })
      return false
    }

    return true
  }

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validarCampos()) {
      setIsLoading(false);
      return;
    }

    const banderas = getBanderasVenta(); // Ahora incluye pactadas

    

    const ventaData = {
      ...newUser,
      clienteNuevo: esNuevoCliente,
      nombreProd: item.nombre,
      tipo: "sistema_venta",
      productoId: item._id,
      nombre_I: item.nombre,
      modelo: item.modelo,
      serial: item.imei_serial || item.numero_serie,
      costeAdmin: 0,
      ventaDirecta:banderas.venta_directa,
      largoPlazo:banderas.plan,
      entregaInmediata:banderas.entrega_inmediata,
      permutada:banderas.permutada,
      pactadas:[]=banderas.pactadas,
      tipoVenta: tipoVenta
    };

    try {
      console.log('Datos a enviar:', ventaData);
       await starCrearVentaCliente(ventaData, setRefreshData, navigate);
      setNewUser({});
      handleCloseCreateModal();
    } catch (error) {
      console.error('Error al crear venta:', error);
      Swal.fire('Error', 'No se pudo completar la venta', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar sección de datos del cliente
  const renderDatosCliente = () => (
    <>
      <h5 className="mt-4">Datos del Cliente</h5>
      {esNuevoCliente ? (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={newUser.nombre || ''}
                onChange={handleChange}
                isInvalid={!newUser.nombre} // Muestra error si está vacío
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="apellido"
                value={newUser.apellido || ''}
                onChange={handleChange}
                isInvalid={!newUser.apellido} // Muestra error si está vacío
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Familiar</Form.Label>
              <Form.Control
                type="text"
                name="nombre_fam"
                value={newUser.nombre_fam || ''}
                onChange={handleChange}
                isInvalid={!newUser.nombre_fam} // Muestra error si está vacío
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido Familiar</Form.Label>
              <Form.Control
                type="text"
                name="apellido_fam"
                value={newUser.apellido_fam || ''}
                onChange={handleChange}
                isInvalid={!newUser.apellido_fam} // Muestra error si está vacío
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>DNI</Form.Label>
              <Form.Control
                type="text"
                name="dni"
                value={newUser.dni || ''}
                onChange={handleChange}
                isInvalid={!newUser.dni} // Muestra error si está vacío
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
                value={newUser.cuil || ''}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Situación veraz</Form.Label>
              <Form.Select
                name="situacion_veraz"
                value={newUser.situacion_veraz}
                onChange={handleChange}
              >
                <option value="0">Seleccione la situación</option>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num} className={
                    num <= 2 ? "text-success" :
                      num <= 4 ? "text-warning" : "text-danger"
                  }>
                    {num}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Contacto */}
          <h5 className="mt-4">Contacto</h5>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email || ''}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono Principal</Form.Label>
              <Form.Control
                type="tel"
                name="numero_telefono"
                value={newUser.numero_telefono || ''}
                onChange={handleChange}
                isInvalid={!newUser.numero_telefono} // Muestra error si está vacío
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
                value={newUser.numero_telefono_2 || ''}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Dirección */}
          <h5 className="mt-4">Dirección</h5>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Dirección del Hogar</Form.Label>
              <Form.Control
                type="text"
                name="direccion_hogar"
                value={newUser.direccion_hogar || ''}
                onChange={handleChange}
                isInvalid={!newUser.direccion_hogar} // Muestra error si está vacío
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
                value={newUser.direccion_comercial || ''}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Localidad</Form.Label>
              <Form.Control
                type="text"
                name="localidad"
                value={newUser.localidad || ''}
                onChange={handleChange}
                isInvalid={!newUser.localidad} // Muestra error si está vacío
                required
              />
            </Form.Group>
          </Col>
        </Row>
      ) : (
        <Form.Group className="mb-3">
          <Form.Label>DNI del cliente existente</Form.Label>
          <Form.Control
            type="text"
            name="dni"
            value={newUser.dni}
            onChange={handleChange}
            minLength={8}
            maxLength={8}
            required
          />
        </Form.Group>
      )}
    </>
  )

  // Renderizar sección de datos de la venta según el tipo
  const renderDatosVenta = () => {
    const banderas = getBanderasVenta()

    return (
      <>
        <h5 className="mt-4">Datos de la Venta</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                type="text"
                value={item.nombre}
                readOnly
              />
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

        {/* Campos específicos para cada tipo de venta */}
        {banderas.venta_directa}

        {(banderas.plan || banderas.entrega_inmediata || banderas.permutada) && (
          <>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monto de la Cuota</Form.Label>
                  <Form.Control
                    type="number"
                    name="monto_cuota"
                    value={newUser.monto_cuota || ''}
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
                    value={newUser.cantidad_cuotas || ''}
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
                    value={newUser.cob_id || ''}  // Cambiado aquí
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
                    value={newUser.plazo || ''}
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

        {banderas.entrega_inmediata}

        {banderas.permutada && (
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Producto recibido en permuta</Form.Label>
                <Form.Control
                  type="text"
                  name="producto_permuta"
                  value={newUser.producto_permuta || ''}
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
                  value={newUser.valor_permuta || ''}
                  onChange={handleChange}
                  min="0"
                />
              </Form.Group>
            </Col>
          </Row>
        )}
      </>
    )
  }

  // Renderizar sección de datos del contrato
  const renderDatosContrato = () => (
    <>
      <h5 className="mt-4">Datos del Contrato</h5>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Número de Contrato</Form.Label>
            <Form.Control
              type="text"
              name="numeroContrato"
              value={newUser.numeroContrato || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha Realizada</Form.Label>
            <Form.Control
              type="date"
              name="fechaRealizada"
              value={newUser.fechaRealizada || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Monto Suscripción/Venta Directa/Permuta</Form.Label>
            <Form.Control
              type="number"
              name="monto_suscripcion_vta_dir"
              value={newUser.monto_suscripcion_vta_dir || 0}
              onChange={handleChange}
              min="0"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Método de Pago Suscripción</Form.Label>
            <Form.Select
              name="metodoPago_monto_sus_vta"
              value={newUser.metodoPago_monto_sus_vta || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione un método de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="tarjeta_debito">Tarjeta de débito</option>
              <option value="dolares">Dólares</option>
              <option value="usdt">USDT</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>


       <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Monto 2</Form.Label>
            <Form.Control
              type="number"
              name="monto_2"
              value={newUser.monto_2 || 0}
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
              value={newUser.metodoPago_2 || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione un método de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="tarjeta_debito">Tarjeta de débito</option>
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
              value={newUser.monto_3 || 0}
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
              value={newUser.metodoPago_3 || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione un método de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="tarjeta_debito">Tarjeta de débito</option>
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
              value={newUser.ve_id || ''}  // Cambiado aquí
              onChange={handleChange}
            >
              <option value="">Seleccione un Vendedor</option>
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
                value={newUser.sup_id || ''}  // Cambiado aquí
                onChange={handleChange}
              >
                <option value="">Seleccione un supervisor</option>
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
              value={newUser.tarjeta_tipo || ''}
              onChange={handleChange}
            >
              <option value="">Seleccionar uno</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </>
  )

  return (
    <Modal   show={showCreateModal} 
  onHide={handleCloseCreateModal}
  size="lg"
  backdrop="static"
  keyboard={false}
  centered
  scrollable
  enforceFocus
  restoreFocus
  className="modal-fullscreen-md-down">
      <Modal.Header closeButton>
        <Modal.Title>Formulario de Nueva Venta - {tipoVenta}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {renderDatosCliente()}
          {renderDatosVenta()}
          {renderDatosContrato()}

          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="visually-hidden">Cargando...</span>
                  {' Procesando...'}
                </>
              ) : (
                'Guardar Venta'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}