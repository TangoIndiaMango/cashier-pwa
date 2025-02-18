import { StoreDatabase } from "./schema";

let dbInstance: StoreDatabase | null = null;
let isInitializing = false;
let isClosing = false;

export const getDbInstance = async (): Promise<StoreDatabase> => {
  if (isClosing) {
    // Wait for closing to complete
    while (isClosing) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  if (dbInstance?.isOpen()) {
    return dbInstance;
  }

  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return dbInstance!;
  }

  try {
    isInitializing = true;
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No session ID found");
    }

    dbInstance = new StoreDatabase(sessionId);
    await dbInstance.open();
    return dbInstance;
  } finally {
    isInitializing = false;
  }
};

export const closeDB = async (): Promise<void> => {
  if (isClosing || !dbInstance) return;
  
  try {
    isClosing = true;
    if (dbInstance.isOpen()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      dbInstance.close();
      console.log("Database closed successfully");
    }
  } catch (error) {
    console.error("Error closing database:", error);
  } finally {
    dbInstance = null;
    isClosing = false;
  }
};