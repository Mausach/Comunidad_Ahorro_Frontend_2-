import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starEditItem = async (newItems, setRefreshData, navigate) => {
  try {
    const resp = await authApi.put('/inventario/edit_item-stock', newItems);

    Swal.fire({
      title: "Ítems editado",
      text: "El ítem del stock ha sido editado.",
      icon: "success",
      background: "#f9f9f9",
      confirmButtonColor: "#ffc107",
      customClass: {
        title: "swal2-title-custom",
        content: "swal2-content-custom",
        confirmButton: "swal2-confirm-custom",
      },
    });
    
    setRefreshData(true); // Refrescar los datos
  } catch (error) {
    const errores = error.response?.data?.errors;
    console.log("Respuesta backend:", error);
    if (errores) {
      const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al editar el ítems';
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
      const errorMessage = error.response?.data?.msg || 'Error al editar el ítems';
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
  }
};