import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Accordion, Alert, Badge, Spinner } from 'react-bootstrap';
//import { CargarRendiciones } from '../../Helpers/CargarRendiciones';
//import RendicionListaHist from './HistorialRendiciones';
import { useLocation, useNavigate } from 'react-router-dom';
import { CargarRendiciones } from './Helper/CargarRendiciones';
import ListaDeRendiciones from './Componentes/ListaDeRendiciones';
import { NavBar } from '../../componentes/NavBarGeneral';

const GestRendiciones = () => {

    const location = useLocation();
    const usuario = location.state;
    const navigate = useNavigate();


    const [rendiciones, setRendicion] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [filtro, setFiltro] = useState('pendientes'); // Estado para el filtro

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    // Función para filtrar rendiciones según el estado
    const filtrarRendiciones = () => {
        switch (filtro) {
            case 'pendientes':
                return rendiciones.filter(rendicion => !rendicion.estado);
            case 'historial':
                return rendiciones.filter(rendicion => rendicion.estado);
            default:
                return rendiciones;
        }
    };

    const formatFechaArgentina = (fecha) => {
        if (!fecha) return "No disponible";
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-AR', options);
    };


    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);
                await CargarRendiciones(setRendicion, navigate, { signal });
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

    const rendicionesFiltradas = filtrarRendiciones();

    if (loading) {
        return <Spinner animation="border" variant="primary" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <>
            <NavBar usuario={usuario} />

            <div style={{ overflowX: 'auto', padding: '10px' }}>
                {/* Botones de Filtro */}
                <Row className="mb-4 text-center">
                    <Col>
                        <Button
                            variant={filtro === 'pendientes' ? "primary" : "outline-primary"}
                            onClick={() => setFiltro('pendientes')}
                            className="me-2"
                        >
                            <i className="bi bi-hourglass-split"> </i>
                            Pendientes
                        </Button>
                        <Button
                            variant={filtro === 'historial' ? "primary" : "outline-primary"}
                            onClick={() => setFiltro('historial')}
                        >
                            <i className="bi bi-receipt-cutoff"> </i>
                            Historial
                        </Button>
                    </Col>
                </Row>

                {/* Listado de Rendiciones */}
                <Row className="d-flex justify-content-center">



                    <ListaDeRendiciones
                        rendiciones={rendicionesFiltradas}
                        setRefreshData={setRefreshData}
                        navigate={navigate}
                        tipoMostrar="venta" // o "cobranza", etc.
                    />

                </Row>
            </div>

        </>



    );
};

export default GestRendiciones;