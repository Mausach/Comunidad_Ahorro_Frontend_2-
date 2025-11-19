import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starBuscarClientePorDNI = async (dni, navigate) => {
    try {
        console.log('=== BUSCANDO CLIENTE POR DNI ===');
        console.log('DNI:', dni);

        // 👇 Usar la nueva ruta
        const resp = await authApi.get(`/ventas/buscar-cliente?dni=${dni}`);

        console.log('=== CLIENTE ENCONTRADO ===');
        console.log('Datos del cliente:', resp.data.cliente);

        return {
            success: true,
            cliente: resp.data.cliente
        };


    } catch (error) {
        console.error('Error al buscar cliente:', error.response);

        if (error.response?.status === 404) {
            Swal.fire({
                title: "Cliente no encontrado",
                text: "No existe un cliente con el DNI proporcionado.",
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
            const errorMessage = error.response?.data?.message || 'Error al buscar el cliente';
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