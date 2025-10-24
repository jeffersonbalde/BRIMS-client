// src/services/notificationService.js
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export const showRejectionModal = (userName) => {
  return new Promise((resolve) => {
    // Create modal elements
    const overlay = document.createElement('div');
    const modal = document.createElement('div');
    const textarea = document.createElement('textarea');
    const confirmBtn = document.createElement('button');
    const cancelBtn = document.createElement('button');
    
    // Overlay styles
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    
    // Modal styles
    modal.style.cssText = `
      background: var(--background-white);
      padding: 1.5rem;
      border-radius: 0.5rem;
      width: 500px;
      max-width: 95vw;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    `;
    
    // Textarea styles
    textarea.style.cssText = `
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--input-border);
      border-radius: 0.375rem;
      background-color: var(--input-bg);
      color: var(--input-text);
      resize: vertical;
      min-height: 120px;
      font-family: inherit;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    `;
    
    // Confirm button styles - FIXED CURSOR LOGIC
    confirmBtn.style.cssText = `
      background-color: #dc3545;
      border: 1px solid #dc3545;
      color: white;
      border-radius: 0.375rem;
      padding: 0.5rem 1.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      margin-left: 0.5rem;
      cursor: not-allowed; /* Start as disabled */
      opacity: 0.6;
    `;
    
    // Cancel button styles
    cancelBtn.style.cssText = `
      background-color: #6c757d;
      border: 1px solid #6c757d;
      color: white;
      border-radius: 0.375rem;
      padding: 0.5rem 1.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
    `;
    
    // Modal content
    modal.innerHTML = `
      <h5 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">
        Reject User
      </h5>
      <p style="margin: 0 0 1rem 0; color: var(--text-primary); line-height: 1.5;">
        You are about to reject <strong>${userName}</strong>. 
        Please provide a reason for rejection (minimum 10 characters).
      </p>
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary);">
        Rejection Reason <span style="color: #dc3545;">*</span>
      </label>
    `;
    
    textarea.placeholder = "Please provide a detailed reason for rejection...";
    modal.appendChild(textarea);
    
    modal.innerHTML += `
      <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
        Minimum 10 characters. This reason will be stored and may be used for communication with the user.
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
        <small style="color: var(--text-muted);" id="charCount">0/10 characters</small>
        <small style="color: var(--text-muted);" id="validationMessage"></small>
      </div>
    `;
    
    // Buttons container
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display: flex; justify-content: flex-end; margin-top: 1rem;';
    
    cancelBtn.textContent = 'Cancel';
    confirmBtn.textContent = 'Confirm Rejection';
    confirmBtn.disabled = true; // Start disabled
    
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(confirmBtn);
    modal.appendChild(buttonsDiv);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Character count element
    const charCount = modal.querySelector('#charCount');
    const validationMessage = modal.querySelector('#validationMessage');
    
    // Validation function - FIXED CURSOR LOGIC
    const validateInput = () => {
      const text = textarea.value.trim();
      const isValid = text.length >= 10;
      
      // Update character count
      charCount.textContent = `${text.length}/10 characters`;
      
      // Update validation message
      if (text.length === 0) {
        validationMessage.textContent = '';
        validationMessage.style.color = 'var(--text-muted)';
      } else if (text.length < 10) {
        validationMessage.textContent = 'Minimum 10 characters required';
        validationMessage.style.color = '#dc3545';
      } else {
        validationMessage.textContent = 'Valid reason';
        validationMessage.style.color = '#28a745';
      }
      
      // Update button state - FIXED CURSOR
      confirmBtn.disabled = !isValid;
      confirmBtn.style.opacity = isValid ? '1' : '0.6';
      confirmBtn.style.cursor = isValid ? 'pointer' : 'not-allowed'; // Dynamic cursor
    };
    
    // Event listeners
    textarea.addEventListener('input', validateInput);
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(null);
    });
    
    confirmBtn.addEventListener('click', () => {
      const reason = textarea.value.trim();
      if (reason.length >= 10) {
        document.body.removeChild(overlay);
        resolve(reason);
      }
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        resolve(null);
      }
    });
    
    // Enter key handler
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const reason = textarea.value.trim();
        if (reason.length >= 10) {
          document.body.removeChild(overlay);
          resolve(reason);
        }
      }
    });
    
    // Focus textarea and run initial validation
    setTimeout(() => {
      textarea.focus();
      validateInput(); // Initial validation
    }, 100);
  });
};


