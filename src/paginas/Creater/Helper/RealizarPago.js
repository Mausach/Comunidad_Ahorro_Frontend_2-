import Swal from "sweetalert2";
import authApi from "../../../api/authApi";


export const realizarPago = async (usuarioId, monto,responsable,setRefreshData, navigate) => {
    try {
        const resp = await authApi.post('/admin/realizar-pago', {usuarioId, monto,responsable});

        Swal.fire({
            title: "Pago realizado",
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
        
          setRefreshData(true)

    } catch (error) {
        console.log(error.response.data.errors);
        const errorMessage = error.response?.data?.msg || 'Error al editar el usuario';
    
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
  
        
    }

}