import React, { useEffect, useState } from 'react';
import { ListGroup, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { NavBar } from '../../componentes/NavBarGeneral';
import { ModalCrearItem } from './Componentes/ModalAgregarAStock';
import { CargarInventario } from './Helper/cargarInventario';
import { ModalEditarInventario } from './Componentes/ModalEditarItem';
import { starDropItem } from './Helper/EliminarItem';


export const GestorInventario = () => {
    const location = useLocation();
    const usuario = location.state;
    const navigate = useNavigate();


    const [items, setItems] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');

    // Estados para los modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);



    // Obtener inventario al cargar el componente

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);
                await CargarInventario(setItems, navigate, { signal });
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

    // Filtrar items según búsqueda y filtros
    const filteredItems = items.filter(item => {
        // Filtro por término de búsqueda
        const matchesSearch = Object.values(item).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Filtro por estado
        const matchesEstado = filtroEstado === 'todos' || item.estado === filtroEstado;

        // Filtro por tipo
        const matchesTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;

        return matchesSearch && matchesEstado && matchesTipo;
    });

    // Manejar eliminación de item
    const handleEliminarItem = async (itemId) => {
        try {
            const result = await Swal.fire({
                title: '¿Eliminar este ítem?',
                text: 'Esta acción no se puede deshacer',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await starDropItem(itemId, setRefreshData, navigate);
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar el ítem', 'error');
            console.error('Error al eliminar:', error);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center mt-5">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (error) return (
        <Alert variant="danger" className="m-3">
            Error al cargar el inventario: {error}
        </Alert>
    );

    return (
        <div>
            <NavBar usuario={usuario} />

            <div className="container-fluid p-4">

                <h2 className="mb-4">Gestión de Inventario</h2>

                {/* Controles de búsqueda y filtros */}
                <div className="row mb-4 g-3">
                    <div className="col-md-6">
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre, modelo, IMEI o serie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3">
                        <Form.Select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="disponible">Disponible</option>
                            <option value="asignado">Asignado</option>
                            <option value="en_reparacion">En reparación</option>
                            <option value="perdido">Perdido/Robo</option>
                            <option value="baja">Dado de baja</option>
                        </Form.Select>
                    </div>

                    <div className="col-md-3">
                        <Form.Select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                        >
                            <option value="todos">Todos los tipos</option>
                            <option value="dispositivo">Dispositivos</option>
                            <option value="accesorio">Accesorios</option>
                        </Form.Select>
                    </div>
                </div>

                {/* Botón para agregar nuevo ítem */}
                <div className="mb-3">
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="me-2"
                    >
                        <i className="bi bi-plus-circle me-2"></i>Agregar Ítem
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => {
                            setSearchTerm('');
                            setFiltroEstado('todos');
                            setFiltroTipo('todos');
                        }}
                    >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>Restablecer
                    </Button>
                </div>

                {/* Resumen de items */}
                <div className="mb-3">
                    <Badge bg="info" className="me-2">
                        Total: {items.length}
                    </Badge>
                    <Badge bg="success" className="me-2">
                        Disponibles: {items.filter(i => i.estado === 'disponible').length}
                    </Badge>
                    <Badge bg="warning" className="me-2">
                        En reparación: {items.filter(i => i.estado === 'en_reparacion').length}
                    </Badge>
                    <Badge bg="danger">
                        Asignados: {items.filter(i => i.estado === 'asignado').length}
                    </Badge>
                </div>

                {/* Lista de items */}
                {filteredItems.length > 0 ? (
                    <ListGroup className="shadow-sm">
                        {filteredItems.map(item => (
                            <ListGroup.Item key={item._id} className="py-3">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                                    {/* Información principal */}
                                    <div className="mb-2 mb-md-0">
                                        <div className="d-flex align-items-center mb-1">
                                            <h5 className="mb-0 me-2">{item.nombre}</h5>
                                            <Badge bg={item.tipo === 'dispositivo' ? 'primary' : 'secondary'}>
                                                {item.tipo.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2">
                                            {item.modelo && (
                                                <span className="text-muted">
                                                    <strong>Modelo:</strong> {item.modelo}
                                                </span>
                                            )}

                                            {item.imei_serial && (
                                                <span className="text-muted">
                                                    <strong>IMEI/Serial:</strong> {item.imei_serial}
                                                </span>
                                            )}

                                            {item.numero_serie && (
                                                <span className="text-muted">
                                                    <strong>N° Serie:</strong> {item.numero_serie}
                                                </span>
                                            )}
                                        </div>

                                        {item.caracteristicas && (
                                            <div className="mt-1 small">
                                                <strong>Características:</strong> {item.caracteristicas}
                                            </div>
                                        )}
                                    </div>

                                    {/* Estado y acciones */}
                                    <div className="d-flex flex-column align-items-end">
                                        <div className="mb-2">
                                            <Badge bg={
                                                item.estado === 'disponible' ? 'success' :
                                                    item.estado === 'asignado' ? 'danger' :
                                                        item.estado === 'en_reparacion' ? 'warning' :
                                                            item.estado === 'perdido' ? 'dark' : 'secondary'
                                            }>
                                                {item.estado.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="d-flex gap-2">

                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                              
                                            >
                                                <i className="bi bi-cart"> </i> Registrar Venta
                                            </Button>

                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowEditModal(true);
                                                }}
                                            >
                                                <i className="bi bi-pencil"></i> Editar
                                            </Button>

                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleEliminarItem(item._id)}
                                                disabled={item.estado === 'asignado'}
                                            >
                                                <i className="bi bi-trash"></i> Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <Alert variant="info">
                        No se encontraron ítems que coincidan con los criterios de búsqueda.
                    </Alert>
                )}

                {/* Modales */}

                <ModalCrearItem
                    show={showCreateModal}
                    handleClose={() => setShowCreateModal(false)}
                    setRefreshData={setRefreshData}
                    navigate={navigate}
                />


                <ModalEditarInventario
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    item={selectedItem}
                    setRefreshData={setRefreshData}
                    navigate={navigate}
                />

            </div>

        </div>



    );
};