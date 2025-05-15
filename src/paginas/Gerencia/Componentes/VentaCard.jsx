import React, { useEffect, useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { CargarUsuarios } from '../../Creater/Helper/CargarUsuario';
import Swal from 'sweetalert2';
import { ModalCrearClienteVenta } from './ModalCrearClienteVenta';

export const VentaCard = ({ producto, setRefreshData, navigate, usuario }) => {
    const [users, setUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [esNuevoCliente, setEsNuevoCliente] = useState(false);

    // Verificar si el usuario es vendedor
    const esVendedor = usuario?.rol === 'vendedor';

    const handleShowCreateModal = () => { setShowCreateModal(true); };
    const handleCloseCreateModal = () => setShowCreateModal(false);

    const handleRealizarVenta = () => {
        Swal.fire({
            title: 'Seleccione una opción',
            text: '¿Desea realizar el préstamo para un cliente nuevo o uno existente?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cliente Nuevo',
            cancelButtonText: 'Cliente Existente',
        }).then((result) => {
            if (result.isConfirmed) {
                setEsNuevoCliente(true);
                handleShowCreateModal();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                setEsNuevoCliente(false);
                handleShowCreateModal();
            }
        });
    };

    useEffect(() => {
        const modals = [showCreateModal];
        const anyModalOpen = modals.some(modal => modal);

        if (anyModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '17px';
            document.body.classList.add('modal-open');
        } else {
            setTimeout(() => {
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                document.body.classList.remove('modal-open');
            }, 300);
        }
    }, [showCreateModal]);

    useEffect(() => {
        if (!esVendedor) {
            CargarUsuarios(setUsers, navigate);
        }
    }, [navigate, esVendedor]);

    return (
        <div>
            <Card className='shadow-lg rounded-5'
                border="light"
                style={{ width: '23rem', height: '27rem', overflow: 'auto' }}
            >
                <Card.Header as="h5">{producto.nombre}</Card.Header>
                <Card.Body>
                    <Card.Title></Card.Title>
                    <Card.Text>
                        <strong>Descripción:</strong> {producto.descripcion}
                    </Card.Text>
                    <Card.Text>
                        <strong>Tipo: </strong> {producto.tipo}
                    </Card.Text>

                    {/* Renderizado condicional de botones */}
                    {!esVendedor && (
                        <div className="d-flex flex-wrap justify-content-between align-items-center">
                            <div className="d-flex flex-column gap-2">
                                {producto.tipo === 'prestamo' ? (
                                    <Button variant="primary" onClick={handleRealizarVenta}>
                                        Realizar préstamo
                                    </Button>
                                ) : (
                                    <>
                                        {producto.bandera.venta_directa && (
                                            <Button variant="primary" onClick={handleRealizarVenta}>
                                                Venta Directa
                                            </Button>
                                        )}
                                        {producto.bandera.entrega_inmediata && (
                                            <Button variant="info" onClick={handleRealizarVenta}>
                                                Venta de Entrega Inmediata
                                            </Button>
                                        )}
                                        {producto.bandera.permutada && (
                                            <Button variant="secondary" onClick={handleRealizarVenta}>
                                                Venta Permutada
                                            </Button>
                                        )}
                                        {producto.bandera.plan && (
                                            <Button variant="primary" onClick={handleRealizarVenta}>
                                                Plan a largo plazo
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {esVendedor && (
                        <div className="text-center text-muted mt-3">
                            <small>Estos son todos los datos disponibles</small>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal (solo se carga si no es vendedor) */}
            {!esVendedor && (
                <ModalCrearClienteVenta
                    showCreateModal={showCreateModal}
                    handleCloseCreateModal={handleCloseCreateModal}
                    setRefreshData={setRefreshData}
                    navigate={navigate}
                    esNuevoCliente={esNuevoCliente}
                    producto={producto}
                    users={users}
                    usuario={usuario}
                />
            )}
        </div>
    )
}
