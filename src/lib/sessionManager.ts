import { getStoreInfo, getUserInfo } from "./utils";

// sessionManager.ts
export class SessionManager {
    private static instance: SessionManager | null = null;
    private cachedSessionId: string | null = null;
    
    private constructor() { }

    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    generateSessionId(): string {
        const storeInfo = getStoreInfo();
        const userInfo = getUserInfo();
        const sessionID = String(sessionStorage.getItem('token'));

        if (!storeInfo || !userInfo || !sessionID) {
            throw new Error("Required session information missing");
        }

        const storeIdStr = String(storeInfo.store_id || storeInfo.id);
        const firstnameStr = String(userInfo.firstname);
        const phonenoStr = String(userInfo.phoneno);
        //   const sessionSlice = sessionID.slice(10, 16);
        const uniqueSessionId = String(Math.random().toString(36).slice(2, 9))

        const sessId = storeIdStr + firstnameStr + phonenoStr + uniqueSessionId;
        sessionStorage.setItem("sessionId", sessId)
        return sessId
    }

    getSessionId(): string {
        if (!this.cachedSessionId) {
            this.cachedSessionId = this.generateSessionId();
            console.log('Generated new session ID:', this.cachedSessionId);
        }
        return this.cachedSessionId;
    }

    clearSession(): void {
        this.cachedSessionId = null;
    }
}


