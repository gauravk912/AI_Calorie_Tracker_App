import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../config/firebase";

export interface MealLog {
  id: string; // Unique timestamp or UUID
  title: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  timestamp: number;
}

export interface ExerciseLog {
  id: string;
  title: string;
  caloriesBurned: number;
  durationMins?: number;
  intensity?: string;
  description?: string;
  timestamp: number;
}

export interface DailyLogDoc {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
  waterGlasses: number;
  waterMl?: number; // Advanced logical ML parallel matrix tracking Native ML inputs specifically
  totalBurnedCalories?: number;
  meals: MealLog[];
  exercises?: ExerciseLog[];
}

export const formatLogDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const fetchDailyLogs = async (uid: string, dateObj: Date): Promise<DailyLogDoc> => {
  const dateStr = formatLogDate(dateObj);
  const logRef = doc(db, "users", uid, "dailyLogs", dateStr);
  
  try {
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      return logSnap.data() as DailyLogDoc;
    }
    // Return empty state if none exists
    return {
      date: dateStr,
      totalCalories: 0,
      totalProtein: 0,
      totalFats: 0,
      totalCarbs: 0,
      waterGlasses: 0,
      meals: []
    };
  } catch (error) {
    console.error("Error fetching daily logs:", error);
    throw error;
  }
};

export const addMealLog = async (uid: string, dateObj: Date, meal: Omit<MealLog, 'id' | 'timestamp'>) => {
  const dateStr = formatLogDate(dateObj);
  const logRef = doc(db, "users", uid, "dailyLogs", dateStr);
  
  try {
    const newMeal: MealLog = {
      ...meal,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      // Doc exists, atomically update array and totals
      const currentTotals = logSnap.data();
      await updateDoc(logRef, {
        meals: arrayUnion(newMeal),
        totalCalories: (currentTotals.totalCalories || 0) + meal.calories,
        totalProtein: (currentTotals.totalProtein || 0) + meal.protein,
        totalFats: (currentTotals.totalFats || 0) + meal.fats,
        totalCarbs: (currentTotals.totalCarbs || 0) + meal.carbs,
      });
    } else {
      // First meal of the day! Create the document explicitly
      await setDoc(logRef, {
        date: dateStr,
        totalCalories: meal.calories,
        totalProtein: meal.protein,
        totalFats: meal.fats,
        totalCarbs: meal.carbs,
        waterGlasses: 0,
        meals: [newMeal]
      });
    }
  } catch (error) {
    console.error("Error adding meal log:", error);
    throw error;
  }
};

export const updateWaterLog = async (uid: string, dateObj: Date, incrementGlasses: number, incrementMl: number = 0) => {
  const dateStr = formatLogDate(dateObj);
  const logRef = doc(db, "users", uid, "dailyLogs", dateStr);
  
  try {
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      const dbData = logSnap.data();
      const newGlassesCount = Math.max(0, (dbData.waterGlasses || 0) + incrementGlasses); 
      const newMlCount = Math.max(0, (dbData.waterMl || 0) + incrementMl); 

      await updateDoc(logRef, {
        waterGlasses: newGlassesCount,
        waterMl: newMlCount
      });
    } else {
      // First structural DB mapping of the day strictly from Water increment bounds explicitly
      const newGlassesCount = Math.max(0, incrementGlasses);
      const newMlCount = Math.max(0, incrementMl);

      await setDoc(logRef, {
        date: dateStr,
        totalCalories: 0,
        totalProtein: 0,
        totalFats: 0,
        totalCarbs: 0,
        waterGlasses: newGlassesCount,
        waterMl: newMlCount,
        meals: []
      });
    }
  } catch (error) {
    console.error("Error updating water log:", error);
    throw error;
  }
};

export const addExerciseLog = async (uid: string, dateObj: Date, exercise: Omit<ExerciseLog, 'id' | 'timestamp'>) => {
  const dateStr = formatLogDate(dateObj);
  const logRef = doc(db, "users", uid, "dailyLogs", dateStr);
  
  try {
    const rawExercise: any = {
      ...exercise,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    // Firebase strictly rejects `undefined` pointers natively throwing silent crash limits inside arrayUnion arrays.
    // Strip constraints completely evaluating keys organically.
    Object.keys(rawExercise).forEach(key => {
      if (rawExercise[key] === undefined) {
        delete rawExercise[key];
      }
    });

    const newExercise = rawExercise as ExerciseLog;

    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      const currentTotals = logSnap.data();
      await updateDoc(logRef, {
        exercises: arrayUnion(newExercise),
        totalBurnedCalories: (currentTotals.totalBurnedCalories || 0) + newExercise.caloriesBurned,
      });
    } else {
      // Create fresh document mapping if nothing exists
      await setDoc(logRef, {
        date: dateStr,
        totalCalories: 0,
        totalProtein: 0,
        totalFats: 0,
        totalCarbs: 0,
        waterGlasses: 0,
        totalBurnedCalories: newExercise.caloriesBurned,
        meals: [],
        exercises: [newExercise]
      });
    }
  } catch (error) {
    console.error("Error adding exercise log:", error);
    throw error;
  }
};
