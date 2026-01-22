export const isAuthenticated = () => {
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  return !!access && !!refresh;
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.clear();
};