import React, { useEffect, useState } from 'react';
import { ListGroup, Button, Form, Badge, Spinner, Alert, Dropdown, ButtonGroup } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { NavBar } from '../../componentes/NavBarGeneral';
import { ModalCrearItem } from './Componentes/ModalAgregarAStock';
import { CargarInventario } from './Helper/cargarInventario';
import { ModalEditarInventario } from './Componentes/ModalEditarItem';
import { starDropItem } from './Helper/EliminarItem';
import { CargarUsuarios } from '../Creater/Helper/CargarUsuario';
import { ModalClienteSistema } from './Componentes/ModalCrearCliente_separado';
import { ModalVentaSistema } from './Componentes/ModalCrearVenta_separado';
import { starCrearCliente2 } from './Helper/Crear_cliente2';
import { starProcesarVenta2 } from './Helper/Procesar_venta2';
// Importamos los nuevos helpers


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
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showVentaModal, setShowVentaModal] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [users, setUsers] = useState([]);
    const [clienteCreado, setClienteCreado] = useState(null);
    const [esNuevoCliente, setEsNuevoCliente] = useState(true);
    const [tipoVentaSeleccionada, setTipoVentaSeleccionada] = useState('');

    // Obtener inventario y usuarios al cargar el componente
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);
                await CargarInventario(setItems, navigate, { signal });
                CargarUsuarios(setUsers, navigate);
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
    }, [refreshData, navigate]);

    // Manejar scroll cuando hay modales abiertos
    useEffect(() => {
        const anyModalOpen = showCreateModal || showEditModal || showClienteModal || showVentaModal;

        if (anyModalOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.documentElement.style.paddingRight = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.documentElement.style.paddingRight = '';
        };
    }, [showCreateModal, showEditModal, showClienteModal, showVentaModal]);

    // Filtrar items según búsqueda y filtros
    const filteredItems = items.filter(item => {
        const matchesSearch = Object.values(item).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
        const matchesTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;

        return matchesSearch && matchesEstado && matchesTipo;
    });

    // Manejar selección de venta
    const handleSeleccionVenta = (item, tipoVenta) => {
        setSelectedItem(item);
        setTipoVentaSeleccionada(tipoVenta);

        // Mostrar modal para seleccionar tipo de cliente
        Swal.fire({
            title: 'Seleccione una opción',
            text: '¿Desea realizar esta venta para un cliente nuevo o uno existente?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cliente Nuevo',
            cancelButtonText: 'Cliente Existente',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                setEsNuevoCliente(true);
                setShowClienteModal(true);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                setEsNuevoCliente(false);
                setShowClienteModal(true);
            }
        });
    };

    // Manejar cliente creado exitosamente
    const handleClienteCreado = async (clienteData) => {
        // Si es cliente existente (solo tiene DNI), pasamos directamente a venta
        if (!esNuevoCliente && clienteData.dni) {
            setClienteCreado(clienteData);
            setShowClienteModal(false);
            setShowVentaModal(true);
            return;
        }

        // Si es cliente nuevo, lo creamos en el backend
        const resultado = await starCrearCliente2(clienteData, setRefreshData, navigate);

        if (resultado.success) {
            // Usamos el cliente creado en el backend o mantenemos los datos del form
            setClienteCreado(resultado.cliente || clienteData);
            setShowClienteModal(false);
            setShowVentaModal(true);
        }
    };

    // Manejar venta creada exitosamente
    const handleVentaCreada = async (ventaData) => {
        const resultado = await starProcesarVenta2(ventaData, setRefreshData, navigate);

        if (resultado.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Venta realizada!',
                text: 'La venta se ha procesado correctamente',
                timer: 2000,
                showConfirmButton: false
            });

            setRefreshData(true);
            setShowVentaModal(false);
            setClienteCreado(null);
            setSelectedItem(null);
        }
    };

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
                            <option value="vendido">Vendido</option>
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
                                            <Dropdown as={ButtonGroup}>
                                                <Button variant="outline-primary">
                                                    <i className="bi bi-cart"></i> Registrar Venta
                                                </Button>
                                                <Dropdown.Toggle split variant="outline-primary" id="dropdown-split-basic" />
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleSeleccionVenta(item, 'Venta directa')}>
                                                        Venta directa
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleSeleccionVenta(item, 'Venta Permutada')}>
                                                        Venta Permutada
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleSeleccionVenta(item, 'Entrega inmediata')}>
                                                        Venta sistema 1 Entrega inmediata
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleSeleccionVenta(item, 'Venta sistema 2')}>
                                                        Venta sistema 2
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleSeleccionVenta(item, 'Venta sistema 3')}>
                                                        Venta sistema 3
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>

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

                {/* Nuevos modales para el flujo de venta */}
                <ModalClienteSistema
                    show={showClienteModal}
                    handleClose={() => {
                        setShowClienteModal(false);
                        setSelectedItem(null);
                        setTipoVentaSeleccionada('');
                    }}
                    onClienteCreado={handleClienteCreado}
                    esNuevoCliente={esNuevoCliente}
                />

                {selectedItem && clienteCreado && (
                    <ModalVentaSistema
                        show={showVentaModal}
                        handleClose={() => {
                            setShowVentaModal(false);
                            setClienteCreado(null);
                            setSelectedItem(null);
                        }}
                        cliente={clienteCreado} // ← Esto debe ser el objeto cliente completo
                        item={selectedItem}
                        tipoVenta={tipoVentaSeleccionada}
                        users={users}
                        usuario={usuario}
                        onVentaCreada={handleVentaCreada}
                    />
                )}
            </div>
        </div>
    );
};