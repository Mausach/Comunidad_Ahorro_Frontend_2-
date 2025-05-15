import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from '../../componentes/NavBarGeneral';
import { ModalEditarCliente } from './Componentes/ModalEditarCliente';
import { CargarClientes } from './Helper/CargarClientes';
import { Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';

export const GestClientes = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);//en este caso clientes
  const [showModal, setShowModal] = useState(false);
  const [showModalER, setShowModalER] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshData, setRefreshData] = useState(false);
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
        await CargarClientes(setUsers, navigate, { signal });
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


  const handleShowDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setShowDetailsModal(false);

  //para el buscador
  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <NavBar usuario={usuario} />
      <div className="p-4">

        <h2>Gestión de Clientes</h2>

        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>


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
                      <Button variant="outline-primary" onClick={() => handleShowDetailsModal(user)} className="me-2 mb-2"><i className="bi bi-eye"></i></Button>
                      <Button variant="outline-primary" onClick={() => handleShowModal(user)} className="me-2 mb-2"><i className="bi bi-pencil-square"></i></Button>

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
                <p><strong>Numero de cliente :</strong> {selectedUser.numero_cliente}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Localidad:</strong> {selectedUser.localidad}</p>
                <p><strong>N° Teléfono:</strong> {selectedUser.numero_telefono}</p>
                <p><strong>N° Teléfono 2:</strong> {selectedUser.numero_telefono_2}</p>
                <p><strong>DNI:</strong> {selectedUser.dni}</p>
                <p><strong>CUIL:</strong> {selectedUser.cuil}</p>
                <p><strong>situacion veraz:</strong> {selectedUser.situacion_veraz}</p>
                <p><strong>Dirección del Hogar:</strong> {selectedUser.direccion_hogar}</p>
                <p><strong>Dirección secundaria o comercial:</strong> {selectedUser.direccion_comercial}</p>
                <p><strong>Apellido Familiar:</strong> {selectedUser.apellido_fam}</p>
                <p><strong>Nombre Familiar:</strong> {selectedUser.nombre_fam}</p>





              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailsModal}>Cerrar</Button>
          </Modal.Footer>
        </Modal>


        {/* Modal para editar usuario */}

        <ModalEditarCliente
          show={showModal}
          handleClose={handleCloseModal}
          cliente={selectedUser}
          setRefreshData={setRefreshData}
          navigate={navigate}
        />



      </div>
    </div>
  )
}
