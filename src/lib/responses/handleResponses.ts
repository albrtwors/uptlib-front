import { SwalAlert } from "../swal/swal";

export const handleResponses = (response: any) => {
    if (response.error) {
        SwalAlert.fire({
            title: 'Error',
            text: response.message[0] || 'OCurrio un error',
            icon: 'error'
        });
        return false
    } else {
        console.log('Libro creado:', response.data);
        SwalAlert.fire({
            title: '¡Éxito!',
            text: response.message,
            icon: 'success'
        });
        return true
    }
}