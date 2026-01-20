import Swal from 'sweetalert2';
import { ToastType } from '@shared/types';

// SweetAlert2 configuration with iOS safe area support
const defaultSwalConfig = {
  toast: true,
  position: 'top' as const,
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast: any) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
    
    // iOS safe area support
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && toast) {
      const container = toast.parentElement;
      if (container) {
        container.style.paddingTop = 'max(1.5rem, env(safe-area-inset-top))';
      }
    }
  },
  customClass: {
    container: 'swal2-container',
    popup: 'swal2-popup',
    header: 'swal2-header',
    title: 'swal2-title',
    content: 'swal2-content',
    actions: 'swal2-actions',
    confirmButton: 'swal2-confirm',
    cancelButton: 'swal2-cancel',
    footer: 'swal2-footer'
  }
};

// Initialize SweetAlert2 with default config
Swal.mixin(defaultSwalConfig);

export const showSweetAlert = {
  success: (message: string, options?: any) => {
    return Swal.fire({
      icon: 'success',
      title: message,
      ...options
    });
  },
  
  error: (message: string, options?: any) => {
    return Swal.fire({
      icon: 'error',
      title: message,
      ...options
    });
  },
  
  info: (message: string, options?: any) => {
    return Swal.fire({
      icon: 'info',
      title: message,
      ...options
    });
  },
  
  warning: (message: string, options?: any) => {
    return Swal.fire({
      icon: 'warning',
      title: message,
      ...options
    });
  },
  
  confirm: (message: string, options?: any) => {
    return Swal.fire({
      icon: 'question',
      title: message,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      // iOS-specific positioning
      position: 'center',
      padding: '2rem',
      // Custom CSS for iOS safe areas
      customClass: {
        popup: 'swal2-popup-ios-safe',
        container: 'swal2-container-ios-safe'
      },
      // iOS safe area handling
      didOpen: (popup: any) => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && popup) {
          const container = popup.parentElement;
          if (container) {
            container.style.paddingTop = 'max(2rem, env(safe-area-inset-top))';
            container.style.paddingBottom = 'max(2rem, env(safe-area-inset-bottom))';
          }
        }
      },
      ...options
    });
  },
  
  delete: (message: string, options?: any) => {
    return Swal.fire({
      icon: 'warning',
      title: message,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      // iOS-specific positioning
      position: 'center',
      padding: '2rem',
      // Custom CSS for iOS safe areas
      customClass: {
        popup: 'swal2-popup-ios-safe',
        container: 'swal2-container-ios-safe'
      },
      // iOS safe area handling
      didOpen: (popup: any) => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && popup) {
          const container = popup.parentElement;
          if (container) {
            container.style.paddingTop = 'max(2rem, env(safe-area-inset-top))';
            container.style.paddingBottom = 'max(2rem, env(safe-area-inset-bottom))';
          }
        }
      },
      ...options
    });
  },
  
  loading: (message: string, options?: any) => {
    return Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      ...options
    });
  },
  
  close: () => {
    Swal.close();
  }
};

// Convert toast type to SweetAlert icon
const getIconFromToastType = (type: ToastType): 'success' | 'error' | 'warning' | 'info' => {
  switch (type) {
    case 'success': return 'success';
    case 'error': return 'error';
    case 'info': return 'info';
    default: return 'info';
  }
};

// Legacy showToast function for backward compatibility
export const showToast = (message: string, type: ToastType, options?: any) => {
  const icon = getIconFromToastType(type);
  return showSweetAlert[icon](message, {
    toast: true,
    position: 'top',
    timer: 3000,
    timerProgressBar: true,
    ...options
  });
};
