import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from '../../componentes/NavBarGeneral';
import { CargarProductos } from './Helper/cargarPorductos';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { VentaCard } from './Componentes/VentaCard';

export const RegistrarVenta = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const [productos, setproductos] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
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
        await CargarProductos(setproductos, navigate, { signal });
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


  return (
    <div>
      <NavBar usuario={usuario} />
      <Container className="mt-5 p-3">

        {productos.length > 0 ? (
          <div>
            {/* Cards de los Planes y Préstamos */}
            <Row className="mb-4 gy-4">
              {productos.map((producto) => (
                <Col key={producto._id} md={4} sm={6} xs={12}>
                <VentaCard
                  producto={producto}
                  setRefreshData={setRefreshData}
                  navigate={navigate}
                  usuario={usuario}
                />
              </Col>
              ))}
            </Row>
          </div>
        ) : (
          <Alert variant="danger">
             <Col>
            <h1>No hay productos disponibles en este momento.</h1>
          </Col>
          </Alert>
        )}

      </Container>
    </div>
  )
}
