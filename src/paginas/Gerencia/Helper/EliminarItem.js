import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starDropItem = async (itemId, setRefreshData, navigate) => {
  try {
    const resp = await authApi.delete(`/inventario/delete-inv/${itemId}`);

    Swal.fire({
      title: "Ítem eliminado",
      text: "El ítem ha sido borrado correctamente.",
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
    let errorMessage = 'Error al eliminar el ítem';
    
    if (error.response) {
      errorMessage = error.response.data?.msg || errorMessage;
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      // Manejo específico para items asignados/reservados
      if (error.response.status === 400 && error.response.data?.msg?.includes('asignado')) {
        errorMessage = `No se puede eliminar: ${error.response.data.msg}`;
      }
    }

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
    
    throw error;
  }
};