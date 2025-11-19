import Swal from 'sweetalert2';

export async function confirm(title = 'Confirm', text = '') {
  const res = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar',
  });
  return res.isConfirmed;
}
