import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import CardReportUsuario from '../Vendedor/Componente/CardReport';
import { CargarRendUs } from './Helper/cargarRendUsuario';
import RendicionesPendientes from './Componente/RepRendiciones';
import { Alert, Spinner } from 'react-bootstrap';
import { NavBar } from '../../componentes/NavBarGeneral';

export const ReportCobrador = () => {
    const location = useLocation();
    const usuario = location.state;
    const navigate = useNavigate();

       const [rendiciones, setRendiciones] = useState([]);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);


      useEffect(() => {
                const controller = new AbortController();
                const { signal } = controller;
                const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        
                try {
                    setLoading(true);
                    setError(null);
                    CargarRendUs(usuario.dni,setRendiciones, navigate, { signal });
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
                    algo salio mal al cargar rendicion
                </Alert>
            );
        }

    return (
        <div>
            <NavBar usuario={usuario} />
        <CardReportUsuario usuario={usuario}/>
        <RendicionesPendientes rendiciones={rendiciones}/>

        </div>
    )
}
