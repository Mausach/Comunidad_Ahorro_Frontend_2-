import React, { useEffect, useState } from 'react';
import { Button, Modal, ListGroup, Spinner, Alert, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { NavBar } from '../../componentes/NavBarGeneral';
import { CargarUsuarios } from '../Creater/Helper/CargarUsuario';
import { ModalCrearUsuario } from '../Creater/Componente/ModalCrearUsuario';
import { ModalEditUsuarios } from '../Creater/Componente/ModalEditarUsuario';
import ModalCrearEquipoVenta from '../Creater/Componente/ModalCrearEquipo';
import Equipos from '../Creater/Componente/CardEquipo';
import { changeEstadoUsuario } from '../Creater/Helper/CambiarEstadoUsuario';


export const GestEmpleado = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalER, setShowModalER] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshData, setRefreshData] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateEquipoven, setShowCreateEquipoven] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        await CargarUsuarios(setUsers, navigate, { signal });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError("Error crítico. Contacte soporte.");
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };


    if (refreshData) {
      cargarDatos();
      setRefreshData(false);
    } else {
      cargarDatos();
    }




    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [refreshData]);

  if (loading) return <Spinner animation="border" variant="primary" className="mt-5" />;
  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error} <Button onClick={() => setRefreshData(true)}>Reintentar</Button>
      </Alert>
    );
  }

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleShowModalER = (user) => {
    setSelectedUser(user);
    setShowModalER(true);
  };

  const handleCloseModal = () => setShowModal(false);
  const handleCloseModalER = () => setShowModalER(false);

  const handleShowCreateEquipo = () => setShowCreateEquipoven(true);
  const handleCloseCreateEquipo = () => setShowCreateEquipoven(false);

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  const handleShowDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setShowDetailsModal(false);

  //para el buscador
 const filteredUsers = users.filter(user => {
    // Primero aplicamos el filtro de búsqueda
    const matchesSearch = Object.values(user).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Luego aplicamos el filtro por rol si es administrador
    if (usuario.rol === 'administrador') {
      return matchesSearch && user.rol !== 'gerente';
    }
    
    return matchesSearch;
  });

  const handleChange = (user) => {
    Swal.fire({
      title: '¿Cambiar el estado del usuario?',
      text: `${user.nombres} ${user.apellido}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(user.id);
        // Aquí llamas tu función para activar o desactivar usuario
        changeEstadoUsuario(user, setRefreshData, navigate)
        // luego refrescas con setRefreshData(true)
      }
    });
  };


  return (
    <div>
      <NavBar usuario={usuario} />
      <div className="p-4">

        <h2>Gestión de Usuarios</h2>

        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex gap-2 mb-2">
          <Button variant="primary" onClick={handleShowCreateModal}>Crear Nuevo Usuario</Button>
          <Button variant="primary" onClick={handleShowCreateEquipo}>Crear Nuevo Equipo de Venta</Button>
        </div>

        <ListGroup className="card text-dark shadow p-3 mb-5 bg-white rounded m-3">
          {filteredUsers.length > 0 ? (
            filteredUsers
              .sort((a, b) => a.apellido.localeCompare(b.apellido))
              .map((user) => (
                <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center">
                  <div className="row w-100">
                    <div className="col-8">
                      <span>{user.nombre} {user.apellido}</span>
                    </div>
                    <div className="col-4 d-flex flex-wrap justify-content-end">
                      {/* Ver detalles */}
                      <Button variant="outline-primary" onClick={() => handleShowDetailsModal(user)} className="me-2 mb-2"><i className="bi bi-eye"></i></Button>
                      {/* Editar Usuario */}
                      <Button variant="outline-primary" onClick={() => handleShowModal(user)} className="me-2 mb-2"><i className="bi bi-pencil-square"></i></Button>
                      {/* Editar rendimiento */}
                      <Button
                        variant="outline-primary" onClick={() => handleShowModalER(user)} className="me-2 mb-2"><i className="bi bi-person-lines-fill"></i></Button>
                      {/* Cambiar estado o acceso */}
                      {user.estado ? (
                        <Button variant="outline-danger" onClick={() => handleChange(user)} className="me-2 mb-2"><i className="bi bi-person-fill-slash"></i></Button>
                      ) : (
                        <Button variant="outline-success" onClick={() => handleChange(user)} className="me-2 mb-2"><i className="bi bi-person-check-fill"></i></Button>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))
          ) : (
            <ListGroup.Item className="text-center">No hay clientes registrados.</ListGroup.Item>
          )}
        </ListGroup>



        {/* Modal de Detalles */}
        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
          <Modal.Header closeButton>
            <Modal.Title>Detalles del Cliente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <div>
                <p><strong>Nombre:</strong> {selectedUser.nombre}</p>
                <p><strong>Apellido:</strong> {selectedUser.apellido}</p>
                <p><strong>Rol:</strong> {selectedUser.rol}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>N° Teléfono:</strong> {selectedUser.telefono}</p>
                <p><strong>N° Teléfono 2:</strong> {selectedUser.telefonoSecundario}</p>
                <p><strong>DNI:</strong> {selectedUser.dni}</p>
                <p><strong>CUIL:</strong> {selectedUser.cuil}</p>
                <p><strong>Dirección del Hogar:</strong> {selectedUser.direccion}</p>
                <p><strong>Apellido Familiar:</strong> {selectedUser.apellido_fam}</p>
                <p><strong>Nombre Familiar:</strong> {selectedUser.nombre_fam}</p>
                <p><strong>Fecha Ingreso:</strong> {selectedUser.fechaIngreso}</p>
                <p><strong>Fecha Despido/Renuncia:</strong> {selectedUser.fechaSalida}</p>
                <p><strong>Estado Acceso:</strong> {selectedUser.estado ? 'Activo' : 'Inactivo'}</p>
                <p><strong>Monotributo:</strong> {selectedUser.monotributo ? 'Sí' : 'No'}</p>
                <p><strong>Nombre de Usuario:</strong> {selectedUser.userName}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailsModal}>Cerrar</Button>
          </Modal.Footer>
        </Modal>

        <Equipos users={users} setRefreshData={setRefreshData} navigate={navigate} responsable={usuario.nombre + " " + usuario.apellido} />

        {/* Modal para crear usuario */}
        <ModalCrearUsuario showCreateModal={showCreateModal} handleCloseCreateModal={handleCloseCreateModal}
          setRefreshData={setRefreshData} navigate={navigate} usuario={usuario}/>

        {/* Modal para editar usuario */}
        <ModalEditUsuarios showModal={showModal} showModalER={showModalER}
          handleCloseModal={handleCloseModal} handleCloseModalER={handleCloseModalER}
          setRefreshData={setRefreshData} navigate={navigate} selectedUser={selectedUser} usuario={usuario} />


        {/* Modal para crear equipo venta */}
        <ModalCrearEquipoVenta showCreateEquipoven={showCreateEquipoven} handleCloseCreateEquipo={handleCloseCreateEquipo}
          setRefreshData={setRefreshData} navigate={navigate} users={users} />

      </div>
    </div>

  );
};
