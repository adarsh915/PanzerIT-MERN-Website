import { useState } from 'react'

type DeleteItem = {
  id: string
  name: string
}

export const useConfirmDelete = () => {
  const [showModal, setShowModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = (id: string, name: string) => {
    setItemToDelete({ id, name })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setItemToDelete(null)
    setIsDeleting(false)
  }

  return {
    showModal,
    itemToDelete,
    isDeleting,
    setIsDeleting,
    confirmDelete,
    closeModal,
  }
}
