import { SessionManager } from "../sessionManager";
import { getSessionDB } from "./schema";

const dbInstance: Map<string, any> = new Map();


  export const getDbInstance = async () => {
    const sessionManager = SessionManager.getInstance();
    const sessionId = sessionManager.getSessionId();
    
    if (!sessionId) {
        throw new Error("Session ID is not available.");
    }

    let instance = dbInstance.get(sessionId);
    
    if (!instance) {
        instance = getSessionDB();
        instance.sessionId = sessionId;
        await instance.openDatabase();
        dbInstance.set(sessionId, instance);
    }

    return instance;
};


// export const cleanDBInstance = (sessionId: string) => {
//     const instance = dbInstance.get(sessionId)
//     if (instance) {
//         instance.close()
//         dbInstance.delete(sessionId)
//     }
// }