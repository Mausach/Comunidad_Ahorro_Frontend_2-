import React, { useEffect, useState } from 'react'
import { NavBar } from '../../componentes/NavBarGeneral';
import { useLocation, useNavigate } from 'react-router-dom';
import CardProducto from './Componentes/CartaProducto';
import { Alert, Button, Col, Container, Row } from 'react-bootstrap';
import { CargarProductos } from './Helper/cargarPorductos';
import { ModalCrearProducto } from './Componentes/ModalCrearProducto';
import Swal from 'sweetalert2';
import { GestStock } from './GestStock';

export const GestProductos = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const [productos, setproductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tipo, setTipo] = useState('');
  const [refreshData, setRefreshData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStock, setShowStock] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal de crear producto

  const handleShowModal = () => setShowModal(true);

  const handleStock = (producto) => {
    setProductoSeleccionado(producto);
    setShowStock(true);
  };

  const handleBackStock = () => setShowStock(false);

  const handleCloseModal = () => {
    setShowModal(false);
    // Restablecer estilos del body

  };


  const handleCrear = () => {
    Swal.fire({
      title: '¿Qué deseas crear?',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "sistema de venta de producto",
      denyButtonText: 'Préstamo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      denyButtonColor: '#0d6efd',
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          setTipo("sistema_venta")
          handleShowModal();
        }, 100);
      } else if (result.isDenied) {
        setTimeout(() => {
          setTipo('prestamo')
          handleShowModal();
        }, 100);
      }
    }).finally(() => {
      // ✅ Restablecer el scroll del body
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px"; // Evita el desplazamiento lateral
    });
  };


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

      {!showStock ? (
        <>
          <Button variant="primary" className='mb-3 rounded-3 m-4' onClick={handleCrear}>
            Crear un Nuevo Producto
          </Button>

          <Container className="mt-5 p-3">

            {productos.length > 0 ? (
              <div>
                {/* Cards de los Planes y Préstamos */}
                <Row className="mb-4 gy-4">
                  {productos.map((producto) => (
                    <Col key={producto.id} md={4} sm={6} xs={12} className="mb-3">
                      <CardProducto
                        usuario={usuario}
                        producto={producto}
                        handleStock={handleStock}
                        handleBackStock={handleBackStock}
                        setRefreshData={setRefreshData}
                        navigate={navigate}
                      />
                    </Col> 
                  ))}
                </Row>
              </div>
            ) : (
              <Alert variant="danger">
                <h5>No hay datos disponibles para mostrar.</h5>
              </Alert>
            )}

            <ModalCrearProducto
              showModal={showModal}
              handleCloseModal={handleCloseModal}
              setRefreshData={setRefreshData}
              navigate={navigate}
              tipo={tipo}
            />

          </Container>
        </>


      ) : (
        <>
          <Button variant="outline-secondary" onClick={handleBackStock} className="m-3">
            <i className="bi bi-arrow-left"></i> Volver a productos
          </Button>
          <GestStock
          handleStock={handleStock}
          handleBackStock={handleBackStock}
            producto={productoSeleccionado}
            setRefreshData={setRefreshData}
            navigate={navigate}
          />

        </>
      )}





    </div>
  )
}
