import Swal from "sweetalert2";
import authApi from "../../../api/authApi";


export const starAceptarRendCob = async (rendicion,setRefreshData, navigate) => {
    try {
        const resp = await authApi.put('/rend/acept-rend-cob', {_id: rendicion._id});
        

        Swal.fire({
            title: "Rendicion aceptada",
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

          localStorage.setItem('refresh_productos', 'true');
        
          setRefreshData(true)

    } catch (error) {
       // Asegúrate de acceder correctamente a los errores
       const errores = error.response?.data?.errors; // Obtén todos los errores
      console.log(error)
       // Si tienes errores, muestra el mensaje de uno de los campos
       if (errores) {
           // Obtener el primer mensaje de error (puedes personalizar esto según el comportamiento)
           const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al aceptar la rendicion de venta';
           console.log(mensajeDeError);

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
           // Si no hay errores, usar el mensaje genérico
           const errorMessage = error.response?.data?.msg || 'Error al aceptar la rendicion de venta';
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

       // Verificar si el error es una sesión expirada (401) y redirigir al login
       if (error.response?.status === 401) {
           localStorage.removeItem('token');
           navigate('/login');
       }
  
        
    }

}