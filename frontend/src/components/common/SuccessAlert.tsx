import { useState, useEffect } from 'react';
import './SuccessAlert.css';

interface SuccessAlertProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function SuccessAlert({
  message,
  onClose,
  duration = 3000
}: SuccessAlertProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!show) return null;

  return (
    <div className="success-alert">
      <div className="success-icon">✓</div>
      <div className="success-message">{message}</div>
      <button
        className="success-close"
        onClick={() => {
          setShow(false);
          onClose?.();
        }}
      >
        ✕
      </button>
    </div>
  );
}
