import { useEffect, useState, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Timestamp,
  type FirestoreDataConverter,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../api/firebase";

interface FirestoreUserSettings {
  selectedDeviceId?: string | null;
  autoSwitchEnabled?: boolean;
  apiToken?: string | null;
  apiTokenUpdatedAt?: Timestamp;
}

export interface UserSettings {
  selectedDeviceId: string | null;
  autoSwitchEnabled: boolean;
  apiToken: string | null;
  apiTokenUpdatedAt: Date | null;
}

const settingsConverter: FirestoreDataConverter<FirestoreUserSettings> = {
  toFirestore: (settings): DocumentData => {
    const data: DocumentData = {};
    if (settings.selectedDeviceId !== undefined) {
      data.selectedDeviceId = settings.selectedDeviceId ?? null;
    }
    if (settings.autoSwitchEnabled !== undefined) {
      data.autoSwitchEnabled = settings.autoSwitchEnabled;
    }
    if (settings.apiToken !== undefined) {
      data.apiToken = settings.apiToken;
      data.apiTokenUpdatedAt = new Date();
    }
    return data;
  },
  fromFirestore: (snapshot, options): FirestoreUserSettings => {
    const data = snapshot.data(options);
    return {
      selectedDeviceId: data.selectedDeviceId ?? null,
      autoSwitchEnabled: data.autoSwitchEnabled ?? false,
      apiToken: data.apiToken ?? null,
      apiTokenUpdatedAt: data.apiTokenUpdatedAt ?? null,
    };
  },
};

export function useUserSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<UserSettings>({
    selectedDeviceId: null,
    autoSwitchEnabled: false,
    apiToken: null,
    apiTokenUpdatedAt: null,
  });
  const [loading, setLoading] = useState(true);

  // Real-time sync of settings from Firestore
  useEffect(() => {
    if (!userId) {
      setSettings({
        selectedDeviceId: null,
        autoSwitchEnabled: false,
        apiToken: null,
        apiTokenUpdatedAt: null,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    const settingsRef = doc(
      db,
      "users",
      userId
    ).withConverter(settingsConverter);

    // Ensure the document exists so onSnapshot fires reliably
    getDoc(settingsRef).then((snap) => {
      if (!snap.exists()) {
        setDoc(settingsRef, {
          selectedDeviceId: null,
          autoSwitchEnabled: false,
        });
      }
    });

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        const data = snapshot.data();
        setSettings({
          selectedDeviceId: data?.selectedDeviceId ?? null,
          autoSwitchEnabled: data?.autoSwitchEnabled ?? false,
          apiToken: data?.apiToken ?? null,
          apiTokenUpdatedAt: data?.apiTokenUpdatedAt
            ? (data.apiTokenUpdatedAt as Timestamp).toDate()
            : null,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user settings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const setSelectedDeviceId = useCallback(
    async (deviceId: string | null) => {
      if (!userId) throw new Error("User not authenticated");
      const settingsRef = doc(db, "users", userId).withConverter(
        settingsConverter
      );
      await setDoc(
        settingsRef,
        { selectedDeviceId: deviceId ?? null },
        { merge: true }
      );
    },
    [userId]
  );

  const setAutoSwitchEnabled = useCallback(
    async (enabled: boolean) => {
      if (!userId) throw new Error("User not authenticated");
      const settingsRef = doc(db, "users", userId).withConverter(
        settingsConverter
      );
      await setDoc(
        settingsRef,
        { autoSwitchEnabled: enabled },
        { merge: true }
      );
    },
    [userId]
  );

  const setApiToken = useCallback(
    async (token: string | null) => {
      if (!userId) throw new Error("User not authenticated");
      const settingsRef = doc(db, "users", userId).withConverter(
        settingsConverter
      );
      await setDoc(
        settingsRef,
        { apiToken: token ?? null },
        { merge: true }
      );
    },
    [userId]
  );

  return {
    settings,
    loading,
    setSelectedDeviceId,
    setAutoSwitchEnabled,
    setApiToken,
  };
}
