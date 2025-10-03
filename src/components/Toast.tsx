import { useEffect } from 'react';
import { Toast as BSToast } from 'react-bootstrap';

type ToastProps = {
  show: boolean;
  message: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
  onClose: () => void;
  delay?: number;
};

export default function Toast({
  show,
  message,
  variant = 'success',
  onClose,
  delay = 3000
}: ToastProps) {
  useEffect(() => {
    if (show && delay) {
      const timer = setTimeout(onClose, delay);
      return () => clearTimeout(timer);
    }
  }, [show, delay, onClose]);

  return (
    <div className="toast-container">
      <BSToast show={show} onClose={onClose} className={`custom-toast toast-${variant}`}>
        <BSToast.Body className="d-flex align-items-center justify-content-between">
          <span>{message}</span>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </BSToast.Body>
      </BSToast>
    </div>
  );
}

