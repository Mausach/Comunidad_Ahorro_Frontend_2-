import Swal from "sweetalert2";
import authApi from "../../../api/authApi"; // Asegúrate de que la ruta sea correcta

export const CargarCuotasHoyPactadas = async (setCuotasHoy, setVentasPactadas, navigate) => {
  try {
    const resp = await authApi.get('/notifi/cuotas-dia-pac'); // Petición al backend

    // Validar la estructura de la respuesta
    if (resp.data.ok && Array.isArray(resp.data.cuotasImpagasHoy) && Array.isArray(resp.data.ventasConCuotaPactadaPagada)) {
      setCuotasHoy(resp.data.cuotasImpagasHoy);
      setVentasPactadas(resp.data.ventasConCuotaPactadaPagada);
    } else {
      console.error('La respuesta no tiene el formato esperado:', resp.data);
      Swal.fire({
        title: "ERROR",
        text: "Formato de datos incorrecto del servidor",
        icon: "error",
        background: "#f9f9f9",
        confirmButtonColor: "#ffc107",
      });
    }
  } catch (error) {
    // Manejo de errores (similar a tu ejemplo)
    const errores = error.response?.data?.errors;

    if (errores) {
      const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al cargar cuotas';
      Swal.fire({
        title: "ERROR",
        text: mensajeDeError,
        icon: "error",
        background: "#f9f9f9",
        confirmButtonColor: "#ffc107",
      });
    } else {
      const errorMessage = error.response?.data?.msg || 'Error al cargar cuotas pactadas';
      Swal.fire({
        title: "ERROR",
        text: errorMessage,
        icon: "error",
        background: "#f9f9f9",
        confirmButtonColor: "#ffc107",
      });
    }

    // Redirigir si el token expiró (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }
};