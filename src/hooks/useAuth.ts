import { RemoteApi } from "@/lib/api/remoteApi";
import { db } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "./useStore";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { triggerLocalFetch } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        db.open();
        triggerLocalFetch();
        setIsAuthenticated(true);
      } else if (token) {
        try {
          const user = await RemoteApi.getUserByToken(token);
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
            db.open();
            triggerLocalFetch();
            setIsAuthenticated(true);
            navigate("/");
          }
        } catch (error) {
          console.error("Error authenticating with token:", error);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token, navigate]);

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    db.close();
    await db.delete();

    console.log("Dexie Database deleted successfully!");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return { isAuthenticated, isLoading, logout };
}
