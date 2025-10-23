import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starProcesarVenta2 = async (ventaData, setRefreshData, navigate) => {
    try {


         console.log('=== DATOS QUE SE ENVÍAN AL BACKEND ===');
        console.log('Estructura completa:', JSON.stringify(ventaData, null, 2));
        console.log('Tiene propiedad cliente?:', 'cliente' in ventaData);
        console.log('Cliente tiene dni?:', ventaData.cliente?.dni ? 'Sí' : 'No');
        console.log('Campos del cliente:', Object.keys(ventaData.cliente || {}));

        const resp = await authApi.post('/ventas/ventas-procesar', ventaData);

        Swal.fire({
            title: "Venta procesada",
            text: "La venta ha sido procesada exitosamente.",
            icon: "success",
            background: "#f9f9f9",
            confirmButtonColor: "#077bffff",
            customClass: {
                title: "swal2-title-custom",
                content: "swal2-content-custom",
                confirmButton: "swal2-confirm-custom",
            },
        });

        setRefreshData(true);
        
        return {
            success: true,
            venta: resp.data.venta
        };

    } catch (error) {
        const errores = error.response?.data?.errors;
        
        if (errores) {
            const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al procesar la venta';
            
            Swal.fire({
                title: "ERROR",
                text: mensajeDeError,
                icon: "error",
                background: "#f9f9f9",
                confirmButtonColor: "#ffc107",
                customClass: {
                    title: "swal2-title-custom",
                    content: "swal2-content-custom",
                    confirmButton: "swal2-confirm-custom",
                },
            });
        } else {
            const errorMessage = error.response?.data?.msg || 'Error al procesar la venta';
            Swal.fire({
                title: "ERROR",
                text: errorMessage,
                icon: "error",
                background: "#f9f9f9",
                confirmButtonColor: "#ffc107",
                customClass: {
                    title: "swal2-title-custom",
                    content: "swal2-content-custom",
                    confirmButton: "swal2-confirm-custom",
                },
            });
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }

        return {
            success: false,
            error: error.response?.data
        };
    }
};