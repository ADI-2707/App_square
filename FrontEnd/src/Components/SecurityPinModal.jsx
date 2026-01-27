import React, { useEffect } from "react";
import { ShieldAlert, Copy } from "lucide-react";
import ModalPortal from "../Utility/ModalPortal";

const SecurityPinModal = ({ pin, onConfirm }) => {
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const copyPin = async () => {
    await navigator.clipboard.writeText(pin);
  };

  return (
    <ModalPortal>
    <div className="modal-backdrop pin-backdrop">
      <div className="modal-card pin-modal animate-pin">
        <div className="pin-icon">
          <ShieldAlert size={28} />
        </div>

        <h2 className="pin-title">Project Security PIN</h2>

        <p className="pin-warning">
          This PIN will be shown <strong>only once</strong>.
          Please store it securely.
        </p>

        <div className="pin-box">
          <code>{pin}</code>
          <button
            className="pin-copy-btn"
            onClick={copyPin}
            title="Copy PIN"
          >
            <Copy size={16} />
          </button>
        </div>

        <ul className="pin-usage">
          <li>Delete project</li>
          <li>Change admins</li>
          <li>Critical security actions</li>
        </ul>

        <button className="primary-btn pin-confirm" onClick={onConfirm}>
          I have saved this PIN
        </button>
      </div>
    </div>
    </ModalPortal>
  );
};

export default SecurityPinModal;