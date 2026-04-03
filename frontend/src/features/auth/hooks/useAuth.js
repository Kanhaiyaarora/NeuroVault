import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, signupAsync, logout } from "../auth.slice";
import { setAuth, clearAuth, getAuth } from "../utils/auth.service";

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);

  const handleLogin = useCallback(
    async (email, password) => {
      const result = await dispatch(loginAsync({ email, password }));
      if (result.meta.requestStatus === "fulfilled") {
        setAuth(result.payload);
      }
      return result;
    },
    [dispatch],
  );

  const handleSignup = useCallback(
    async (username, email, password) => {
      const result = await dispatch(signupAsync({ username, email, password }));
      if (result.meta.requestStatus === "fulfilled") {
        setAuth(result.payload);
      }
      return result;
    },
    [dispatch],
  );

  const handleLogout = useCallback(() => {
    clearAuth();
    dispatch(logout());
  }, [dispatch]);

  const isAuthenticated = !!(user || getAuth());

  return {
    user,
    status,
    error,
    isAuthenticated,
    handleLogin,
    handleSignup,
    handleLogout,
  };
};
