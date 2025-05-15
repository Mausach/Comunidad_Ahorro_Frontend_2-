import React, { useState, useEffect } from "react";

import { gsap } from "gsap";
import Logo from '../../assets/Logo1-removebg-preview.png'

import { CardLoguin } from "./Componentes/CardLogin";
import { Footer } from "../../componentes/Footer";

export const HomeLogin = () => {
    const [showWelcome, setShowWelcome] = useState(true); // Estado para controlar la pantalla de bienvenida

    useEffect(() => {
        if (showWelcome) {
            // Animación de entrada del mensaje de bienvenida
            const timeline = gsap.timeline();
            timeline
                .fromTo(
                    ".welcome-screen",
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
                )
                .to(".welcome-screen", {
                    opacity: 0,
                    scale: 0.8,
                    duration: 1,
                    ease: "power2.in",
                    delay: 2, // Mostrar el mensaje durante 2 segundos
                    onComplete: () => setShowWelcome(false), // Ocultar el mensaje
                });
        }
    }, [showWelcome]);

    return (
        <div>
            {showWelcome ? (
                <div className="welcome-screen d-flex justify-content-center align-items-center min-vh-100">



                    <h1 className="text-center text-w">

                        <div className='d-flex justify-content-center align-items-center'>
                            <img className="logo" style={{ width: '400px' }} src={Logo} alt="Logo" />
                        </div>
                    </h1>


                </div>
            ) : (
                // Contenido principal después de la bienvenida
                <CardLoguin />
            )}
            <Footer/>
        </div>
    );
};