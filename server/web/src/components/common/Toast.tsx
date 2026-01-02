import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose?: () => void;
}

const toastConfig = {
  success: {
    alertClass: 'alert-success',
    icon: CheckCircle,
  },
  error: {
    alertClass: 'alert-error',
    icon: AlertCircle,
  },
  info: {
    alertClass: 'alert-info',
    icon: Info,
  },
  warning: {
    alertClass: 'alert-warning',
    icon: AlertCircle,
  },
};

export default function Toast({ type, message, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn('alert shadow-lg mb-2', config.alertClass)}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
