import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starDropItem = async (newItems, setRefreshData, navigate) => {
  try {
    const resp = await authApi.put('/prod/drop-stock', newItems);

    Swal.fire({
      title: "Ítems eliminado",
      text: "El ítem ha sido borrado del stock.",
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
    console.log("Respuesta backend:", resp.data);
    if (errores) {
      const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al borrar el ítems';
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
      const errorMessage = error.response?.data?.msg || 'Error al borrar el ítems';
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