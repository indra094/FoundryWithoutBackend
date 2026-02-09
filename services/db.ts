
import * as Models from '../models';

const DB_NAME = 'GeminiStudioDB';
const DB_VERSION = 2;
const STORE_NAME = 'drafts';
const TABLE2_NAME = 'table2';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(TABLE2_NAME)) {
        db.createObjectStore(TABLE2_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveDraft = async (id: string, data: any) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, ...data, updatedAt: new Date() });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getDraft = async (id: string) => {
  const db = await initDB();
  return new Promise<any>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result ? request.result : null);
    request.onerror = () => reject(request.error);
  });
};

// --- Table 2 Operations ---

export const addItemToTable2 = async (data: any) => {
  const db = await initDB();
  return new Promise<number>((resolve, reject) => {
    const transaction = db.transaction(TABLE2_NAME, 'readwrite');
    const store = transaction.objectStore(TABLE2_NAME);
    const request = store.add({ ...data, createdAt: new Date() });
    
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

export const getTable2Items = async () => {
  const db = await initDB();
  return new Promise<any[]>((resolve, reject) => {
    const transaction = db.transaction(TABLE2_NAME, 'readonly');
    const store = transaction.objectStore(TABLE2_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// LocalStorage Wrapper for AuthService
export const DB = {
  getItem: <T>(key: string, defaultValue: T): T => {
    const val = localStorage.getItem(key);
    if (!val) return defaultValue;
    try {
      return JSON.parse(val) as T;
    } catch {
      return defaultValue;
    }
  },
  setItem: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export { Models };
