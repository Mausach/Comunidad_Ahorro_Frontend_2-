import React, { useEffect, useState } from 'react'
import { NavBar } from '../../componentes/NavBarGeneral'
import { useLocation, useNavigate } from 'react-router-dom';
import { CargarVentas } from './Helper/CargarVentas';
import { ListaVentas } from './Componentes/ListaVentasCobranza';

export const GestCobranza = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

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
          await CargarVentas(setVentas, navigate, { signal });
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
      <NavBar usuario={usuario}/>
      <ListaVentas ventas={ventas} navigate={navigate} usuario={usuario} refreshData={refreshData} setRefreshData={setRefreshData} />
      </div>
  )
}
