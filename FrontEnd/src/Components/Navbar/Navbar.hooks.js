import { useEffect, useState } from "react";
import api from "../../Utility/api";

export function useNavbarEffects(loggedIn) {
  const [mounted, setMounted] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState(0);

  useEffect(() => {
    const animated = sessionStorage.getItem("navbar-animated");
    if (!animated) {
      requestAnimationFrame(() => {
        setMounted(true);
        sessionStorage.setItem("navbar-animated", "true");
      });
    } else {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    const fetchPendingInvitations = async () => {
      try {
        const res = await api.get("/api/projects/invitations/pending/");
        setPendingInvitations(res.data.results.length || 0);
      } catch (e) {
        console.error("Failed to fetch invitations", e);
      }
    };

    fetchPendingInvitations();
    const id = setInterval(fetchPendingInvitations, 10000);
    return () => clearInterval(id);
  }, [loggedIn]);

  return { mounted, pendingInvitations };
}