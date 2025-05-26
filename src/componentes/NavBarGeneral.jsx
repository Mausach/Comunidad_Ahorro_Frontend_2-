import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo1_Black-removebg-preview.png'
import Swal from 'sweetalert2';
import { verificarNotificacionesNavbar } from './Helper/notificacionCamp';


export const NavBar = ({ usuario }) => {

    const navigate = useNavigate();

    //para campana modal
    const [notificaciones, setNotificaciones] = useState(0); // 0 = sin notificaciones


    const ir_Login = () => {
        emailUs = null;
        navigate('/login', { state: emailUs })
    }



    const ir_gestEmp = () => {
        navigate('/gest-emp', { state: usuario })
    }

    const ir_gestCli = () => {
        navigate('/gest-cli', { state: usuario })
    }

    const ir_regVen = () => {
        navigate('/gest-venta', { state: usuario })
    }

    const ir_regCob = () => {
        navigate('/gest-cobro', { state: usuario })
    }

    const ir_noti = () => {
        navigate('/gest-noti', { state: usuario })
    }

    const ir_repor = () => {
        navigate('/gerencia', { state: usuario })
        // Resto del código
    };

    const ir_Creador = () => {
        console.log("navegar a donde diga el boton")
        // Resto del código
    };


    const ir_gestProd = () => {
        navigate('/gest-prod', { state: usuario })
    };


    const ir_vendedor = () => {
        navigate('/vendedor', { state: usuario })
    }

       const ir_inventario = () => {
        navigate('/gest-inv', { state: usuario })
    }

    const ir_cobrador_rep = () => {
        navigate('/rep-cobrador', { state: usuario })
    }


    const ir_supReport = () => {
        navigate('/sup', { state: usuario })
    }

    const ir_cobrador = () => {
        navigate('/cobrador', { state: usuario })
    }


    const ir_LogOut = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Se cerrará tu sesión actual.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                usuario = null;
                navigate("/");
            }
        });
    }




