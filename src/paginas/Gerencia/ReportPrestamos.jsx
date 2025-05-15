import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from '../../componentes/NavBarGeneral';
import { CargarPresRep } from './Helper/CargarPresReport';
import ListaPrestamos from './Componentes/ListaPresRep';

export const ReportPrestamos = () => {


  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  //ventas de prestamo
  const [ventas, setVentas] = useState([]);
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
        await CargarPresRep(setVentas, navigate, { signal });
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
      <ListaPrestamos prestamos={ventas} />
    </div>
  )
}
