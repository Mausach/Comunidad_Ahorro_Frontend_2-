import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Form from "react-bootstrap/Form";
import InputGroup from 'react-bootstrap/InputGroup'; // Importar InputGroup para íconos
import { Eye, EyeSlash, Person } from 'react-bootstrap-icons'; // Importar íconos
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
//import { starLogin } from '../Helpers/StarLogin';
import Logo from '../../../assets/Logo1-removebg-preview.png'
import { starLogin } from '../Helpers/StarLogin';

export const CardLoguin = () => {
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña

    // Función para alternar la visibilidad de la contraseña
    const togglePassword = () => setShowPassword(!showPassword);

    // State para usuario e email del usuario
    const [user, setUser] = useState({
        email: "", //cambiar a nombreusuario o email
        password: "",
    });

    const navigate = useNavigate();


    // Controla los cambios en los campos del formulario
    const onInputChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    // Captura los datos del formulario y verifica los campos
    const onSubmit = (e) => {
        e.preventDefault();
        if (user.email.trim() === "" || user.password.trim() === "") {
            // Usar SweetAlert2 para mostrar un error
            Swal.fire({
                title: '¡Error!',
                text: 'Todos los campos son obligatorios.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        } else {
            // Llamar a la función para iniciar sesión (puedes personalizarla)
            starLogin(user.email, user.password, navigate);
            

        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            {/* Card centrada con sombra */}
            <Card style={{ width: '23rem' }} className="shadow-lg rounded-5">
                <Card.Body>
                    <Card.Title className='text-center'>

                        <div >
                        <img className="logo img-fluid" style={{ width: '300px', height: '150px', objectFit: 'cover' }} src={Logo} alt="Logo" />
                        </div>
                    </Card.Title>
                    <Card.Subtitle className=" text-muted text-center">
                        Sistema de gestión personalizado
                    </Card.Subtitle>

                    {/* Formulario para login */}
                    <Form onSubmit={onSubmit} className="p-5 p-sm-4 m-3">
                        {/* Campo de correo electrónico con ícono */}
                        <Form.Group className="mb-3" controlId="formGroupEmail">
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Email o Nombre de Usuario"
                                    minLength={3}
                                    maxLength={25}
                                    name="email"
                                    value={user.email}
                                    onChange={onInputChange}
                                />
                                <InputGroup.Text>
                                    <Person />
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        {/* Campo de contraseña con ícono y ojito */}
                        <Form.Group className="mb-3" controlId="formGroupPassword">
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña"
                                    minLength={6}
                                    maxLength={25}
                                    name="password"
                                    value={user.password}
                                    onChange={onInputChange}
                                />
                                <InputGroup.Text onClick={togglePassword} style={{ cursor: 'pointer' }}>
                                    {showPassword ? <EyeSlash /> : <Eye />}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="pt-4 d-flex justify-content-center align-items-center">
                            <Button variant="primary" type="submit">Ingresar</Button>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};
