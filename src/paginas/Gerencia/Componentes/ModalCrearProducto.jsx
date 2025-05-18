import React, { useEffect, useState } from 'react';
import { Accordion, Button, Form, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { starCrearProducto } from '../Helper/crearProducto';

export const ModalCrearProducto = ({ showModal, handleCloseModal, setRefreshData, navigate, tipo }) => {
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        descripcion: '',

        // sistema_venta
        plan: false,
        venta_directa: false,
        entrega_inmediata: false,
        permutada: false,
        costoAdministrativo: 0,
        plazo: '',
        plazosPactados: '',

        // préstamo
        capitalTotal: 0,
        montoMaximoPorUsuario: 0,
        plazoCobranza: '',
    });

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
        setNuevoProducto(prev => ({
            ...prev,
            [id]: val
        }));
    };

 const handleCreateProducto = (e) => {
    e.preventDefault();

    const { nombre, descripcion } = nuevoProducto;

    // Validaciones existentes (nombre y descripción)
    if (nombre.trim().length < 7 || !/^[a-zA-Z0-9\s]+$/.test(nombre)) {
        return Swal.fire('Error', 'Nombre inválido. Debe tener al menos 7 caracteres y solo contener letras, números y espacios.', 'error');
    }
    if (descripcion.trim().length < 8) {
        return Swal.fire('Error', 'Descripción inválida.', 'error');
    }

    let dataParaEnviar = {
        nombre: nuevoProducto.nombre.trim(),
        descripcion: nuevoProducto.descripcion.trim(),
        tipo_producto: tipo,
    };

    if (tipo === 'sistema_venta') {
        const { plan, venta_directa, entrega_inmediata, permutada, costoAdministrativo, plazo, plazosPactados } = nuevoProducto;

        // Validación 1: Al menos una bandera debe ser true
        if (!plan && !venta_directa && !entrega_inmediata && !permutada) {
            return Swal.fire('Error', 'Debe seleccionar al menos un método de venta.', 'error');
        }

        // Validación 2: Solo una bandera puede ser true
        const banderasActivas = [plan, venta_directa, entrega_inmediata, permutada].filter(Boolean);
        if (banderasActivas.length > 1) {
            return Swal.fire('Error', 'Solo puede seleccionar un método de venta (plan, venta directa, entrega inmediata o permutada).', 'error');
        }

        // Validación de plazos (existente)
        let cuotas = plazosPactados.split(',')
            .map(p => parseInt(p.trim()))
            .filter(p => !isNaN(p) && p > 0);

        if (plazosPactados && cuotas.length === 0) {
            return Swal.fire('Error', 'Debe ingresar plazos válidos separados por coma.', 'error');
        }
        if (new Set(cuotas).size !== cuotas.length) {
            return Swal.fire('Error', 'No puede ingresar plazos repetidos.', 'error');
        }

        dataParaEnviar = {
            ...dataParaEnviar,
            bandera: { plan, venta_directa, entrega_inmediata, permutada },
            detalles: {
                venta: { costoAdministrativo, plazo, plazosPactados: cuotas }
            }
        };

    } else if (tipo === 'prestamo') {
        // Validaciones existentes para préstamo...
    }

    // Llamada a la API
    starCrearProducto(dataParaEnviar, setRefreshData, navigate)
        .then(() => {
            Swal.fire('Éxito', 'Producto creado correctamente', 'success');
            resetForm();
            handleCloseModal();
        })
        .catch(error => {
            Swal.fire('Error', 'Ocurrió un error al crear el producto', 'error');
        });
};

    const resetForm = () => {
        setNuevoProducto({
            nombre: '',
            descripcion: '',
            plan: false,
            venta_directa: false,
            entrega_inmediata: false,
            permutada: false,
            costoAdministrativo: 0,
            plazo: '',
            plazosPactados: '',
            capitalTotal: 0,
            montoMaximoPorUsuario: 0,
            plazoCobranza: '',
        });
    };

    useEffect(() => {
        if (!showModal) {
            document.body.style.paddingRight = '';
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }
    }, [showModal]);

    return (
        <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Crear un Nuevo Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleCreateProducto}>
                    <Form.Group controlId="nombre">
                        <Form.Label>Nombre del Producto</Form.Label>
                        <Form.Control type="text" value={nuevoProducto.nombre} onChange={handleInputChange} required />
                    </Form.Group>

                    <Form.Group controlId="descripcion" className="mt-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control as="textarea" rows={3} value={nuevoProducto.descripcion} onChange={handleInputChange} required />
                    </Form.Group>

                    {tipo === 'sistema_venta' && (
                        <>
                            <Form.Group controlId="plan" className="mt-4">
                                <Form.Check type="checkbox" label="Plan a largo plazo" checked={nuevoProducto.plan} onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group controlId="venta_directa">
                                <Form.Check type="checkbox" label="Venta Directa " checked={nuevoProducto.venta_directa} onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group controlId="entrega_inmediata">
                                <Form.Check type="checkbox" label="Entrega Inmediata" checked={nuevoProducto.entrega_inmediata} onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group controlId="permutada">
                                <Form.Check type="checkbox" label="Permutada" checked={nuevoProducto.permutada} onChange={handleInputChange} />
                            </Form.Group>

                            <Form.Group controlId="costoAdministrativo" className="mt-3">
                                <Form.Label>Costo Administrativo</Form.Label>
                                <Form.Control type="number" min="0" value={nuevoProducto.costoAdministrativo} onChange={handleInputChange} />
                            </Form.Group>

                            <Form.Group controlId="plazo" className="mt-3">
                                <Form.Label>Plazo</Form.Label>
                                <Form.Select value={nuevoProducto.plazo} onChange={handleInputChange}>
                                    <option value="">Seleccionar...</option>
                                    <option value="diario">Diario</option>
                                    <option value="semanal">Semanal</option>
                                    <option value="quincenal">Quincenal</option>
                                    <option value="mensual">Mensual</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="plazosPactados" className="mt-3">
                                <Form.Label>Plazos Pactados</Form.Label>
                                <Form.Control type="text" placeholder="Ej: 3,6,12" value={nuevoProducto.plazosPactados} onChange={handleInputChange} />
                                <Form.Text className="text-muted">Separar por comas.</Form.Text>
                            </Form.Group>
                        </>
                    )}

                    {tipo === 'prestamo' && (
                        <>
                            <Form.Group controlId="capitalTotal" className="mt-3">
                                <Form.Label>Capital Total a Prestar</Form.Label>
                                <Form.Control type="number" min="0" value={nuevoProducto.capitalTotal} onChange={handleInputChange} />
                            </Form.Group>

                            <Form.Group controlId="montoMaximoPorUsuario" className="mt-3">
                                <Form.Label>Monto Máximo por Cliente</Form.Label>
                                <Form.Control type="number" min="0" value={nuevoProducto.montoMaximoPorUsuario} onChange={handleInputChange} />
                            </Form.Group>

                            <Form.Group controlId="plazoCobranza" className="mt-3">
                                <Form.Label>Plazo de Cobranza</Form.Label>
                                <Form.Select value={nuevoProducto.plazoCobranza} onChange={handleInputChange}>
                                    <option value="">Seleccionar...</option>
                                    <option value="diario">Diario</option>
                                    <option value="semanal">Semanal</option>
                                    <option value="quincenal">Quincenal</option>
                                    <option value="mensual">Mensual</option>
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}

                    <Button variant="primary" type="submit" className="mt-3 w-100">Crear Producto</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

