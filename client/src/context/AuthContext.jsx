import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import api from "../lib/axios";
import { connectSocket } from "../lib/socket";
import { normalizeError } from "../lib/errors";

const AuthContext = createContext(null);

function syncErrorMessage(err) {
  if (err.response?.status === 500 && err.response.data?.error === "Firebase Admin not configured") {
    return "Server auth isn't configured yet. Contact the app admin.";
  }
  return normalizeError(err).message;
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [dashboardVersion, setDashboardVersion] = useState(0);

  const syncUser = useCallback(async () => {
    setSyncing(true);
    setAuthError(null);
    try {
      const { data } = await api.post("/auth/sync");
      setUser(data);
    } catch (err) {
      setUser(null);
      setAuthError(syncErrorMessage(err));
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncUser();
      } else {
        setUser(null);
        setAuthError(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [syncUser]);

  useEffect(() => {
    if (!user?._id) return;

    let socket;
    let cancelled = false;

    connectSocket().then((s) => {
      if (cancelled) {
        s.disconnect();
        return;
      }
      socket = s;
      socket.on("dashboard:refresh", () => {
        setDashboardVersion((v) => v + 1);
      });
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [user?._id]);

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        syncing,
        authError,
        dashboardVersion,
        clearAuthError: () => setAuthError(null),
        refreshUser: syncUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
