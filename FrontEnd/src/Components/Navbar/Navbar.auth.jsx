import React from "react";

const NavbarAuth = ({
  loggedIn,
  isInProject,
  hasProjectAccess,
  openCreateProject,
  userInitial,
  pendingInvitations,
  navigate,
}) => {
  if (!loggedIn) {
    return (
      <>
        <button className="button" onClick={() => navigate("/login")}>Login</button>
        <button className="button" onClick={() => navigate("/signup")}>Sign Up</button>
      </>
    );
  }

  return (
    <>
      {isInProject ? (
        <button
          className="button"
          onClick={() =>
            window.dispatchEvent(new Event("open-project-info"))
          }
        >
          Info
        </button>
      ) : (
        <button className="button" onClick={openCreateProject}>
          {hasProjectAccess ? "Add Project" : "Create Project"}
        </button>
      )}

      <button className="user-avatar" onClick={() => navigate("/account")}>
        {userInitial}
        {pendingInvitations > 0 && <span className="notification-badge" />}
      </button>
    </>
  );
};

export default NavbarAuth;