import Swal from 'sweetalert2'
export class SwalAlert {
    static fire(options: { title: string; text: string; icon: "success" | "error" | "warning" | "info" }) {
        return Swal.fire({
            customClass: {
                container: 'modal'
            },
            title: options.title,
            text: options.text,
            icon: options.icon,
            confirmButtonText: 'Aceptar',
        })
    }

    static confirm(title: string, text: string): Promise<boolean> {
        return Swal.fire({
            customClass: {
                container: 'modal'
            },
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        }).then((result) => !!result.isConfirmed)
    }

    static loading() {
        Swal.fire({
            customClass: {
                container: 'modal'
            },
            title: 'Cargando...',
            text: 'Por favor, espere un momento.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
}