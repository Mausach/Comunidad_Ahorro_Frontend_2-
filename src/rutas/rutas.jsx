import React from 'react'
import { HomeLogin } from '../paginas/HomeLogin/HomeLogin'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Creador } from '../paginas/Creater/Creador'
import { Gerente } from '../paginas/Gerencia/Gerente'
import { GestEmpleado } from '../paginas/Gerencia/GestEmpleado'
import { GestClientes } from '../paginas/Gerencia/GestClientes'
import { GestProductos } from '../paginas/Gerencia/GestProductos'
import { RegistrarVenta } from '../paginas/Gerencia/RegistrarVenta'
import { GestCobranza } from '../paginas/Gerencia/GestCobranza'
import { Notificaciones } from '../paginas/Gerencia/Notificaciones'
import { GestStock } from '../paginas/Gerencia/GestStock'
import GestRendiciones from '../paginas/Gerencia/GestRendiciones'
import { CobranzaCobrador } from '../paginas/Cobrador/CobranzaCorador'
import { SupReporte } from '../paginas/Supervisor/SupReporte'
import { ReportCobrador } from '../paginas/Cobrador/ReportCobrador'
import { VendedorRep } from '../paginas/Vendedor/VendedorRep'
import { GestGastos } from '../paginas/Gerencia/GestGastos'
import { ReportVentas } from '../paginas/Gerencia/ReportVentas'
import { ReportPrestamos } from '../paginas/Gerencia/ReportPrestamos'
import { GestorInventario } from '../paginas/Gerencia/GestInventario'


/*
Solucion para el f5 de vercel

Reemplaza BrowserRouter por HashRouter

Las URLs tendrán un # antes de la ruta:

Antes: tudominio.com/gerencia

Ahora: tudominio.com/#/gerencia

Ventajas:

 Soluciona el error 404 al recargar: El servidor solo ve la parte antes del # (siempre cargará index.html).

 Zero configuración en Vercel: No necesitas tocar vercel.json.

Desventajas:

 URLs menos limpias (con #).

 No recomendado para SEO (pero si es una app privada, no hay problema).

*/


export const AppRouter = () => {
  return (
    <HashRouter>
        <Routes>

        <Route path="/*" element={<HomeLogin />} />
        <Route path="/creador" element={<Creador />} />

        {/*rutas para gerencia (genrencia lleva a reporte de gerencia por defecto) */}

        <Route path="/gerencia" element={<Gerente />} />
        <Route path="/gest-emp" element={<GestEmpleado />} />
        <Route path="/gest-cli" element={<GestClientes />} />
        <Route path="/gest-prod" element={<GestProductos />} />
        <Route path="/gest-venta" element={<RegistrarVenta />} />
        <Route path="/gest-cobro" element={<GestCobranza />} />
        <Route path="/gest-noti" element={<Notificaciones />} />
        <Route path="/gest-rendi" element={<GestRendiciones />} />
        <Route path="/gest-gastos" element={<GestGastos />} />
        <Route path="/report-vtas" element={<ReportVentas />} />
        <Route path="/report-prest" element={<ReportPrestamos />} />

        <Route path="/gest-inv" element={<GestorInventario />} />
        
        <Route path="/cobrador" element={<CobranzaCobrador />} />
        <Route path="/rep-cobrador" element={<ReportCobrador />} />
        <Route path="/sup" element={<SupReporte />} /> 

        <Route path="/vendedor" element={<VendedorRep />} />


      </Routes>

    </HashRouter>
    
  )
}