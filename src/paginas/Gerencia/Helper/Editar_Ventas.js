import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starEditarVenta = async (ventaId, updatedVenta, setRefreshData, navigate) => {
    try {
        console.log('Enviando datos al backend:', updatedVenta);
        
        const resp = await authApi.put(`/ventas/update-vta/${ventaId}`, updatedVenta);

        Swal.fire({
            title: "Venta actualizada",
            text: "Los cambios han sido guardados correctamente.",
            icon: "success",
            background: "#f9f9f9",
            confirmButtonColor: "#ffc107",
            customClass: {
                title: "swal2-title-custom",
                content: "swal2-content-custom",
                confirmButton: "swal2-confirm-custom",
            },
        });
        
        setRefreshData(true);
        return resp.data;

    } catch (error) {
        console.log('Error completo:', error);
        console.log('Respuesta del error:', error.response);
        
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.msg || 
                            error.response?.data?.details || 
                            'Error al editar la venta';

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

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }

        throw error;
    }
};