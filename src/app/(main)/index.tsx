import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HomeHeader } from "../../components/HomeHeader";
import { DateSelector } from "../../components/DateSelector";
import { CaloriesCard, MacroSet } from "../../components/CaloriesCard";
import { WaterTrackerCard } from "../../components/WaterTrackerCard";
import { RecentActivity } from "../../components/RecentActivity";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { fetchDailyLogs, MealLog, ExerciseLog } from "../../services/logService";
import { updateAiPlan } from "../../services/userService";
import { Colors } from "../../constants/Colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [targetMacros, setTargetMacros] = useState<MacroSet | null>(null);
  const [targetWater, setTargetWater] = useState<number>(2.5);
  
  const [consumedMacros, setConsumedMacros] = useState<MacroSet | null>(null);
  const [burnedCals, setBurnedCals] = useState<number>(0);
  const [consumedGlasses, setConsumedGlasses] = useState<number>(0);
  const [mealsList, setMealsList] = useState<MealLog[]>([]);
  const [exercisesList, setExercisesList] = useState<ExerciseLog[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Modular Fetch function enabling rapid re-pulls after discrete DB updates
  const loadDashboardData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      // 1. Fetch AI Targets (Ideally we could cache this locally, but a direct fetch is fine for now)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().aiPlan) {
        const plan = userSnap.data().aiPlan;
        setTargetMacros({
          dailyCalories: plan.dailyCalories || 2000,
          proteinGrams: plan.proteinGrams || 150,
          fatsGrams: plan.fatsGrams || 70,
          carbsGrams: plan.carbsGrams || 250,
        });
        setTargetWater(plan.waterLiters || 2.5);
      }

      // 2. Fetch Daily Logs for exactly the highlighted calendar string
      const dailyLog = await fetchDailyLogs(user.uid, selectedDate);
      setConsumedMacros({
        dailyCalories: dailyLog.totalCalories,
        proteinGrams: dailyLog.totalProtein,
        fatsGrams: dailyLog.totalFats,
        carbsGrams: dailyLog.totalCarbs,
      });
      setBurnedCals(dailyLog.totalBurnedCalories || 0);
      setConsumedGlasses(dailyLog.waterGlasses || 0);
      setMealsList(dailyLog.meals || []);
      setExercisesList(dailyLog.exercises || []);

    } catch (e) {
      console.error("Dashboard Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.uid, selectedDate]);

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    // Asynchronously log the context locally enabling the Floating Module to dynamically pull context
    await AsyncStorage.setItem('lastSelectedDate', date.toISOString());
  };

  const updateWaterTarget = async (newLiters: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentPlan = userSnap.data().aiPlan || {};
        await updateAiPlan(user.uid, { ...currentPlan, waterLiters: newLiters });
        setTargetWater(newLiters);
      }
    } catch (e) {
      console.error("Water Update Error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={true}>
        
        {/* Unpinned Header Module */}
        <HomeHeader />
        
        {/* Unpinned Date Ribbon */}
        <DateSelector onSelectDate={handleDateSelect} />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View>
            <CaloriesCard 
              targetMacros={targetMacros} 
              consumedMacros={consumedMacros} 
              targetWater={targetWater}
              burnedCalories={burnedCals}
              onUpdateTarget={(newMacros, newWater) => {
                setTargetMacros(newMacros);
                if (newWater !== undefined) setTargetWater(newWater);
              }}
            />

            <WaterTrackerCard 
              targetLiters={targetWater}
              consumedGlasses={consumedGlasses}
              selectedDate={selectedDate}
              onWaterLogged={() => loadDashboardData()}
            />

            <RecentActivity meals={mealsList} exercises={exercisesList} />

          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120, // Extended safety padding accommodating the Tab Bar offset across absolute device arrays
  },
  loadingContainer: {
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
