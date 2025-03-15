import toast from 'react-hot-toast';

// Success toast with custom message
export const showSuccessToast = (message) => {
  toast.success(message, {
    className: 'cyber-toast',
    iconTheme: {
      primary: 'var(--success)',
      secondary: 'var(--gray-900)',
    },
  });
};

// Error toast with custom message
export const showErrorToast = (message) => {
  toast.error(message, {
    className: 'cyber-toast',
    iconTheme: {
      primary: 'var(--danger)',
      secondary: 'var(--gray-900)',
    },
    duration: 4000,
  });
};

// Info toast with custom message
export const showInfoToast = (message) => {
  toast(message, {
    icon: '🔍',
    className: 'cyber-toast',
    style: {
      border: '1px solid var(--primary)',
    },
  });
};

// Warning toast with custom message
export const showWarningToast = (message) => {
  toast(message, {
    icon: '⚠️',
    className: 'cyber-toast',
    style: {
      border: '1px solid var(--warning)',
    },
    duration: 4000,
  });
};

// Loading toast that can be dismissed programmatically
export const showLoadingToast = (message) => {
  return toast.loading(message, {
    className: 'cyber-toast',
    iconTheme: {
      primary: 'var(--primary)',
      secondary: 'var(--gray-900)',
    },
  });
};

// Dismiss a specific toast by its ID
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Custom toast for security alerts
export const showSecurityAlertToast = (message, severity = 'medium') => {
  const severityStyles = {
    low: {
      icon: '🟢',
      border: '1px solid var(--success)',
    },
    medium: {
      icon: '🟠',
      border: '1px solid var(--warning)',
    },
    high: {
      icon: '🔴',
      border: '1px solid var(--danger)',
    },
    critical: {
      icon: '⛔',
      border: '2px solid var(--danger)',
    },
  };
  
  const style = severityStyles[severity] || severityStyles.medium;
  
  toast(message, {
    icon: style.icon,
    className: 'cyber-toast',
    style: {
      border: style.border,
    },
    duration: severity === 'critical' ? 6000 : 4000,
  });
};

// Custom toast for copy to clipboard
export const showCopyToast = (message = 'Copied to clipboard!') => {
  toast(message, {
    icon: '📋',
    className: 'cyber-toast',
    style: {
      border: '1px solid var(--primary)',
    },
    duration: 2000,
  });
}; 