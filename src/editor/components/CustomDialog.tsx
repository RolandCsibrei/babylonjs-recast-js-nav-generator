import { useEffect } from "react";
import "./CustomDialog.css";

export interface CustomDialogButton {
  label: string;
  onClick?: () => void;
  closeOnClick?: boolean;
}

export interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  buttons: CustomDialogButton[];
}

export function CustomDialog({
  isOpen,
  onClose,
  title,
  text,
  buttons,
}: CustomDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function buttonClicked(b: CustomDialogButton) {
    if (b.closeOnClick) {
      onClose();
    }

    if (b.onClick) {
      b.onClick();
    }
  }

  return (
    <div className="custom-overlay">
      <div className="custom-dialog">
        <button className="custom-close-button" onClick={onClose}>
          ×
        </button>
        <div className="custom-header">
          <img
            src="/icons/icons8-yoda-48.svg"
            alt="Yoda"
            width="48"
            height="48"
            className="yoda"
          />
          <h3>{title}</h3>
        </div>
        <div className="custom-body">
          <p>{text}</p>
        </div>
        <div className="custom-buttons">
          {buttons.map((b, idx) => (
            <button
              key={idx}
              className="custom-button"
              onClick={() => buttonClicked(b)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
