import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";

// Generate or retrieve a unique device identifier
export const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get existing device ID
    let deviceId = await AsyncStorage.getItem("deviceId");

    if (!deviceId) {
      // Generate new device ID if doesn't exist
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substr(2, 9);
      const deviceName = Device.deviceName || "unknown";

      deviceId = `device_${timestamp}_${randomString}`;

      // Store it for future use
      await AsyncStorage.setItem("deviceId", deviceId);

      console.log("Generated new device ID:", deviceId);
    } else {
      console.log("Using existing device ID:", deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    // Fallback to timestamp-based ID if storage fails
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Initialize device ID when app starts (optional)
export const initializeDeviceId = async (): Promise<string> => {
  return await getDeviceId();
};

// Clear device ID (for testing or reset purposes)
export const clearDeviceId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("deviceId");
    console.log("Device ID cleared");
  } catch (error) {
    console.error("Error clearing device ID:", error);
  }
};
