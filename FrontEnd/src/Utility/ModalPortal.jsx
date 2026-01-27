import { createPortal } from "react-dom";
import { useEffect } from "react";

const modalRoot = document.getElementById("modal-root");

const ModalPortal = ({ children }) => {
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  return createPortal(children, modalRoot);
};

export default ModalPortal;