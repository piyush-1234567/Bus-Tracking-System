
"use client";

import { useEffect, useState, useContext } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { FirebaseContext } from "../provider";


export function useUser() {
  const context = useContext(FirebaseContext);
  const auth = context?.auth;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
