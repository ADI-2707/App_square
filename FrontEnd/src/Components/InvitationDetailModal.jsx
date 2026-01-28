import React from "react";
import ModalPortal from "../Utility/ModalPortal";
import { Check, X } from "lucide-react";

const InvitationDetailModal = ({
  isOpen,
  onClose,
  invitation,
  onAccept,
  onReject,
  isLoading,
}) => {
  if (!isOpen || !invitation) return null;

  const invitedDate = new Date(invitation.invited_at).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content invitation-modal-compact" onClick={(e) => e.stopPropagation()}>

          <div className="invitation-compact-header">
            <h2>Project Invitation</h2>
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="invitation-compact-body">
            <div className="invitation-project-main">
              {invitation.project_name}
            </div>

            <div className="invitation-compact-inviter">
              <div className="inviter-avatar-small">
                {invitation.invited_by_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="inviter-name-small">{invitation.invited_by_name}</div>
                <div className="inviter-email-small">{invitation.invited_by_email}</div>
              </div>
            </div>

            <div className="invitation-compact-info">
              <div className="info-item">
                <span className="info-label">Date</span>
                <span className="info-value">{invitedDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="role-badge-small">
                  {invitation.role?.charAt(0).toUpperCase() +
                    invitation.role?.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="invitation-compact-footer">
            <button
              className="btn-decline-compact"
              onClick={onReject}
              disabled={isLoading}
            >
              <X size={18} />
              Decline
            </button>
            <button
              className="btn-accept-compact"
              onClick={onAccept}
              disabled={isLoading}
            >
              <Check size={18} />
              {isLoading ? "Processing..." : "Accept"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default InvitationDetailModal;