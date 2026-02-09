import { X } from "lucide-react";
import ModalPortal from "../../Utility/ModalPortal";

const ProjectInfoModal = ({ project, onClose }) => {
  return (
    <ModalPortal>
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal-card large project-info-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="project-info-header">
            <h3>Project Information</h3>
            <button className="project-info-close" onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="project-info-body">
            <div className="project-info-grid">
              <div className="project-info-item">
                <span className="label">Project Name</span>
                <span className="value">{project.name}</span>
              </div>

              <div className="project-info-item">
                <span className="label">Public Code</span>
                <span className="value">{project.public_code}</span>
              </div>

              <div className="project-info-item">
                <span className="label">Role</span>
                <span className="value">{project.role}</span>
              </div>

              <div className="project-info-item">
                <span className="label">Created At</span>
                <span className="value">
                  {new Date(project.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* <div className="project-info-divider" />

             <div className="project-info-actions">
              <button className="button secondary">Manage Members</button>
              <button className="button danger">Archive Project</button>
            </div>  */}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ProjectInfoModal;