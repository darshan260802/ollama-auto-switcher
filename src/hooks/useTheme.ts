import { useEffect, useState, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type FirestoreDataConverter,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../api/firebase";

export type Theme =
  | "cupcake"
  | "forest"
  | "dracula"
  | "night"
  | "abyss"
  | "sunset"
  | "black";

const THEMES: Theme[] = [
  "cupcake",
  "forest",
  "dracula",
  "night",
  "abyss",
  "sunset",
  "black",
];

interface ThemeConfig {
  theme: Theme;
}

const themeConverter: FirestoreDataConverter<ThemeConfig> = {
  toFirestore: (config: ThemeConfig): DocumentData => {
    return {
      theme: config.theme,
    };
  },
  fromFirestore: (snapshot, options): ThemeConfig => {
    const data = snapshot.data(options);
    return {
      theme: data.theme as Theme,
    };
  },
};

const DEFAULT_THEME: Theme = "cupcake";

export function useTheme(userId: string | undefined) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  // Load theme from Firestore on mount
  useEffect(() => {
    if (!userId) {
      setTheme(DEFAULT_THEME);
      setLoading(false);
      return;
    }

    setLoading(true);
    const configRef = doc(db, "users", userId, "config", "theme").withConverter(
      themeConverter
    );

    // Try to get initial value first
    getDoc(configRef).then((docSnap) => {
      if (docSnap.exists()) {
        setTheme(docSnap.data().theme);
      } else {
        // Create default config if not exists
        setDoc(configRef, { theme: DEFAULT_THEME });
      }
      setLoading(false);
    });

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      configRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setTheme(snapshot.data().theme);
        }
      },
      (error) => {
        console.error("Error fetching theme:", error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Apply theme to document when it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Update theme in Firestore
  const updateTheme = useCallback(
    async (newTheme: Theme) => {
      if (!userId) return;

      const configRef = doc(db, "users", userId, "config", "theme");
      await setDoc(configRef, { theme: newTheme }, { merge: true });
    },
    [userId]
  );

  return { theme, loading, updateTheme, themes: THEMES };
}
