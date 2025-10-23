import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starCrearCliente2 = async (clienteData, setRefreshData, navigate) => {
    try {
        const resp = await authApi.post('/ventas/new-clientes', clienteData);

        Swal.fire({
            title: "Cliente creado",
            text: "El cliente ha sido creado exitosamente.",
            icon: "success",
            background: "#f9f9f9",
            confirmButtonColor: "#0755ffff",
            customClass: {
                title: "swal2-title-custom",
                content: "swal2-content-custom",
                confirmButton: "swal2-confirm-custom",
            },
        });

        // Retornamos el cliente creado para usarlo en el siguiente paso
        return {
            success: true,
            cliente: resp.data.cliente // Ajusta según la respuesta de tu backend
        };

    } catch (error) {
        const errores = error.response?.data?.errors;
        
        if (errores) {
            const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al crear el cliente';
            
            Swal.fire({
                title: "ERROR",
                text: mensajeDeError,
                icon: "error",
                background: "#f9f9f9",
                confirmButtonColor: "#078fffff",
                customClass: {
                    title: "swal2-title-custom",
                    content: "swal2-content-custom",
                    confirmButton: "swal2-confirm-custom",
                },
            });
        } else {
            const errorMessage = error.response?.data?.msg || 'Error al crear el cliente';
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