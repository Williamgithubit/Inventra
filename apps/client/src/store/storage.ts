import createWebStorage from "redux-persist/lib/storage/createWebStorage";

function createNoopStorage() {
  return {
    getItem(key: string) {
      void key;
      return Promise.resolve(null);
    },
    setItem(key: string, value: string) {
      void key;
      return Promise.resolve(value);
    },
    removeItem(key: string) {
      void key;
      return Promise.resolve();
    }
  };
}

const storage = typeof window === "undefined" ? createNoopStorage() : createWebStorage("local");

export default storage;
