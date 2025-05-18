import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from '../../componentes/NavBarGeneral';
import { ModalRegistGasto } from './Componentes/ModalRegGastos';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row, Spinner } from 'react-bootstrap';
import { CargarGastos } from './Helper/cargarGastos';

export const GestGastos = () => {
    const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

   const [gastos, setGastos] = useState([]);
    const [gastosFiltrados, setGastosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mes, setMes] = useState("");
    const [anio, setAnio] = useState("");
    const [refreshData, setRefreshData] = useState(false);
    const [showGastoModal, setShowGastoModal] = useState(false);

    // Calcular el total de gastos filtrados
    const totalGastos = gastosFiltrados.reduce((sum, gasto) => sum + parseFloat(gasto.Monto_gasto || 0), 0);

    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    };

    const handleRegistrarGasto = () => {
        setShowGastoModal(true);
    };


    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);
                await CargarGastos(setGastos, navigate);
            } catch (error) {
                console.error("Error cargando datos:", error);
                setError("Hubo un problema al cargar los datos.");
            } finally {
                setLoading(false);
                if (refreshData) setRefreshData(false);
            }
        };
        cargarDatos();
    }, [navigate, refreshData]);

    useEffect(() => {
        if (mes && anio) {
            const filtrados = gastos.filter((gasto) => {
                const fecha = new Date(gasto.fecha);
                return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anio);
            });
            setGastosFiltrados(filtrados);
        } else {
            setGastosFiltrados(gastos);
        }
    }, [mes, anio, gastos]);

    const formatFechaArgentina = (fecha) => {
        if (!fecha) return "No disponible";
        return new Date(fecha).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    if (loading) {
        return <Spinner animation="border" variant="primary" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

  return (
    <div>
        <NavBar usuario={usuario} />

<Container>

    <Button variant="success" className="m-3" onClick={handleRegistrarGasto}>
                Registrar Gasto
            </Button>
              {/* Cards de Resumen */}
            <Row className="mb-4">
                <Col md={6} lg={4} className="mb-3">
                    <Card border="primary" className="h-100">
                        <Card.Header className="bg-primary text-white">
                            <strong>Total Gastos</strong>
                        </Card.Header>
                        <Card.Body className="text-center">
                            <Card.Title>{formatMonto(totalGastos)}</Card.Title>
                            <Card.Text>
                                {mes && anio ? 
                                    `En ${new Date(0, mes-1).toLocaleString("es-AR", { month: "long" })} ${anio}` : 
                                    "Todos los gastos"}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={4} className="mb-3">
                    <Card border="info" className="h-100">
                        <Card.Header className="bg-info text-white">
                            <strong>Cantidad</strong>
                        </Card.Header>
                        <Card.Body className="text-center">
                            <Card.Title>{gastosFiltrados.length}</Card.Title>
                            <Card.Text>Operaciones registradas</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filtros */}
            <Form className="mb-3">
                <Row>
                    <Form.Group className="col-md-6" controlId="formMes">
                        <Form.Label>Mes</Form.Label>
                        <Form.Control as="select" value={mes} onChange={(e) => setMes(e.target.value)}>
                            <option value="">Seleccione un mes</option>
                            {[...Array(12).keys()].map((i) => (
                                <option key={i} value={i + 1}>
                                    {new Date(0, i).toLocaleString("es-AR", { month: "long" })}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="col-md-6" controlId="formAnio">
                        <Form.Label>Año</Form.Label>
                        <Form.Control as="select" value={anio} onChange={(e) => setAnio(e.target.value)}>
                            <option value="">Seleccione un año</option>
                            {[...Array(new Date().getFullYear() - 2022 + 1)].map((_, i) => {
                                const year = 2023 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </Form.Control>
                    </Form.Group>
                </Row>
            </Form>

            {/* Lista de Gastos */}
            {gastosFiltrados.length === 0 ? (
                <Alert variant="warning">No hay gastos disponibles para este mes y año.</Alert>
            ) : (
                gastosFiltrados.map((gasto, index) => (
                    <Card key={index} className="mb-3 shadow-sm">
                        <Card.Header className="bg-danger text-white">
                            <strong>Gastos</strong>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <strong>Fecha: </strong> {gasto.fecha}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Monto: </strong> {formatMonto(gasto.Monto_gasto)}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Descripcion: </strong> {gasto.descripcion_gasto || "No especificada"}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Responsable: </strong> {gasto.responsable || "No especificada"}
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                ))
            )}


    
</Container>

 
            <ModalRegistGasto
                show={showGastoModal}
                handleClose={() => setShowGastoModal(false)}
                usuario={usuario}
                setRefreshData={setRefreshData}
                navigate={navigate}
            />

    </div>
  )
}
