

export interface ActivityLog {
  id: string;
  type: string;
  duration: number; // minutes
  calories: number;
  timestamp: number;
  heartRateAvg?: number;
}

export interface UserStats {
  steps: number;
  water: number; // liters
  sleep: number; // hours
  weight: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: 'Loss' | 'Gain' | 'Maintain' | 'Athletic';
  dailyStepGoal: number;
  dailyCalorieGoal: number;
  targetWeight?: number;
  weeklyWorkoutGoal?: number;
}

export interface PersonalBest {
  label: string;
  value: string;
  date: number;
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  timestamp: string;
}

export interface HealthAnomalies {
  symptom: string;
  severity: 'low' | 'medium' | 'high';
  analysis: string;
  timestamp: number;
}

export interface MealRecommendation {
  meal: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  reason: string;
}

export interface AQIStatus {
  index: number;
  category: string;
  recommendation: string;
  sources: { title: string; uri: string }[];
}

export interface MentalExercise {
  title: string;
  description: string;
  steps: string[];
  benefit: string;
  category: 'Focus' | 'Stress' | 'Concentration';
}

/**
 * Added interface for weather-based activity recommendations.
 */
export interface WeatherActivitySuggestion {
  recommendation: string;
  sources: { title: string; uri: string }[];
}

/**
 * Added interface for breathing exercise patterns.
 */
export interface BreathingPattern {
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
}
