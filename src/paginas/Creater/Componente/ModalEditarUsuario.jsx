import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import { Accordion, Button, Col, Form, ListGroup, Row } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup'; // Importar InputGroup para íconos
import { Eye, EyeSlash } from 'react-bootstrap-icons'; // Importar íconos

import Swal from 'sweetalert2';
import { starEditarUsuario } from '../Helper/EditarUsuario';
import { realizarPago } from '../Helper/RealizarPago';

export const ModalEditUsuarios = ({ showModal, showModalER, handleCloseModal, handleCloseModalER, setRefreshData, navigate, selectedUser, usuario }) => {

  const responsable = usuario.nombre + ' ' + usuario.apellido;
  const [editedUser, setEditedUser] = useState({
    _id: '', // ID del usuario seleccionado, necesario para identificar al usuario a editar
    nombre: '',
    apellido: '',
    direccion: '',
    //direccionSecundaria:'',
    dni: '', //cambiar en el modal a tipo number y ver de parsearlo a string antes de mandarlo al backend para cuil y tel tambn
    cuil: '',
    email: '',
    telefono: '',
    telefonoSecundario: '',
    localidad: '',
    apellido_fam: '',
    nombre_fam: '',

    monotributo: false, // Campo booleano que se ingresa en el formulario

    userName: '',
    password: '',
    rol: '', // Cambiado de "rol" a "rolId" para coincidir con el backend
  });
  const [montosPago, setMontosPago] = useState({});

  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña

  //para el select de roles
  const getAvailableRoles = () => {
    const allRoles = ["gerente", "administrador", "supervisor", "vendedor", "cobrador"];
    if (usuario?.rol === 'administrador') {
      return allRoles.filter(role => role !== 'gerente');
    }
    return allRoles;
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePassword = () => setShowPassword(!showPassword);

  // Manejar cambios en el formulario de edicion
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  //para editar
  const handleUpdate = (e) => {
    e.preventDefault();
    const form = e.target;

    const newUser = {
      _id: selectedUser._id,
      nombre: form.nombre?.value || selectedUser.nombre,
      apellido: form.apellido?.value || selectedUser.apellido,
      direccion: form.direccion?.value || selectedUser.direccion,
      dni: form.dni?.value || selectedUser.dni,
      cuil: form.cuil?.value || selectedUser.cuil,
      email: form.email?.value || selectedUser.email,
      telefono: form.telefono?.value || selectedUser.telefono,
      telefonoSecundario: form.telefonoSecundario?.value || selectedUser.telefonoSecundario,
      apellido_fam: form.apellido_fam?.value || selectedUser.apellido_fam,
      nombre_fam: form.nombre_fam?.value || selectedUser.nombre_fam,



      monotributo: editedUser.monotributo || false,

      userName: form.userName?.value || selectedUser.userName,
      // Solo incluir la contraseña si es proporcionada
      password: form.password && form.password.value ? form.password.value : undefined,
      rol: form.rol?.value || selectedUser.rol
    };

    // Validación de campos obligatorios
    if (
      !newUser.nombre.trim() ||
      !newUser.apellido.trim() ||

      !newUser.telefono.trim() ||
      !newUser.userName.trim()


    ) {
      console.log(newUser)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son obligatorios. Por favor, complete todos los datos.',
      });
      return;
    }

    // Validación del rol seleccionado
    if (!newUser.rol) {
      Swal.fire({
        icon: 'error',
        title: 'Rol no seleccionado',
        text: 'Por favor, seleccione un rol válido.',
      });
      return;
    }


    // Validación del nombre
    if (newUser.nombre.length > 0 && !/^[a-zA-Z\s]+$/.test(newUser.nombre)) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre inválido',
        text: 'El nombre solo puede contener letras y espacios.',
      });
      return;
    }

    // Validación apellido
    if (newUser.apellido.length > 0 && !/^[a-zA-Z\s]+$/.test(newUser.apellido)) {
      Swal.fire({
        icon: 'error',
        title: 'Apellido inválido',
        text: 'El apellido solo puede contener letras y espacios.',
      });
      return;
    }



    // Validación del email
    if (newUser.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Email inválido',
        text: 'Por favor, ingrese un email válido.',
      });
      return;
    }

    // Validación de la direccion
    if (newUser.direccion.length > 0 && !/^[a-zA-Z0-9\s]+$/.test(newUser.direccion)) {
      Swal.fire({
        icon: 'error',
        title: 'Dirección inválida',
        text: 'La dirección solo puede contener letras, números y espacios.',
      });
      return;
    }

    if (newUser.cuil && newUser.cuil.trim() !== '') {
      // Validar longitud y que sea numérico
      if (newUser.cuil.length !== 11 || isNaN(newUser.cuil)) {
        Swal.fire({
          icon: 'error',
          title: 'CUIL inválido',
          text: 'El CUIL debe tener 11 caracteres numéricos.',
        });
        return;
      }

      // Verificar que el CUIL contenga el DNI
      if (!newUser.cuil.includes(newUser.dni)) {
        Swal.fire({
          icon: 'error',
          title: 'CUIL inválido',
          text: 'El CUIL debe contener el número de DNI como parte de su estructura.',
        });
        return;
      }
    }

    //falta validacion de un numero de telefono
    if (newUser.telefono.length > 12 || isNaN(newUser.telefono)) {
      Swal.fire({
        icon: 'error',
        title: 'Telefono inválido',
        text: 'El Telefono debe tener 8 caracteres numéricos.',
      });
      return;
    }



    // Validación de la contraseña
    if (newUser.password !== undefined && newUser.password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña demasiado corta',
        text: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    console.log(newUser, selectedUser.password);

    // Actualizar el usuario
    starEditarUsuario(newUser, setRefreshData, navigate);

    //debo limpiar el check cuando termine de guardar cambios el de monotributo
    handleCloseModal()


  };

  const handlePagarSaldo = async (usuarioId, saldoPendiente, montoIngresado) => {

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Realizar pago el monto pendiente?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, realizar pago",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {

      if (montoIngresado <= 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: 'monto debe ser mayor a 0',
        });
        return; // Detener la ejecución si el monto no es válido
      }

      // Validar que el monto no sea mayor que el saldo pendiente
      if (montoIngresado > saldoPendiente) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `El monto ingresado (${montoIngresado}) es mayor que el saldo pendiente (${saldoPendiente}).`,
        });
        return; // Detener la ejecución si el monto no es válido
      }



      // Si el monto es válido, proceder con el pago
      try {

        console.log({ usuarioId, montoIngresado, saldoPendiente, responsable });
        await realizarPago(usuarioId, montoIngresado, responsable, setRefreshData, navigate);

        handleCloseModalER();

        // Limpiar el monto ingresado en el estado local
        setMontosPago({});
      } catch (error) {
        // El manejo de errores ya está incluido en starActualizarSaldo
        console.error("Error al realizar el pago:", error);
      }

    }


  };


  return (
    <div>
      {/* Modal para editar datos personales usuario */}
      {selectedUser && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar Información del Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdate}>
              <Row>
                {/* Nombres y Apellido */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombres</Form.Label>
                    <Form.Control
                      type="text"
                      minLength={3}
                      maxLength={25}
                      name="nombre"
                      defaultValue={selectedUser.nombre}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      type="text"
                      minLength={3}
                      maxLength={25}
                      name="apellido"
                      defaultValue={selectedUser.apellido}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                {/* Selección de Rol */}
                 <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Rol</Form.Label>
                                <Form.Select
                                    name="rol"
                                    defaultValue={selectedUser.rol}
                                    onChange={handleChange}
                                  
                                >
                                    <option value="">Seleccione un rol</option>
                                    {getAvailableRoles().map((rol) => (
                                        <option key={rol} value={rol}>
                                            {rol.charAt(0).toUpperCase() + rol.slice(1)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                {/* Dirección y Contacto */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      minLength={7}
                      maxLength={65}
                      name="direccion"
                      defaultValue={selectedUser.direccion}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      minLength={13}
                      maxLength={35}
                      name="email"
                      defaultValue={selectedUser.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                {/* Más detalles */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>DNI</Form.Label>
                    <Form.Control
                      type="text"
                      minLength={8}
                      maxLength={8}
                      name="dni"
                      defaultValue={selectedUser.dni}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CUIL</Form.Label>
                    <Form.Control
                      type="text"

                      maxLength={11}
                      name="cuil"
                      defaultValue={selectedUser.cuil}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                {/* Teléfonos */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      minLength={7}
                      maxLength={12}
                      name="telefono"
                      defaultValue={selectedUser.telefono}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono secundario</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={12}
                      name="telefonoSecundario"
                      defaultValue={selectedUser.telefonoSecundario}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                {/* Familiares */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombres familiar directo</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={25}
                      name="nombre_fam"
                      defaultValue={selectedUser.nombre_fam}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido familiar directo</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={25}
                      name="apellido_fam"
                      defaultValue={selectedUser.apellido_fam}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                {/* Nombre de Usuario y Contraseña */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre de Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      minLength={3}
                      maxLength={25}
                      name="userName"
                      defaultValue={selectedUser.userName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        minLength={6}
                        name="password"
                        defaultValue={selectedUser.password}
                        onChange={handleChange}
                      />
                      <InputGroup.Text onClick={togglePassword} style={{ cursor: 'pointer' }}>
                        {showPassword ? <Eye /> : <EyeSlash />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </Col>

                {/* Monotributo */}
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monotributo:</Form.Label>
                    <Form.Check
                      type="checkbox"

                      checked={editedUser.monotributo}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, monotributo: e.target.checked })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit">
                Guardar Cambios
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Modal para editar datos rendimientos usuario */}
      {selectedUser && (
        <Modal show={showModalER} onHide={handleCloseModalER} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Saldo y Pagos de {selectedUser.nombres} {selectedUser.apellido}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup>

              {/* Saldo del usuario */}
              <ListGroup className="mb-2">
                <ListGroup.Item>
                  {/* <div><strong>Total:</strong> ${supervisor.saldo?.saldoPendiente || 0}</div> */}

                  <div><strong>Pendiente:</strong> ${selectedUser.saldoPendiente}</div>
                </ListGroup.Item>
              </ListGroup>

              <ListGroup>
                <ListGroup.Item className="d-grid gap-2">
                  <Form.Group className="mb-3" controlId={`formPago-${selectedUser}`}>
                    <Form.Label>Monto a pagar</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={montosPago[selectedUser] || ""}
                      onChange={(e) =>
                        setMontosPago({
                          ...montosPago,
                          [selectedUser]: Number(e.target.value),
                        })
                      }
                      placeholder="Ingresar monto"
                    />

                    <Button
                      className="m-3"
                      variant="success"
                      size="sm"
                      onClick={() =>
                        handlePagarSaldo(
                          selectedUser._id,
                          selectedUser.saldoPendiente,
                          montosPago[selectedUser] || 0
                        )
                      }
                    >
                      Pagar saldo
                    </Button>
                  </Form.Group>
                </ListGroup.Item>
              </ListGroup>

              {/* Historial del Supervisor */}
              <Accordion className="mb-3">
                <Accordion.Item eventKey="sup-historial">
                  <Accordion.Header>Historial de pagos del supervisor</Accordion.Header>
                  <Accordion.Body>
                    <ListGroup variant="flush">
                      {selectedUser.saldoRendido.length > 0 ? (
                        selectedUser.saldoRendido.map((pago, i) => (
                          <ListGroup.Item key={i}>
                            <div><strong>Monto:</strong> ${pago.monto}</div>
                            <div><strong>Fecha:</strong> {pago.fecha}</div>
                            <div><strong>Hecho por:</strong> {pago.responsable}</div>
                          </ListGroup.Item>
                        ))
                      ) : (
                        <div className="text-muted">No hay pagos registrados.</div>
                      )}
                    </ListGroup>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>


            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModalER}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}




    </div>
  )
}
