import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as loginApi,
  logout as logoutApi,
  me,
  register as registerApi,
  updateProfile as updateProfileApi,
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const data = await loginApi(payload);
        setUser(data.user);
        return data;
      },
      async register(payload) {
        const data = await registerApi(payload);
        setUser(data.user);
        return data;
      },
      async updateProfile(payload) {
        const data = await updateProfileApi(payload);
        setUser(data.user);
        return data;
      },
      async logout() {
        await logoutApi();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