// SweetAlert2 configurations with green theme
export const showAlert = {
  // Success alert
  success: (title, text = "", timer = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#fff",
      color: "#2d5a27",
      iconColor: "#2d5a27",
    });
  },

  // Error alert
  error: (title, text = "", timer = 4000) => {
    return Swal.fire({
      title,
      text,
      icon: "error",
      timer,
      timerProgressBar: true,
      background: "#fff",
      color: "#2d5a27",
      confirmButtonColor: "#2d5a27",
      iconColor: "#dc3545",
    });
  },

  // Warning alert
  warning: (title, text = "", timer = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#fff",
      color: "#2d5a27",
      iconColor: "#ffc107",
    });
  },

  // Info alert - WITH AVATAR & TOP CLOSE BUTTON
  info: (
    title,
    htmlContent = "",
    confirmButtonText = "Close",
    timer = null,
    showCloseButton = true
  ) => {
    return Swal.fire({
      title,
      html: htmlContent,
      icon: null, // Remove default icon
      timer: timer,
      timerProgressBar: !!timer,
      showConfirmButton: true,
      confirmButtonText,
      confirmButtonColor: "#2d5a27",
      background: "#fff",
      color: "#2d5a27",
      width: "450px",
      maxWidth: "95vw",
      padding: "1rem",
      backdrop: true,
      showCloseButton: showCloseButton, // Enable close button
      closeButtonHtml: "&times;", // Custom close button
      customClass: {
        container: "swal2-high-zindex",
        popup: "swal2-avatar-popup",
        title: "swal2-avatar-title",
        htmlContainer: "swal2-avatar-html",
        closeButton: "swal2-close-top", // Custom class for close button
      },
      didOpen: () => {
        const container = document.querySelector(".swal2-container");
        const popup = document.querySelector(".swal2-popup");
        if (container) container.style.zIndex = "99999";
        if (popup) popup.style.zIndex = "100000";
      },
    });
  },

  // Confirmation dialog
  confirm: (
    title,
    text = "",
    confirmButtonText = "Yes",
    cancelButtonText = "Cancel"
  ) => {
    return Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2d5a27",
      cancelButtonColor: "#6c757d",
      confirmButtonText,
      cancelButtonText,
      background: "#fff",
      color: "#2d5a27",
      iconColor: "#2d5a27",
    });
  },

  // Loading alert
  loading: (title = "Loading...") => {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      background: "#fff",
      color: "#2d5a27",
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  // Close any open alert
  close: () => {
    Swal.close();
  },

  // Custom HTML alert for detailed content
  html: (title, htmlContent, confirmButtonText = "Close", width = 600) => {
    return Swal.fire({
      title,
      html: htmlContent,
      icon: "info",
      showConfirmButton: true,
      confirmButtonText,
      confirmButtonColor: "#2d5a27",
      background: "#fff",
      color: "#2d5a27",
      iconColor: "#17a2b8",
      width: `${width}px`,
    });
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
        background: "#f8fff9",
        color: "#2d5a27",
        border: "1px solid #d4edda",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#2d5a27",
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
        background: "#fff5f5",
        color: "#dc3545",
        border: "1px solid #f8d7da",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#dc3545",
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
        background: "#fffbf0",
        color: "#856404",
        border: "1px solid #ffeaa7",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#ffc107",
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
        background: "#f0f9ff",
        color: "#2d5a27",
        border: "1px solid #e8f0ec",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#2d5a27",
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
        background: "#f8f9fa",
        color: "#2d5a27",
        border: "1px solid #e8f0ec",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#2d5a27",
      },
    });
  },
};

// Export ToastContainer for use in App.jsx
export { ToastContainer } from "react-toastify";
