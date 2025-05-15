import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import { CargarUsuarios } from '../Creater/Helper/CargarUsuario';
import { NavBar } from '../../componentes/NavBarGeneral';
import CardReportUsuario from './Componente/CardReport';


export const VendedorRep = () => {
      const location = useLocation();
        const usuario = location.state;
        const navigate = useNavigate();
    
        const [users, setUsers] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
    
    
        useEffect(() => {
            const controller = new AbortController();
            const { signal } = controller;
            const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    
            try {
                setLoading(true);
                setError(null);
                CargarUsuarios(setUsers, navigate, { signal });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setError("Error crítico. Contacte soporte.");
                }
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
    
    
            return () => {
                controller.abort();
                clearTimeout(timeoutId);
            };
        }, []);
    
        if (loading) return <Spinner animation="border" variant="primary" className="mt-5" />;
        if (error) {
            return (
                <Alert variant="danger" className="mt-3">
                    {error} <Button onClick={() => setRefreshData(true)}>Reintentar</Button>
                </Alert>
            );
        }
  return (
    <div>
         <NavBar usuario={usuario} />
                    
        <CardReportUsuario usuario={usuario} />

    </div>
  )
}
