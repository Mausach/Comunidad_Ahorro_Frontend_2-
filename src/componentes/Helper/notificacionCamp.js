import Swal from "sweetalert2";
import authApi from "../../api/authApi"; // Asegúrate de que la ruta sea correcta

export const verificarNotificacionesNavbar = async (setNotificacion, navigate) => {
  try {
    const resp = await authApi.get('/notifi/camp'); // Ajusta la ruta según tu backend

    // Verificar si la respuesta tiene el formato esperado
    if (resp.data?.notificacion !== undefined) {
      setNotificacion(resp.data.notificacion); // Actualiza el estado con el código de notificación
    } else {
      console.error('Formato de respuesta inesperado:', resp.data);
    }

  } catch (error) {
    const errores = error.response?.data?.errors;

    // Mostrar errores con SweetAlert (como en tu ejemplo)
    if (errores) {
      const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al verificar notificaciones';
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
      const errorMessage = error.response?.data?.msg || 'Error al verificar notificaciones';
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

    // Redirigir si el token expiró (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }
};