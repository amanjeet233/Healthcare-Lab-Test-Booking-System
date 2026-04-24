import { useState, useEffect } from 'react';
import './ErrorAlert.css';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function ErrorAlert({
  message,
  onClose,
  duration = 5000
}: ErrorAlertProps) {
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
    <div className="error-alert">
      <div className="error-icon">⚠️</div>
      <div className="error-message">{message}</div>
      <button
        className="error-close"
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
