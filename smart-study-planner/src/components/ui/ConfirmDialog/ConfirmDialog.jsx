import React from 'react';
import { AiOutlineWarning } from 'react-icons/ai';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import './ConfirmDialog.css';

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title   = 'Are you sure?',
  message = 'This action cannot be undone.',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="confirm-dialog__icon">
        <AiOutlineWarning size={26} />
      </div>
      <h3 className="confirm-dialog__title">{title}</h3>
      <p className="confirm-dialog__message">{message}</p>
      <div className="confirm-dialog__actions">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
