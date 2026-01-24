import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";

const PinVerificationModal = ({ onConfirm, onCancel }) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm(pin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: "400px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <ShieldAlert size={24} style={{ color: "var(--text-color)" }} />
          <h3 style={{ margin: 0 }}>Verify Security PIN</h3>
        </div>

        <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "14px" }}>
          Enter your project security PIN to confirm this action.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Security PIN</label>
            <input
              type="password"
              placeholder="Enter your security PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="modal-actions" style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="button secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button"
              disabled={loading || !pin.trim()}
            >
              {loading ? "Verifying..." : "Verify & Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinVerificationModal;
