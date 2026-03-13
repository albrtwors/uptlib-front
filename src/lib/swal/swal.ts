import Swal from 'sweetalert2'
export class SwalAlert {
    static fire(options: { title: string; text: string; icon: "success" | "error" | "warning" | "info" }) {
        Swal.fire({
            customClass: {
                container: 'modal'
            },

            title: options.title,
            text: options.text,
            icon: options.icon,
            confirmButtonText: 'Aceptar',
        })
    }
}