import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from '../../componentes/NavBarGeneral';
import { CargarProductos } from './Helper/cargarPorductos';
import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';
import { VentaCard } from './Componentes/VentaCard';

export const RegistrarVenta = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]); // Todos los productos
  const [filteredProducts, setFilteredProducts] = useState([]); // Productos filtrados
  const [refreshData, setRefreshData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para filtrar productos con estado true
  const filterActiveProducts = (products) => {
    return products.filter(producto => producto.estado === true);
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        await CargarProductos(setAllProducts, navigate, { signal });
        
        // Filtramos los productos después de cargarlos
        const activeProducts = filterActiveProducts(allProducts);
        setFilteredProducts(activeProducts);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError("Error crítico. Contacte soporte.");
          console.error("Error al cargar productos:", error);
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

  // Efecto adicional para filtrar cuando allProducts cambia
  useEffect(() => {
    const activeProducts = filterActiveProducts(allProducts);
    setFilteredProducts(activeProducts);
  }, [allProducts]);

  if (loading) {
    return (
      <div>
        <NavBar usuario={usuario} />
        <Container className="mt-5 p-3 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando productos...</span>
          </Spinner>
          <p>Cargando productos disponibles...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar usuario={usuario} />
        <Container className="mt-5 p-3">
          <Alert variant="danger">
            <h3>{error}</h3>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div>
      <NavBar usuario={usuario} />
      <Container className="mt-5 p-3">
        {filteredProducts.length > 0 ? (
          <div>
            <Row className="mb-4 gy-4">
              {filteredProducts.map((producto) => (
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
          <Alert variant="info">
            <Col>
              <h3>No hay productos activos disponibles en este momento.</h3>
              <p>Por favor, intente más tarde o contacte al administrador.</p>
            </Col>
          </Alert>
        )}
      </Container>
    </div>
  );
};
