import { SwalAlert } from "../swal/swal";

export const handleResponses = (response: any) => {
    if (response.error || response.statusCode >= 400) {

        SwalAlert.fire({
            title: 'Error',
            text: typeof (response.message) === 'string' ? response.message : (response.message[0] || 'Ocurrio un error'),
            icon: 'error'
        });
        return false
    } else {
        console.log(response)
        SwalAlert.fire({
            title: '¡Éxito!',
            text: response.message,
            icon: 'success'
        });
        return true
    }
}