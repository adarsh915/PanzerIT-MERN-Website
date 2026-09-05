import Swal from 'sweetalert2'

type ConfirmDeleteOptions = {
  title?: string
  text?: string
  itemName?: string
  confirmButtonText?: string
  cancelButtonText?: string
}

export const confirmDelete = async (options: ConfirmDeleteOptions = {}): Promise<boolean> => {
  const {
    title = 'Are you sure?',
    text = 'This action cannot be undone.',
    itemName,
    confirmButtonText = 'Yes, delete it!',
    cancelButtonText = 'Cancel',
  } = options

  const result = await Swal.fire({
    title,
    html: itemName 
      ? `${text}<br><br><strong style="color: #1f2937;">"${itemName}"</strong>` 
      : text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'swal2-popup-custom',
      title: 'swal2-title-custom',
      htmlContainer: 'swal2-html-custom',
    },
  })

  return result.isConfirmed
}

export const confirmDeleteWithName = async (name: string): Promise<boolean> => {
  return confirmDelete({
    title: 'Delete Item?',
    text: 'Are you sure you want to delete',
    itemName: name,
  })
}
