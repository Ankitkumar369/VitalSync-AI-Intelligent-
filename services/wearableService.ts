
import { ActivityLog } from "../types";

export const syncWearableData = async (): Promise<ActivityLog[]> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const types = ["Running", "Cycling", "Swimming", "HIIT", "Strength Training"];
  const count = Math.floor(Math.random() * 2) + 1;
  
  const newData: ActivityLog[] = Array.from({ length: count }).map(() => {
    const type = types[Math.floor(Math.random() * types.length)];
    const duration = Math.floor(Math.random() * 45) + 15;
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: `${type} (Synced)`,
      duration,
      calories: duration * 8,
      timestamp: Date.now(),
      heartRateAvg: Math.floor(Math.random() * 40) + 120
    };
  });
  
  return newData;
};
