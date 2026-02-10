export const getInitialTheme = () => {
  const saved = localStorage.getItem("mode");
  if (saved === "dark" || saved === "light") {
    return saved;
  }

  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  return prefersDark ? "dark" : "light";
};

export const applyTheme = (mode) => {
  document.documentElement.setAttribute("dark-mode", mode);
  localStorage.setItem("mode", mode);
};