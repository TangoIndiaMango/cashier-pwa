import { RemoteApi } from "@/lib/api/remoteApi";
import { db } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "./useStore";
import { delay } from "@/lib/utils";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { triggerFetch } = useStore();
const SLEEP_TIME = 1
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        console.log("Sleeping...");
        await delay(SLEEP_TIME);
        db.open();
        console.log("Sleeping before loading data...");
        await delay(SLEEP_TIME);
        triggerFetch();
        setIsAuthenticated(true);
        setIsLoading(false);
        return
      } else if (token) {
        try {
          const user = await RemoteApi.getUserByToken(token);
          if (user) {
            localStorage.setItem("user", JSON.stringify(user?.user));
            localStorage.setItem("token", token);
            console.log("Sleeping...");
            await delay(SLEEP_TIME);
            db.open();
            console.log("Sleeping before loading data...");
            await delay(SLEEP_TIME);
            triggerFetch();
            setIsAuthenticated(true);
            setIsLoading(false);
            return
          }
        } catch (error) {
          console.error("Error authenticating with token:", error);
          navigate("/login");
        }
        return
      } else {
        navigate("/login");
        setIsLoading(false);
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
