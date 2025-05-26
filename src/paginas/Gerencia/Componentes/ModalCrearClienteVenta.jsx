import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { starCrearVentaCliente } from '../Helper/crearVenta';


export const ModalCrearClienteVenta = ({ showCreateModal, handleCloseCreateModal, setRefreshData, navigate, esNuevoCliente, producto, users, usuario }) => {

    console.log(producto)
    const [newUser, setNewUser] = useState({ //usaremos user pero es de clientes esto luego se movera
    });
    const [isLoading, setIsLoading] = useState(false);

    // Filtrar usuarios según rol y supervisorId si es necesario
    const vendedores = usuario.rol === 'supervisor'
        ? users.filter(user => user.rol === "vendedor" && user.supervisorId === usuario._id)
        : users.filter(user => user.rol === "vendedor");

    const cobradores = users.filter(user => user.rol === "cobrador");
    const supervisores = users.filter(user => user.rol === "supervisor");

    // Efecto para autoasignar supervisor si el usuario es supervisor
    useEffect(() => {
        if (usuario.rol === 'supervisor') {
            setNewUser(prev => ({
                ...prev,
                sup_id: usuario._id,
                nombre_S: usuario.nombre,
                apellido_S: usuario.apellido,
                dni_S: usuario.dni,
            }));
        }
    }, [usuario]);


    // Manejar cambios en el formulario de creación
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Si es un campo numérico y el valor es negativo, lo ajustamos a 0
        let processedValue = value;
        if (type === 'number' && value < 0) {
            processedValue = 0;
        }

        if (name === "vendedor") {
            const vendedorSeleccionado = vendedores.find(v => v._id === value);

            setNewUser((prev) => ({
                ...prev,
                ve_id: value,
                nombre_V: vendedorSeleccionado ? vendedorSeleccionado.nombre : "",
                apellido_V: vendedorSeleccionado ? vendedorSeleccionado.apellido : "",
                dni_V: vendedorSeleccionado ? vendedorSeleccionado.dni : "",
            }));
        } else if (name === "supervisor" && usuario.rol !== 'supervisor') {
            // Solo permitir cambiar supervisor si no es supervisor
            const supervisorSeleccionado = supervisores.find(s => s._id === value);

            setNewUser((prev) => ({
                ...prev,
                sup_id: value,
                nombre_S: supervisorSeleccionado ? supervisorSeleccionado.nombre : "",
                apellido_S: supervisorSeleccionado ? supervisorSeleccionado.apellido : "",
                dni_S: supervisorSeleccionado ? supervisorSeleccionado.dni : "",
            }));
        } else if (name === "cobrador") {
            const cobradorSeleccionado = cobradores.find(c => c._id === value);

            setNewUser((prev) => ({
                ...prev,
                cob_id: value,
                nombre_C: cobradorSeleccionado ? cobradorSeleccionado.nombre : "",
                apellido_C: cobradorSeleccionado ? cobradorSeleccionado.apellido : "",
                dni_C: cobradorSeleccionado ? cobradorSeleccionado.dni : "",
            }));
        } else {
            setNewUser((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    //para crear el cliente
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const usuarioFinal = {
            ...newUser, //aqui debajo pondremos todos los datos fijos que se enviaran al backend
            clienteNuevo: esNuevoCliente,
            nombreProd: producto.nombre,
            tipo: producto.tipo,
            productoId: producto._id,
            costeAdmin: producto.detalles.venta.costoAdministrativo,
            //banderas (ver si es necesario)
            ventaDirecta: producto.bandera.venta_directa,
            largoPlazo: producto.bandera.plan,
            entregaInmediata: producto.bandera.entrega_inmediata,
            permutada: producto.bandera.permutada,


        };

        //  Validación si es nuevo cliente
        if (esNuevoCliente) {
            const requiredFields = [
                'apellido',
                'nombre',
                'direccion_hogar',
                'dni',
                'numero_telefono',
                'apellido_fam',
                'nombre_fam',
                'localidad'
            ];

            for (const field of requiredFields) {
                if (!newUser[field] || newUser[field].trim() === '') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `El campo ${field} es obligatorio. Por favor, complételo.`,
                    });
                    setIsLoading(false);
                    return;
                }
            }
        } else {
            // Solo validar que DNI exista
            if (!newUser.dni || newUser.dni.trim() === '') {
                Swal.fire({
                    icon: 'error',
                    title: 'DNI obligatorio',
                    text: 'Por favor, ingrese el DNI del cliente.',
                });
                setIsLoading(false);
                return;
            }
        }

        //  Validar DNI
        if (newUser.dni.length !== 8 || isNaN(newUser.dni)) {
            Swal.fire({
                icon: 'error',
                title: 'DNI inválido',
                text: 'El DNI debe tener 8 caracteres numéricos.',
            });
            setIsLoading(false);
            return;
        }

        //  Validar CUIL (si viene)
        if (newUser.cuil && newUser.cuil.trim() !== '') {
            if (newUser.cuil.length !== 11 || isNaN(newUser.cuil)) {
                Swal.fire({
                    icon: 'error',
                    title: 'CUIL inválido',
                    text: 'El CUIL debe tener 11 caracteres numéricos.',
                });
                setIsLoading(false);
                return;
            }
            if (!newUser.cuil.includes(newUser.dni)) {
                Swal.fire({
                    icon: 'error',
                    title: 'CUIL inválido',
                    text: 'El CUIL debe contener el número de DNI.',
                });
                setIsLoading(false);
                return;
            }
        }

        //  Validar email si existe
        if (newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Email inválido',
                text: 'Por favor, ingrese un email válido.',
            });
            setIsLoading(false);
            return;
        }

        // Validar número de teléfono si existe
        if (newUser.numero_telefono && (newUser.numero_telefono.length > 12 || isNaN(newUser.numero_telefono))) {
            Swal.fire({
                icon: 'error',
                title: 'Teléfono inválido',
                text: 'El teléfono debe tener hasta 12 caracteres numéricos.',
            });
            setIsLoading(false);
            return;
        }



        try {
            //falta asignarle el vendedor al usuario cuando no se selecciona nada.



            // Aquí enviarías usuarioFinal
            console.log('Creando venta:', usuarioFinal);
            await starCrearVentaCliente(usuarioFinal, setRefreshData, navigate);

            // Resetear form
            setNewUser({});
            handleCloseCreateModal();
        } catch (error) {
            console.error('Error al crear préstamo:', error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>

            <Modal show={showCreateModal} onHide={handleCloseCreateModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Formulario de un Nueva Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form onSubmit={handleSubmit}>




                        {esNuevoCliente ? (
                            <>
                                {/* === Datos del Cliente === */}
                                <h5 className="mt-4">Datos del Cliente</h5>
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
                                            <Form.Label>Situacion veraz</Form.Label>
                                            <Form.Select
                                                name="situacion_veraz"
                                                value={newUser.situacion_veraz}
                                                onChange={handleChange}
                                            >
                                                <option value="0">Seleccione la situacion</option>
                                                {[1, 2, 3, 4, 5, 6].map((num) => {
                                                    // Determina la clase de color en función del número
                                                    let colorClass = "";
                                                    if (num <= 2) colorClass = "text-success";
                                                    else if (num <= 4) colorClass = "text-warning";
                                                    else if (num <= 6) colorClass = "text-danger";

                                                    return (
                                                        <option key={num} value={num} className={colorClass}>
                                                            {num}
                                                        </option>
                                                    );
                                                })}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* === Contacto === */}
                                <h5 className="mt-4">Contacto</h5>
                                <Row>
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
                                </Row>

                                {/* === Dirección === */}
                                <h5 className="mt-4">Dirección</h5>
                                <Row>
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

                                {/*tipo prestamo */}
                                {producto.tipo === 'prestamo' && (
                                    <>
                                        <h5 className="mt-4">Datos del Préstamo</h5>

                                        <Row>

                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label> Monto Prestado</Form.Label>
                                                    <Form.Select
                                                        name="montoPrestado"
                                                        value={newUser.montoPrestado}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Seleccione un monto</option>
                                                        <option value={100000}>100,000</option>
                                                        <option value={200000}>200,000</option>
                                                        <option value={300000}>300,000</option>
                                                        <option value={400000}>400,000</option>
                                                        <option value={500000}>500,000</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>


                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Monto de la Cuota</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="monto_cuota"
                                                        value={newUser.monto_cuota || ''}
                                                        onChange={handleChange}
                                                        min="0"
                                                        onKeyDown={(e) => {
                                                            // Evita que se escriban caracteres no numéricos
                                                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Cantidad de Cuotas</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="cantidad_cuotas"
                                                        value={newUser.cantidad_cuotas || ''}
                                                        onChange={handleChange}
                                                        min="0"
                                                        onKeyDown={(e) => {
                                                            // Evita que se escriban caracteres no numéricos
                                                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
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

                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Cobrador asigado</Form.Label>
                                                    <Form.Select
                                                        name="cobrador"
                                                        value={newUser.cobrador}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="0">Seleccione un cobrador</option>
                                                        {cobradores.map((usuarios) => (
                                                            <option key={usuarios.id} value={usuarios._id}>
                                                                {usuarios.nombre} {usuarios.apellido}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>


                                    </>
                                )}

                                {/*tipo venta */}
                                {producto.tipo === 'sistema_venta' && (
                                    <>
                                        <h5 className="mt-4">Datos dela venta</h5>

                                        {producto.bandera.venta_directa && (
                                            <>
                                                <h5 className="mt-4"> Venta Directa</h5>

                                                <Row>
                                                    {/* Producto y num de contrato */}
                                                    {/* Select para elegir producto disponible */}
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto disponible:</Form.Label>
                                                            <Form.Select
                                                                name="productoSeleccionado"
                                                                value={newUser.productoSeleccionado || ""} // Asegurar valor inicial
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value;
                                                                    if (selectedId) {
                                                                        const productoSeleccionado = producto.detalles.venta.inventario.find(
                                                                            item => item._id === selectedId
                                                                        );
                                                                        // Actualiza el estado con los datos del producto
                                                                        setNewUser({
                                                                            ...newUser,
                                                                            nombre_I: productoSeleccionado.nombreItem,
                                                                            modelo: productoSeleccionado.modelo,
                                                                            serial: productoSeleccionado.serial,
                                                                            productoSeleccionado: selectedId // Opcional: guardar el ID
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Seleccione un producto...</option>
                                                                {producto.detalles.venta.inventario
                                                                    .filter(item => item.estado === 'disponible') // Solo disponibles
                                                                    .map(item => (
                                                                        <option key={item._id} value={item._id}>
                                                                            {`${item.nombreItem} (${item.modelo}) - ${item.serial}`}
                                                                        </option>
                                                                    ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                            </>
                                        )}

                                        {producto.bandera.plan && (
                                            <>
                                                <h5 className="mt-4"> Plan largo plazo</h5>

                                                <Row>
                                                    {/* Producto y num de contrato */}
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto en venta:</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                min={0}
                                                                name="nombre_I"
                                                                value={newUser.nombre_I}
                                                                onChange={handleChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Modelo:</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                min={0}
                                                                name="modelo"
                                                                value={newUser.modelo}
                                                                onChange={handleChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>



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
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
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
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                </Row>

                                                  <Row>

                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cobrador asigado</Form.Label>
                                                            <Form.Select
                                                                name="cobrador"
                                                                value={newUser.cobrador}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="0">Seleccione un cobrador</option>
                                                                {cobradores.map((usuarios) => (
                                                                    <option key={usuarios.id} value={usuarios._id}>
                                                                        {usuarios.nombre} {usuarios.apellido}
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

                                        {producto.bandera.entrega_inmediata && (
                                            <>
                                                <h5 className="mt-4"> Plan entrega inmediata</h5>


                                                <Row>

                                                    {/* Select para elegir producto disponible */}
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto disponible:</Form.Label>
                                                            <Form.Select
                                                                name="productoSeleccionado"
                                                                value={newUser.productoSeleccionado || ""} // Asegurar valor inicial
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value;
                                                                    if (selectedId) {
                                                                        const productoSeleccionado = producto.detalles.venta.inventario.find(
                                                                            item => item._id === selectedId
                                                                        );
                                                                        // Actualiza el estado con los datos del producto
                                                                        setNewUser({
                                                                            ...newUser,
                                                                            nombre_I: productoSeleccionado.nombreItem,
                                                                            modelo: productoSeleccionado.modelo,
                                                                            serial: productoSeleccionado.serial,
                                                                            productoSeleccionado: selectedId // Opcional: guardar el ID
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Seleccione un producto...</option>
                                                                {producto.detalles.venta.inventario
                                                                    .filter(item => item.estado === 'disponible') // Solo disponibles
                                                                    .map(item => (
                                                                        <option key={item._id} value={item._id}>
                                                                            {`${item.nombreItem} (${item.modelo}) - ${item.serial}`}
                                                                        </option>
                                                                    ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>

                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Monto de la entrega</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="montoEntregaInmediata"
                                                                value={newUser.montoEntregaInmediata || 0}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>



                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Método de Pago</Form.Label>
                                                            <Form.Select
                                                                name="metodoPago_EntregaInm"
                                                                value={newUser.metodoPago_EntregaInm || ''}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Seleccionar método</option>
                                                                <option value="efectivo">Efectivo</option>
                                                                <option value="transferencia">Transferencia</option>
                                                                <option value="tarjeta">Tarjeta</option>
                                                                <option value="mercado_pago">Mercado Pago</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

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
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
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
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                </Row>

                                                 <Row>

                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cobrador asigado</Form.Label>
                                                            <Form.Select
                                                                name="cobrador"
                                                                value={newUser.cobrador}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="0">Seleccione un cobrador</option>
                                                                {cobradores.map((usuarios) => (
                                                                    <option key={usuarios.id} value={usuarios._id}>
                                                                        {usuarios.nombre} {usuarios.apellido}
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

                                        {producto.bandera.permutada && (
                                            <>
                                                <h5 className="mt-4"> Venta Permutada</h5>

                                                <Row>
                                                    {/* Producto y num de contrato */}

                                                    {/* Select para elegir producto disponible */}
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto disponible:</Form.Label>
                                                            <Form.Select
                                                                name="productoSeleccionado"
                                                                value={newUser.productoSeleccionado || ""} // Asegurar valor inicial
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value;
                                                                    if (selectedId) {
                                                                        const productoSeleccionado = producto.detalles.venta.inventario.find(
                                                                            item => item._id === selectedId
                                                                        );
                                                                        // Actualiza el estado con los datos del producto
                                                                        setNewUser({
                                                                            ...newUser,
                                                                            nombre_I: productoSeleccionado.nombreItem,
                                                                            modelo: productoSeleccionado.modelo,
                                                                            serial: productoSeleccionado.serial,
                                                                            productoSeleccionado: selectedId // Opcional: guardar el ID
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Seleccione un producto...</option>
                                                                {producto.detalles.venta.inventario
                                                                    .filter(item => item.estado === 'disponible') // Solo disponibles
                                                                    .map(item => (
                                                                        <option key={item._id} value={item._id}>
                                                                            {`${item.nombreItem} (${item.modelo}) - ${item.serial}`}
                                                                        </option>
                                                                    ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Monto de la Cuota</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="monto_cuota"
                                                                value={newUser.monto_cuota || ''}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>



                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cantidad de Cuotas</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="cantidad_cuotas"
                                                                value={newUser.cantidad_cuotas || ''}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={4}>
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

                                                <Row>
                                                    {/* Producto y num de contrato */}
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto recibido:</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                min={0}
                                                                name="objetoRecibido"
                                                                value={newUser.objetoRecibido}
                                                                onChange={handleChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Valor de objeto recibido</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="montoObjetoRecibido"
                                                                value={newUser.montoObjetoRecibido || ''}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                        <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cobrador asigado</Form.Label>
                                                            <Form.Select
                                                                name="cobrador"
                                                                value={newUser.cobrador}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="0">Seleccione un cobrador</option>
                                                                {cobradores.map((usuarios) => (
                                                                    <option key={usuarios.id} value={usuarios._id}>
                                                                        {usuarios.nombre} {usuarios.apellido}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>

                                                </Row>



                                            </>
                                        )}



                                    </>
                                )}





                            </>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>DNI del cliente existente</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="dni"
                                        value={newUser.dni}
                                        onChange={handleChange}
                                        minLength={8}
                                        maxLength={8}
                                    />
                                </Form.Group>

                                {/*tipo prestamo */}
                                {producto.tipo === 'prestamo' && (
                                    <>
                                        <h5 className="mt-4">Datos del Préstamo</h5>

                                        <Row>

                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label> Monto Prestado</Form.Label>
                                                    <Form.Select
                                                        name="montoPrestado"
                                                        value={newUser.montoPrestado}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Seleccione un monto</option>
                                                        <option value={100000}>100,000</option>
                                                        <option value={200000}>200,000</option>
                                                        <option value={300000}>300,000</option>
                                                        <option value={400000}>400,000</option>
                                                        <option value={500000}>500,000</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>


                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Monto de la Cuota</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="monto_cuota"
                                                        value={newUser.monto_cuota || ''}
                                                        onChange={handleChange}
                                                        min="0"
                                                        onKeyDown={(e) => {
                                                            // Evita que se escriban caracteres no numéricos
                                                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Cantidad de Cuotas</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="cantidad_cuotas"
                                                        value={newUser.cantidad_cuotas || ''}
                                                        onChange={handleChange}
                                                        min="0"
                                                        onKeyDown={(e) => {
                                                            // Evita que se escriban caracteres no numéricos
                                                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col md={4}>
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

                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Cobrador asigado</Form.Label>
                                                    <Form.Select
                                                        name="cobrador"
                                                        value={newUser.cobrador}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="0">Seleccione un cobrador</option>
                                                        {cobradores.map((usuarios) => (
                                                            <option key={usuarios.id} value={usuarios._id}>
                                                                {usuarios.nombre} {usuarios.apellido}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>


                                    </>
                                )}

                                {/*tipo venta */}
                                {producto.tipo === 'sistema_venta' && (
                                    <>
                                        <h5 className="mt-4">Datos dela venta</h5>

                                        {producto.bandera.venta_directa && (
                                            <>
                                                <h5 className="mt-4"> Venta Directa</h5>

                                                <Row>
                                                        {/* Select para elegir producto disponible */}
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto disponible:</Form.Label>
                                                            <Form.Select
                                                                name="productoSeleccionado"
                                                                value={newUser.productoSeleccionado || ""} // Asegurar valor inicial
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value;
                                                                    if (selectedId) {
                                                                        const productoSeleccionado = producto.detalles.venta.inventario.find(
                                                                            item => item._id === selectedId
                                                                        );
                                                                        // Actualiza el estado con los datos del producto
                                                                        setNewUser({
                                                                            ...newUser,
                                                                            nombre_I: productoSeleccionado.nombreItem,
                                                                            modelo: productoSeleccionado.modelo,
                                                                            serial: productoSeleccionado.serial,
                                                                            productoSeleccionado: selectedId // Opcional: guardar el ID
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Seleccione un producto...</option>
                                                                {producto.detalles.venta.inventario
                                                                    .filter(item => item.estado === 'disponible') // Solo disponibles
                                                                    .map(item => (
                                                                        <option key={item._id} value={item._id}>
                                                                            {`${item.nombreItem} (${item.modelo}) - ${item.serial}`}
                                                                        </option>
                                                                    ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>


                                            </>
                                        )}

                                        {producto.bandera.plan && (
                                            <>
                                                <h5 className="mt-4"> Plan largo plazo</h5>

                                                <Row>
                                                    {/* Producto y num de contrato */}
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto en venta:</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                min={0}
                                                                name="nombre_I"
                                                                value={newUser.nombre_I}
                                                                onChange={handleChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Modelo:</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                min={0}
                                                                name="modelo"
                                                                value={newUser.modelo}
                                                                onChange={handleChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

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
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
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
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>



                                                </Row>

                                                <Row>

                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cobrador asigado</Form.Label>
                                                            <Form.Select
                                                                name="cobrador"
                                                                value={newUser.cobrador}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="0">Seleccione un cobrador</option>
                                                                {cobradores.map((usuarios) => (
                                                                    <option key={usuarios.id} value={usuarios._id}>
                                                                        {usuarios.nombre} {usuarios.apellido}
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

                                        {producto.bandera.entrega_inmediata && (
                                            <>
                                                <h5 className="mt-4"> Plan entrega inmediata</h5>

                                                <Row>
                                                      {/* Select para elegir producto disponible */}
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto disponible:</Form.Label>
                                                            <Form.Select
                                                                name="productoSeleccionado"
                                                                value={newUser.productoSeleccionado || ""} // Asegurar valor inicial
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value;
                                                                    if (selectedId) {
                                                                        const productoSeleccionado = producto.detalles.venta.inventario.find(
                                                                            item => item._id === selectedId
                                                                        );
                                                                        // Actualiza el estado con los datos del producto
                                                                        setNewUser({
                                                                            ...newUser,
                                                                            nombre_I: productoSeleccionado.nombreItem,
                                                                            modelo: productoSeleccionado.modelo,
                                                                            serial: productoSeleccionado.serial,
                                                                            productoSeleccionado: selectedId // Opcional: guardar el ID
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Seleccione un producto...</option>
                                                                {producto.detalles.venta.inventario
                                                                    .filter(item => item.estado === 'disponible') // Solo disponibles
                                                                    .map(item => (
                                                                        <option key={item._id} value={item._id}>
                                                                            {`${item.nombreItem} (${item.modelo}) - ${item.serial}`}
                                                                        </option>
                                                                    ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Monto de la entrega</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="montoEntregaInmediata"
                                                                value={newUser.montoEntregaInmediata || 0}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>



                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Método de Pago</Form.Label>
                                                            <Form.Select
                                                                name="metodoPago_EntregaInm"
                                                                value={newUser.metodoPago_EntregaInm || ''}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Seleccionar método</option>
                                                                <option value="efectivo">Efectivo</option>
                                                                <option value="transferencia">Transferencia</option>
                                                                <option value="tarjeta">Tarjeta</option>
                                                                <option value="mercado_pago">Mercado Pago</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Monto de la Cuota</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="monto_cuota"
                                                                value={newUser.monto_cuota || 0}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>



                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cantidad de Cuotas</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="cantidad_cuotas"
                                                                value={newUser.cantidad_cuotas || 0}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>


                                                </Row>

                                                <Row>

                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cobrador asigado</Form.Label>
                                                            <Form.Select
                                                                name="cobrador"
                                                                value={newUser.cobrador}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="0">Seleccione un cobrador</option>
                                                                {cobradores.map((usuarios) => (
                                                                    <option key={usuarios.id} value={usuarios._id}>
                                                                        {usuarios.nombre} {usuarios.apellido}
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

                                        {producto.bandera.permutada && (
                                            <>
                                                <h5 className="mt-4"> Venta Permutada</h5>

                                                <Row>
                                                    {/* Producto y num de contrato */}
                                                 {/* Select para elegir producto disponible */}
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto disponible:</Form.Label>
                                                            <Form.Select
                                                                name="productoSeleccionado"
                                                                value={newUser.productoSeleccionado || ""} // Asegurar valor inicial
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value;
                                                                    if (selectedId) {
                                                                        const productoSeleccionado = producto.detalles.venta.inventario.find(
                                                                            item => item._id === selectedId
                                                                        );
                                                                        // Actualiza el estado con los datos del producto
                                                                        setNewUser({
                                                                            ...newUser,
                                                                            nombre_I: productoSeleccionado.nombreItem,
                                                                            modelo: productoSeleccionado.modelo,
                                                                            serial: productoSeleccionado.serial,
                                                                            productoSeleccionado: selectedId // Opcional: guardar el ID
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Seleccione un producto...</option>
                                                                {producto.detalles.venta.inventario
                                                                    .filter(item => item.estado === 'disponible') // Solo disponibles
                                                                    .map(item => (
                                                                        <option key={item._id} value={item._id}>
                                                                            {`${item.nombreItem} (${item.modelo}) - ${item.serial}`}
                                                                        </option>
                                                                    ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Monto de la Cuota</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="monto_cuota"
                                                                value={newUser.monto_cuota || 0}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>



                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cantidad de Cuotas</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="cantidad_cuotas"
                                                                value={newUser.cantidad_cuotas || 0}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={4}>
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

                                                <Row>
                                                    {/* Producto y num de contrato */}
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Producto recibido:</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                min={0}
                                                                name="objetoRecibido"
                                                                value={newUser.objetoRecibido}
                                                                onChange={handleChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Valor de objeto recibido</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="montoObjetoRecibido"
                                                                value={newUser.montoObjetoRecibido || 0}
                                                                onChange={handleChange}
                                                                min="0"
                                                                onKeyDown={(e) => {
                                                                    // Evita que se escriban caracteres no numéricos
                                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={4}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Cobrador asigado</Form.Label>
                                                            <Form.Select
                                                                name="cobrador"
                                                                value={newUser.cobrador}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="0">Seleccione un cobrador</option>
                                                                {cobradores.map((usuarios) => (
                                                                    <option key={usuarios.id} value={usuarios._id}>
                                                                        {usuarios.nombre} {usuarios.apellido}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>

                                                </Row>



                                            </>
                                        )}



                                    </>
                                )}

                            </>


                        )}

                        {/*datos comunes en todas las operaciones */}
                        <h5 className="mt-4">Datos del Contrato y Suscripción</h5>
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
                                    <Form.Label>Monto Suscripción-Venta Directa-Recibido </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="monto_suscripcion_vta_dir"
                                        value={newUser.monto_suscripcion_vta_dir || 0}
                                        onChange={handleChange}
                                        min="0"
                                        onKeyDown={(e) => {
                                            // Evita que se escriban caracteres no numéricos
                                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Método de Pago Susripcion</Form.Label>
                                    <Form.Select name="metodoPago_monto_sus_vta" value={newUser.metodoPago_monto_sus_vta} onChange={handleChange}>
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
                                        value={newUser.vendedor}
                                        onChange={handleChange}
                                    >
                                        <option value="0">Seleccione un Vendedor</option>
                                        {vendedores.map((usuarios) => (
                                            <option key={usuarios.id} value={usuarios._id}>
                                                {usuarios.nombre} {usuarios.apellido}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Mostrar select de supervisor solo si no es supervisor */}
                            {usuario.rol !== 'supervisor' && (
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Supervisor</Form.Label>
                                        <Form.Select
                                            name="supervisor"
                                            value={newUser.supervisor}
                                            onChange={handleChange}
                                        >
                                            <option value="0">Seleccione un supervisor</option>
                                            {supervisores.map((usuarios) => (
                                                <option key={usuarios.id} value={usuarios._id}>
                                                    {usuarios.nombre} {usuarios.apellido}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            )}

                            {/* Mostrar información del supervisor si es supervisor */}
                            {usuario.rol === 'supervisor' && (
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
                                    <Form.Select name="tarjeta_tipo" value={newUser.tarjeta_tipo || ''} onChange={handleChange}>
                                        <option value="">Seleccionar uno</option>
                                        <option value="visa">Visa</option>
                                        <option value="mastercard">Mastercard</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>


                        {/* Botón de enviar */}
                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="primary" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span className="visually-hidden">Cargando...</span>
                                        {' Procesando...'}
                                    </>
                                ) : (
                                    'Guardar Cliente'
                                )}
                            </Button>
                        </div>
                    </Form>


                </Modal.Body>

            </Modal>

        </div>
    )
}
