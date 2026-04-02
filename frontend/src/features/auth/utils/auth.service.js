const AUTH_KEY = "neurovault-auth";

export const getAuth = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!getAuth();

export const setAuth = (user) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
};
