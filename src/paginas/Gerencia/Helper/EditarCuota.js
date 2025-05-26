import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starEditarCuota = async (newItems, setRefreshData, navigate) => {
  try {
    const resp = await authApi.put('/cobro/cuotas/editar-monto', newItems);

    Swal.fire({
      title: "Operación exitosa",
      text: "La cuota fue editada.",
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
    
    if (errores) {
      const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al editar cuota';
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
      const errorMessage = error.response?.data?.msg || 'Error al editar cuota';
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