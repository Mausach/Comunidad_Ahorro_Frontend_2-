import React, { useEffect, useState } from 'react';
import { ListGroup, Button, Form, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ModalCrearItem } from './Componentes/ModalAgregarAStock';
import { NavBar } from '../../componentes/NavBarGeneral';
import { ModalEditarInventario } from './Componentes/ModalEditarItem';
import { starDropItem } from './Helper/EliminarItem';
//import { CargarItems } from '../Helpers/CargarItems';
//import { ModalCrearItem } from './Subcomponente/ModalCrearItemStock';
//import { ModalEditarItem } from './Subcomponente/ModalEditarItemStock';
//import { starEliminarItem } from '../Helpers/EliminarItem';

export const GestStock = ({ handleStock, handleBackStock, producto, setRefreshData, navigate }) => {

  const [items, setItems] = useState(producto?.detalles.venta.inventario || []); // Estado para los items
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador

  const [showCreateModal, setShowCreateModal] = useState(false); // Modal para crear items
  const [showEditModal, setShowEditModal] = useState(false); // Modal para editar items
  const [selectedItem, setSelectedItem] = useState(null); // Item seleccionado para editar




  // Filtrar items según el término de búsqueda
  const filteredItems = items.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Abrir modal de edición
  const handleShowEditModal = (item) => {
    setSelectedItem(item); // Establecer el item seleccionado
    setShowEditModal(true); // Mostrar el modal de edición
  };

  // Eliminar un ítem
  const handleDeleteItem = (item) => {
    Swal.fire({
      title: '¿Eliminar este ítem?',
      text: `${item.nombre_item} - ${item.modelo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        let dropItem = {
          productoId: producto._id,
          serial: item.serial
        };

        console.log(dropItem);
        starDropItem(dropItem, setRefreshData, navigate)
        handleBackStock();
        //starEliminarItem(item.id, setRefreshData, navigate);
      }
    });
  };


  useEffect(() => {
    setItems(producto?.detalles.venta.inventario || []);
  }, [producto?.detalles.venta.inventario]);


  return (
    <>

      <div className="p-4">
        <h2>Gestión de Stock</h2>

        {/* Buscador */}
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar ítem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>

        {/* Botón para crear nuevo ítem */}
        <Button variant="primary" className="mb-3 rounded-3" onClick={() => setShowCreateModal(true)}>
          Crear Nuevo Ítem
        </Button>

        {/* Lista de ítems */}
        <ListGroup className="card text-dark shadow p-3 mb-5 bg-white rounded m-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ListGroup.Item key={item.id} className="mb-3">
                <div className="row gy-2 gx-3 align-items-center">
                  {/* Nombre, modelo y serial */}
                  <div className="col-12 col-md-5">
                    <span className="fw-bold d-block">
                      {item.nombreItem} - {item.modelo}
                    </span>
                    <small className="text-muted">(IMEI: {item.serial})</small>
                  </div>

                  {/* Fecha de ingreso */}
                  <div className="col-12 col-md-3">
                    <span className="d-block">
                      <strong>Fecha de ingreso:</strong> {item.fechaIngreso}
                    </span>
                  </div>

                  {/* Estado */}
                  <div className="col-12 col-md-2">
                    {item.estado === 'disponible' ? (
                      <span className="text-success d-flex align-items-center">
                        <i className="bi bi-check-lg me-1"></i> {item.estado}
                      </span>
                    ) : item.estado === 'reservado' ? (
                      <span className="text-primary d-flex align-items-center">
                        <i className="bi bi-bookmark-fill me-1"></i> {item.estado}
                      </span>
                    ) : item.estado === 'vendido' ? (
                      <span className="text-secondary d-flex align-items-center">
                        <i className="bi bi-cart-check me-1"></i> {item.estado}
                      </span>
                    ) : item.estado === 'en_reparacion' ? (
                      <span className="text-warning d-flex align-items-center">
                        <i className="bi bi-wrench me-1"></i> {item.estado.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-dark d-flex align-items-center">
                        <i className="bi bi-question-circle me-1"></i> {item.estado}
                      </span>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="col-12 col-md-2">
                    <div className="d-flex justify-content-md-end justify-content-start gap-2">
                      <Button
                        variant="outline-primary"
                        onClick={() => handleShowEditModal(item)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="text-center">
              No hay ítems registrados.
            </ListGroup.Item>
          )}
        </ListGroup>
      </div>

      {/* Modal para crear ítem */}
      <ModalCrearItem
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        handleBackStock={handleBackStock}
        setRefreshData={setRefreshData}
        navigate={navigate}
        producto={producto}
      />

      {/* Modal para editar ítem*/}
      <ModalEditarInventario
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        handleBackStock={handleBackStock}
        item={selectedItem}
        setRefreshData={setRefreshData}
        navigate={navigate}
        producto={producto}
      />

    </>
  );
};