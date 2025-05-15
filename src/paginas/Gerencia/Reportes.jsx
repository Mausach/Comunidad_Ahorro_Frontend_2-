import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from '../../componentes/NavBarGeneral';

export const Reportes = () => {

     const location = useLocation();
      const usuario = location.state;
      const navigate = useNavigate();

  return (
    <div>
        <NavBar usuario={usuario} />
        Reportes
        </div>
  )
}
