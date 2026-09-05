'use client'

import { Modal } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type ConfirmDeleteModalProps = {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  itemName?: string
  confirmText?: string
  cancelText?: string
  isDeleting?: boolean
}

const ConfirmDeleteModal = ({
  show,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item?',
  itemName,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  isDeleting = false,
}: ConfirmDeleteModalProps) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body className="p-4">
        <div className="text-center">
          <div 
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fee2e2',
            }}
          >
            <IconifyIcon 
              icon="tabler:alert-triangle" 
              className="fs-1 text-danger"
            />
          </div>
          
          <h4 className="mb-2">{title}</h4>
          
          <p className="text-muted mb-1">{message}</p>
          
          {itemName && (
            <p className="fw-bold text-dark mb-3">"{itemName}"</p>
          )}
          
          <p className="text-muted small mb-4">
            This action cannot be undone.
          </p>
          
          <div className="d-flex gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-light px-4"
              onClick={onClose}
              disabled={isDeleting}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="btn btn-danger px-4"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <IconifyIcon icon="tabler:loader-2" className="spinner-border spinner-border-sm me-1" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconifyIcon icon="tabler:trash" className="me-1" />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ConfirmDeleteModal
