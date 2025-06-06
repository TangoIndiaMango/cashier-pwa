import { LocalApi } from "@/lib/api/localApi";
import { RemoteApi } from "@/lib/api/remoteApi";
import { getDbInstance } from "@/lib/db/db";
import { delay, getSessionId } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "./useStore";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { triggerFetch } = useStore();
  const SLEEP_TIME = 1

  const authenticateUser =
    async (token: string) => {
      try {
        const user = await RemoteApi.getUserByToken(token);
        if (user) {
          sessionStorage.setItem("user", JSON.stringify(user?.user));
          sessionStorage.setItem("token", token);

          console.log("Sleeping...");
          await delay(SLEEP_TIME);
          const sessionId = getSessionId();
          sessionStorage.setItem("sessionId", sessionId);
          await delay(SLEEP_TIME);
          const db = await getDbInstance()
          await delay(SLEEP_TIME);
          await db.openDatabase();
          console.log("Sleeping before loading data...");
          await delay(SLEEP_TIME);

          await triggerFetch();
          setIsAuthenticated(true);
          removeTokenFromUrl();
          setIsLoading(false);
          return true;
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setIsLoading(false);
      }
      return false;
    };


  const removeTokenFromUrl = useCallback(() => {
    searchParams.delete("token");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      const storedToken = sessionStorage.getItem("token");

      if (token) {
        await authenticateUser(token);
        return
      } else if (storedToken) {
        setIsAuthenticated(true)
        setIsLoading(false);
        return
      }

      navigate("/login");
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, token]);


  const logout = async () => {
    const sessionId = sessionStorage.getItem('sessionId');
    await LocalApi.clearSessionData(String(sessionId));
    console.log("Clearing data for sessionId:", sessionId);
    await delay(SLEEP_TIME);

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("sessionId");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  return { isAuthenticated, isLoading, logout };

}
