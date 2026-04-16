import { useState } from "react";
import { Plus, ChevronDown, Check } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { AddDeviceModal } from "../components/AddDeviceModal";
import { useAuth } from "../context/AuthContext";
import { useDevices } from "../hooks/useDevices";
import type { Device } from "../types/device";

export function Home() {
  const { user } = useAuth();
  const { devices, loading, addDevice } = useDevices(user?.uid);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Format device option for dropdown display
  const formatDeviceOption = (device: Device): string => {
    if (device.nickname) {
      return `${device.name} (${device.nickname})`;
    }
    return device.name;
  };

  // Handle adding a new device
  const handleAddDevice = async (deviceData: { name: string; key: string; nickname?: string }) => {
    try {
      const newDevice = await addDevice(deviceData);
      setSelectedDevice(newDevice);
      setToast({ message: "Device added successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
      return newDevice;
    } catch (err) {
      throw err;
    }
  };

  // Handle error from modal
  const handleError = (error: string) => {
    setToast({ message: error, type: "error" });
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="flex flex-1 flex-col bg-base-100">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-top toast-end z-50`}>
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <Check className="w-5 h-5" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col p-6 gap-6">
        {/* Device Selector Section */}
        <div className="flex items-center gap-4">
          {/* Device Dropdown */}
          <div className="dropdown dropdown-end flex-1">
            <button
              tabIndex={0}
              className="btn btn-outline w-full justify-between"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : selectedDevice ? (
                <span className="truncate">{formatDeviceOption(selectedDevice)}</span>
              ) : devices.length > 0 ? (
                <span className="text-base-content/50">Select a device</span>
              ) : (
                <span className="text-base-content/50">No devices</span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full min-w-[200px] max-h-60 overflow-y-auto z-10"
            >
              {devices.length === 0 ? (
                <li className="disabled">
                  <span className="text-base-content/50">No devices added yet</span>
                </li>
              ) : (
                devices.map((device) => (
                  <li key={device.id}>
                    <button
                      onClick={() => setSelectedDevice(device)}
                      className={selectedDevice?.id === device.id ? "active" : ""}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{device.name}</span>
                        {device.nickname && (
                          <span className="text-xs text-base-content/60">{device.nickname}</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Add Device Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Device
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {selectedDevice ? (
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-primary">
                {selectedDevice.nickname || selectedDevice.name}
              </h1>
              <p className="text-base-content/70">
                Device: {selectedDevice.name}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-2">Hello World</h1>
              <p className="text-base-content/70">Select a device to get started</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDeviceAdded={handleAddDevice}
        onError={handleError}
      />
    </div>
  );
}
