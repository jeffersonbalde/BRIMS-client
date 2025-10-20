// src/services/notificationService.js
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

// SweetAlert2 configurations with green theme
export const showAlert = {
  // Success alert
  success: (title, text = '', timer = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#fff',
      color: '#2d5a27',
      iconColor: '#2d5a27',
    });
  },

  // Error alert
  error: (title, text = '', timer = 4000) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      timer,
      timerProgressBar: true,
      background: '#fff',
      color: '#2d5a27',
      confirmButtonColor: '#2d5a27',
      iconColor: '#dc3545',
    });
  },

  // Warning alert
  warning: (title, text = '', timer = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#fff',
      color: '#2d5a27',
      iconColor: '#ffc107',
    });
  },

  // Info alert
  info: (title, text = '', timer = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#fff',
      color: '#2d5a27',
      iconColor: '#17a2b8',
    });
  },

  // Confirmation dialog
  confirm: (title, text = '', confirmButtonText = 'Yes', cancelButtonText = 'Cancel') => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2d5a27',
      cancelButtonColor: '#6c757d',
      confirmButtonText,
      cancelButtonText,
      background: '#fff',
      color: '#2d5a27',
      iconColor: '#2d5a27',
    });
  },

  // Loading alert
  loading: (title = 'Loading...') => {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      background: '#fff',
      color: '#2d5a27',
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  // Close any open alert
  close: () => {
    Swal.close();
  },
};

// Toastify configurations with green theme
export const showToast = {
  // Success toast
  success: (message, autoClose = 3000) => {
    toast.success(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: '#f8fff9',
        color: '#2d5a27',
        border: '1px solid #d4edda',
        borderRadius: '8px',
        fontWeight: '500',
      },
      progressStyle: {
        background: '#2d5a27',
      },
    });
  },

  // Error toast
  error: (message, autoClose = 4000) => {
    toast.error(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: '#fff5f5',
        color: '#dc3545',
        border: '1px solid #f8d7da',
        borderRadius: '8px',
        fontWeight: '500',
      },
      progressStyle: {
        background: '#dc3545',
      },
    });
  },

  // Warning toast
  warning: (message, autoClose = 3000) => {
    toast.warn(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: '#fffbf0',
        color: '#856404',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        fontWeight: '500',
      },
      progressStyle: {
        background: '#ffc107',
      },
    });
  },

  // Info toast
  info: (message, autoClose = 3000) => {
    toast.info(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: '#f0f9ff',
        color: '#2d5a27',
        border: '1px solid #e8f0ec',
        borderRadius: '8px',
        fontWeight: '500',
      },
      progressStyle: {
        background: '#2d5a27',
      },
    });
  },

  // Default toast
  default: (message, autoClose = 3000) => {
    toast(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: '#f8f9fa',
        color: '#2d5a27',
        border: '1px solid #e8f0ec',
        borderRadius: '8px',
        fontWeight: '500',
      },
      progressStyle: {
        background: '#2d5a27',
      },
    });
  },
};

// Export ToastContainer for use in App.jsx
export { ToastContainer } from 'react-toastify';