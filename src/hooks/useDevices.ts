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
import type { Device } from "../types/device";

interface FirestoreDevice {
  name: string;
  key: string;
  nickname?: string;
  createdAt: Timestamp;
}

const deviceConverter: FirestoreDataConverter<FirestoreDevice> = {
  toFirestore: (device): DocumentData => {
    return {
      name: device.name,
      key: device.key,
      nickname: device.nickname,
      createdAt: device.createdAt,
    };
  },
  fromFirestore: (snapshot, options): FirestoreDevice => {
    const data = snapshot.data(options);
    return {
      name: data.name,
      key: data.key,
      nickname: data.nickname,
      createdAt: data.createdAt as Timestamp,
    };
  },
};

export function useDevices(userId: string | undefined) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch devices from Firestore in real-time
  useEffect(() => {
    if (!userId) {
      setDevices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const devicesRef = collection(db, "users", userId, "devices").withConverter(
      deviceConverter
    );
    const q = query(devicesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deviceList: Device[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          key: doc.data().key,
          nickname: doc.data().nickname,
          createdAt: doc.data().createdAt.toDate(),
        }));
        setDevices(deviceList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching devices:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Add a new device to Firestore
  const addDevice = useCallback(
    async (deviceData: { name: string; key: string; nickname?: string }) => {
      if (!userId) throw new Error("User not authenticated");

      const devicesRef = collection(db, "users", userId, "devices");
      const newDevice = {
        name: deviceData.name,
        key: deviceData.key,
        nickname: deviceData.nickname || null,
        createdAt: new Date(),
      };

      const docRef = await addDoc(devicesRef, newDevice);
      return {
        id: docRef.id,
        ...newDevice,
      } as Device;
    },
    [userId]
  );

  // Delete a device from Firestore
  const deleteDevice = useCallback(
    async (deviceId: string) => {
      if (!userId) throw new Error("User not authenticated");

      const deviceRef = doc(db, "users", userId, "devices", deviceId);
      await deleteDoc(deviceRef);
    },
    [userId]
  );

  // Update a device in Firestore
  const updateDevice = useCallback(
    async (deviceId: string, updates: { nickname?: string | null }) => {
      if (!userId) throw new Error("User not authenticated");

      const deviceRef = doc(db, "users", userId, "devices", deviceId);
      await updateDoc(deviceRef, {
        nickname: updates.nickname || null,
      });
    },
    [userId]
  );

  return { devices, loading, addDevice, deleteDevice, updateDevice };
}
