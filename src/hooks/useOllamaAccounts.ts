import { useEffect, useState, useCallback } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
  type FirestoreDataConverter,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../api/firebase";
import type { OllamaAccount } from "../types/ollamaAccount";

interface FirestoreOllamaAccount {
  email: string;
  authToken: string;
  sessionUsage?: number;
  sessionResetIn?: string;
  weeklySessionUsage?: number;
  weeklySessionResetIn?: string;
  createdAt: Timestamp;
}

const ollamaAccountConverter: FirestoreDataConverter<FirestoreOllamaAccount> = {
  toFirestore: (account: Omit<OllamaAccount, "id">): DocumentData => {
    return {
      email: account.email,
      authToken: account.authToken,
      sessionUsage: account.sessionUsage,
      sessionResetIn: account.sessionResetIn,
      weeklySessionUsage: account.weeklySessionUsage,
      weeklySessionResetIn: account.weeklySessionResetIn,
      createdAt: Timestamp.fromDate(account.createdAt),
    };
  },
  fromFirestore: (snapshot, options): FirestoreOllamaAccount => {
    const data = snapshot.data(options);
    return {
      email: data.email,
      authToken: data.authToken,
      sessionUsage: data.sessionUsage,
      sessionResetIn: data.sessionResetIn,
      weeklySessionUsage: data.weeklySessionUsage,
      weeklySessionResetIn: data.weeklySessionResetIn,
      createdAt: data.createdAt as Timestamp,
    };
  },
};

export function useOllamaAccounts(userId: string | undefined) {
  const [accounts, setAccounts] = useState<OllamaAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch accounts from Firestore in real-time
  useEffect(() => {
    if (!userId) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const accountsRef = collection(
      db,
      "users",
      userId,
      "ollama_accounts"
    ).withConverter(ollamaAccountConverter);
    const q = query(accountsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const accountList: OllamaAccount[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.data().email,
          authToken: doc.data().authToken,
          sessionUsage: doc.data().sessionUsage,
          sessionResetIn: doc.data().sessionResetIn,
          weeklySessionUsage: doc.data().weeklySessionUsage,
          weeklySessionResetIn: doc.data().weeklySessionResetIn,
          createdAt: doc.data().createdAt.toDate(),
        }));
        setAccounts(accountList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching accounts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Add a new account to Firestore
  const addAccount = useCallback(
    async (accountData: { email: string; authToken: string }) => {
      if (!userId) throw new Error("User not authenticated");

      const accountsRef = collection(db, "users", userId, "ollama_accounts");
      const newAccount = {
        email: accountData.email,
        authToken: accountData.authToken,
        createdAt: new Date(),
      };

      const docRef = await addDoc(accountsRef, newAccount);
      return {
        id: docRef.id,
        ...newAccount,
      } as OllamaAccount;
    },
    [userId]
  );

  // Update an account in Firestore
  const updateAccount = useCallback(
    async (
      accountId: string,
      updates: Partial<Pick<OllamaAccount, "email" | "authToken">>
    ) => {
      if (!userId) throw new Error("User not authenticated");

      const accountRef = doc(db, "users", userId, "ollama_accounts", accountId);
      await updateDoc(accountRef, {
        ...updates,
      });
    },
    [userId]
  );

  // Delete an account from Firestore
  const deleteAccount = useCallback(
    async (accountId: string) => {
      if (!userId) throw new Error("User not authenticated");

      const accountRef = doc(db, "users", userId, "ollama_accounts", accountId);
      await deleteDoc(accountRef);
    },
    [userId]
  );

  // Refresh account usage from API and update Firestore
  const refreshAccountUsage = useCallback(
    async (accountId: string, authToken: string) => {
      if (!userId) throw new Error("User not authenticated");

      const response = await fetch("http://localhost:3000/ollama/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auth: authToken }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.statusText}`);
      }

      const data = await response.json();

      // Update Firestore with the usage data
      const accountRef = doc(db, "users", userId, "ollama_accounts", accountId);
      await updateDoc(accountRef, {
        sessionUsage: data.session.usage,
        sessionResetIn: data.session.reset,
        weeklySessionUsage: data.weekly.usage,
        weeklySessionResetIn: data.weekly.reset,
      });
    },
    [userId]
  );

  return { accounts, loading, addAccount, updateAccount, deleteAccount, refreshAccountUsage };
}
