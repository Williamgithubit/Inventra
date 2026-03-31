"use client";

import { useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { makePersistor, makeStore, type AppPersistor, type AppStore } from ".";

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<AppPersistor | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    persistorRef.current = makePersistor(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate persistor={persistorRef.current!}>{children}</PersistGate>
    </Provider>
  );
}
