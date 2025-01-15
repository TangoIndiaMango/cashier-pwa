import { StoreDatabase } from "./schema";
const dbInstance: StoreDatabase | null = null
export const getDbInstance = (): StoreDatabase => {
  if (!dbInstance) {
    const sessionId = sessionStorage.getItem("sessionId") || ""
    return new StoreDatabase(sessionId);
  }
  return dbInstance;
}