useEffect(() => {
    if (usuario?.rol !== 'cobrador') {  // Solo ejecuta si el rol NO es 'cobrador'
        verificarNotificacionesNavbar(setNotificaciones, navigate);
    }
}, [usuario?.rol]);  // Dependencia: si el rol cambia, se reevalúa

    const renderNavbarPorRol = () => {
        switch (usuario.rol) {
            case 'creador': //navbar de administrador

                return (
                    <Navbar
                        collapseOnSelect expand="lg" sticky="top"

                        className="navbar-dark navbar-expand-lg fondo_nav_footer"
                    >
                        <Container fluid>
                            <Navbar.Brand onClick={ir_LogOut}>
                                <h3 className="text-light">
                                    <div className=''>
                                        <img className="logo img-fluid" style={{ width: '200px', height: '100px', objectFit: 'cover' }} src={Logo} alt="Logo" />
                                    </div>
                                </h3>
                            </Navbar.Brand>
                            <Navbar.Toggle
                                aria-controls="responsive-navbar-nav"
                                className="custom-navbar-toggle text-light"
                            />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto"></Nav>
                                <Nav>


                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_LogOut}
                                    >
                                        <i className="bi bi-box-arrow-left"> </i>
                                        Salir
                                    </Button>



                                </Nav>

                            </Navbar.Collapse>

                        </Container>
                    </Navbar>

                );

            case 'gerente': //navbar de administrador
                return (
                    <Navbar
                        collapseOnSelect expand="lg" sticky="top"

                        className="navbar-dark navbar-expand-lg fondo_nav_footer"
                    >
                        <Container fluid>
                            <Navbar.Brand onClick={ir_LogOut}>
                                <h3 className="text-light">
                                    <div className=''>
                                        <img className="logo img-fluid" style={{ width: '200px', height: '100px', objectFit: 'cover' }} src={Logo} alt="Logo" />
                                    </div>
                                </h3>
                            </Navbar.Brand>
                            <Navbar.Toggle
                                aria-controls="responsive-navbar-nav"
                                className="custom-navbar-toggle text-light"
                            />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto"></Nav>
                                <Nav>
                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_gestEmp}
                                    >
                                        Gestion de empleados
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_gestProd}
                                    >
                                        Gestion de productos
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_gestCli}
                                    >
                                        Gestion de Clientes
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_regVen}
                                    >
                                        Registrar venta
                                    </Button>

                                    
                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_inventario}
                                    >
                                        Gestionar Inventario
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_regCob}
                                    >
                                        Realizar cobro
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_repor}
                                    >
                                        Reportes General
                                    </Button>


                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_noti}
                                    >
                                        <i className="bi bi-bell"></i>
                                        {notificaciones > 0 && ( // Solo muestra el badge si hay notificaciones
                                            <Badge bg="danger" className="ms-1">
                                                {notificaciones} 
                                            </Badge>
                                        )}
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_LogOut}
                                    >
                                        <i className="bi bi-box-arrow-left"> </i>
                                        Salir
                                    </Button>



                                </Nav>

                            </Navbar.Collapse>

                        </Container>
                    </Navbar>


                );

            case 'administrador': //navbar de administrador
                return (
                    <Navbar
                        collapseOnSelect expand="lg" sticky="top"

                        className="navbar-dark navbar-expand-lg fondo_nav_footer"
                    >
                        <Container fluid>
                            <Navbar.Brand onClick={ir_LogOut}>
                                <h3 className="text-light">
                                    <div className=''>
                                        <img className="logo img-fluid" style={{ width: '200px', height: '100px', objectFit: 'cover' }} src={Logo} alt="Logo" />
                                    </div>
                                </h3>
                            </Navbar.Brand>
                            <Navbar.Toggle
                                aria-controls="responsive-navbar-nav"
                                className="custom-navbar-toggle text-light"
                            />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto"></Nav>
                                <Nav>
                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_gestEmp}
                                    >
                                        Gestion de empleados
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_gestCli}
                                    >
                                        Gestion de Clientes
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_regVen}
                                    >
                                        Registrar venta
                                    </Button>

                                      <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_inventario}
                                    >
                                        Gestionar Inventario
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_regCob}
                                    >
                                        Realizar cobro
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_repor}
                                    >
                                        Reportes General
                                    </Button>


                                     <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_noti}
                                    >
                                        <i className="bi bi-bell"></i>
                                        {notificaciones > 0 && ( // Solo muestra el badge si hay notificaciones
                                            <Badge bg="danger" className="ms-1">
                                                {notificaciones} 
                                            </Badge>
                                        )}
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_LogOut}
                                    >
                                        <i className="bi bi-box-arrow-left"> </i>
                                        Salir
                                    </Button>



                                </Nav>

                            </Navbar.Collapse>

                        </Container>
                    </Navbar>


                );

            case 'supervisor':
                return (
                    <Navbar
                        collapseOnSelect expand="lg" sticky="top"

                        className="navbar-dark navbar-expand-lg fondo_nav_footer"
                    >
                        <Container fluid>
                            <Navbar.Brand onClick={ir_LogOut}>
                                <h3 className="text-light">
                                    <div className=''>
                                        <img className="logo img-fluid" style={{ width: '200px', height: '100px', objectFit: 'cover' }} src={Logo} alt="Logo" />
                                    </div>
                                </h3>
                            </Navbar.Brand>
                            <Navbar.Toggle
                                aria-controls="responsive-navbar-nav"
                                className="custom-navbar-toggle text-light"
                            />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto"></Nav>
                                <Nav>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_regVen}
                                    >
                                        Registrar venta
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_supReport}
                                    >
                                        Reportes del equipo
                                    </Button>


                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={console.log("funcion de campanita")}
                                    >
                                        Datos


                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_LogOut}
                                    >
                                        <i className="bi bi-box-arrow-left"> </i>
                                        Salir
                                    </Button>



                                </Nav>

                            </Navbar.Collapse>

                        </Container>
                    </Navbar>
                );
            case 'vendedor':
                return (
                    <Navbar
                        collapseOnSelect expand="lg" sticky="top"

                        className="navbar-dark navbar-expand-lg fondo_nav_footer"
                    >
                        <Container fluid>
                            <Navbar.Brand onClick={ir_LogOut}>
                                <h3 className="text-light">
                                    <div className=''>
                                        <img className="logo img-fluid" style={{ width: '200px', height: '100px', objectFit: 'cover' }} src={Logo} alt="Logo" />
                                    </div>
                                </h3>
                            </Navbar.Brand>
                            <Navbar.Toggle
                                aria-controls="responsive-navbar-nav"
                                className="custom-navbar-toggle text-light"
                            />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto"></Nav>
                                <Nav>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_regVen}
                                    >
                                        Productos


                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_vendedor}
                                    >
                                        Reportes de desempeño
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={console.log('en desarrollo')}
                                    >
                                        Datos


                                    </Button>



                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_LogOut}
                                    >
                                        <i className="bi bi-box-arrow-left"> </i>
                                        Salir
                                    </Button>



                                </Nav>

                            </Navbar.Collapse>

                        </Container>
                    </Navbar>

                );
            default:

                // default para cobradores
                return (
                    <Navbar
                        collapseOnSelect expand="lg" sticky="top"

                        className="navbar-dark navbar-expand-lg fondo_nav_footer"
                    >
                        <Container fluid>
                            <Navbar.Brand onClick={ir_LogOut}>
                                <h3 className="text-light">
                                    <div className=''>
                                        <img className="logo img-fluid" style={{ width: '200px', height: '100px', objectFit: 'cover' }} src={Logo} alt="Logo" />
                                    </div>
                                </h3>
                            </Navbar.Brand>
                            <Navbar.Toggle
                                aria-controls="responsive-navbar-nav"
                                className="custom-navbar-toggle text-light"
                            />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto"></Nav>
                                <Nav>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_cobrador_rep}
                                    >
                                        Reportes de desempeño
                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_cobrador}
                                    >
                                        {/* Notificaciones */}
                                        <i className="bi bi-bell"></i>

                                        <Badge bg="danger" className="ms-1">{1}</Badge>


                                    </Button>

                                    <Button
                                        className="m-2 rounded-3 custom-dropdown-toggle"
                                        variant="outline-light"
                                        onClick={ir_LogOut}
                                    >
                                        <i className="bi bi-box-arrow-left"> </i>
                                        Salir
                                    </Button>



                                </Nav>

                            </Navbar.Collapse>

                        </Container>
                    </Navbar>
                );
        }
    };

    return (
        <div >


            {renderNavbarPorRol()}


        </div>
    )
}

