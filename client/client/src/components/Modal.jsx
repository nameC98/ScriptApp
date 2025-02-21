import { useEffect } from "react";
import ReactDOM from "react-dom";

function Modal({ children, onClose, customClass = "max-w-lg" }) {
  // Close the modal when the Escape key is pressed
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Get the modal root element, or fallback to document.body
  const modalRoot = document.getElementById("modal-root") || document.body;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 w-full ${customClass} mx-4 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    modalRoot
  );
}

export default Modal;
