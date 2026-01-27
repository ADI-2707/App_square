import React, { useState } from "react";
import { AlertTriangle, Loader } from "lucide-react";
import ModalPortal from "../../Utility/ModalPortal";
import api from "../../Utility/api";

const DeleteProjectModal = ({ project, onClose, onDeleted }) => {
  const [step, setStep] = useState("confirm"); // "confirm" | "pin"
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmDelete = () => {
    setStep("pin");
    setError("");
  };

  const handleDeleteWithPin = async () => {
    if (!pin.trim()) {
      setError("Please enter the PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Attempting to delete project with ID:", project.id);
      console.log("API endpoint: /api/projects/" + project.id + "/delete/");
      
      const response = await api({
        method: "delete",
        url: `/api/projects/${project.id}/delete/`,
        data: { pin }
      });
      
      console.log("Delete successful:", response);

      // Show success message briefly before closing
      setTimeout(() => {
        onDeleted();
        onClose();
      }, 500);
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg =
        err.response?.data?.detail || "Failed to delete project";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (step === "pin") {
      setStep("confirm");
      setPin("");
      setError("");
    } else {
      onClose();
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={handleCancel}>
        <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
          {step === "confirm" ? (
            <>
              <div className="modal-header delete-confirm-header">
                <AlertTriangle size={24} color="#ef4444" />
                <h2>Delete Project?</h2>
              </div>

              <div className="modal-body">
                <p className="delete-warning">
                  Are you sure you want to delete <strong>{project.name}</strong>?
                </p>
                <p className="delete-info">
                  This action <strong>cannot be undone</strong>. All recipes, combinations, and project data will be permanently deleted.
                </p>
              </div>

              <div className="modal-footer delete-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Yes, Delete Project
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="modal-header delete-confirm-header">
                <AlertTriangle size={24} color="#ef4444" />
                <h2>Verify PIN to Delete</h2>
              </div>

              <div className="modal-body">
                <p className="delete-warning">
                  Enter the project PIN created during project setup to confirm deletion.
                </p>

                <form onSubmit={(e) => { e.preventDefault(); handleDeleteWithPin(); }}>
                  <div className="form-group">
                    <label htmlFor="pin-input">Project PIN</label>
                    <input
                      id="pin-input"
                      type="password"
                      className="form-input"
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value);
                        setError("");
                      }}
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="error-message">
                      <span>❌ {error}</span>
                    </div>
                  )}
                </form>
              </div>

              <div className="modal-footer delete-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteWithPin}
                  disabled={loading || !pin.trim()}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="spinner" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};

export default DeleteProjectModal;
