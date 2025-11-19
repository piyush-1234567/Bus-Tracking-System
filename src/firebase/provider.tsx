
"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { Auth } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { useUser } from "./auth/use-user";

type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
};

export const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({
  children,
  app,
  auth,
  db,
}: {
  children: ReactNode;
} & FirebaseContextValue) {
  return (
    <FirebaseContext.Provider value={{ app, auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error(
      "useFirebaseApp must be used within a FirebaseProvider"
    );
  }
  return context.app;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error("useAuth must be used within a FirebaseProvider");
  }
  const { user, loading } = useUser();
  return { auth: context.auth, user, loading };
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error(
      "useFirestore must be used within a FirebaseProvider"
    );
  }
  return context.db;
};
