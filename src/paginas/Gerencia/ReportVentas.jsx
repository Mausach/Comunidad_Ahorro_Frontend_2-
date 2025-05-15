import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from '../../componentes/NavBarGeneral';
import { CargarVentasRep } from './Helper/CargarVtasReport';
import ListaVentasSistema from './Componentes/ListaVentasRep';

export const ReportVentas = () => {
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
                await CargarVentasRep(setVentas, navigate, { signal });
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
        <ListaVentasSistema ventas={ventas} />
        </div>
  )
}
