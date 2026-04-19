import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { addMealLog } from '../services/logService';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export default function LogFoodEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  // Extract URL constraints directly resolving strictly dynamically mapped Arrays
  const nameParam = Array.isArray(params.name) ? params.name[0] : (params.name || "Unknown Food");
  const brandParam = Array.isArray(params.brand) ? params.brand[0] : (params.brand || "Generic base");
  const servingParam = Array.isArray(params.serving) ? params.serving[0] : (params.serving || "serving");

  const baseCalories = parseFloat(Array.isArray(params.calories) ? params.calories[0] : (params.calories || "0"));
  const baseProtein = parseFloat(Array.isArray(params.protein) ? params.protein[0] : (params.protein || "0"));
  const baseFats = parseFloat(Array.isArray(params.fat) ? params.fat[0] : (params.fat || "0"));
  const baseCarbs = parseFloat(Array.isArray(params.carbs) ? params.carbs[0] : (params.carbs || "0"));

  // State Constraints evaluating structural numbers organically dynamically safely
  const [multiplierStr, setMultiplierStr] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealType, setMealType] = useState<MealType>('Snack');

  // Infer local time exactly mapping constraints natively structurally
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setMealType('Breakfast');
    else if (hour >= 11 && hour < 16) setMealType('Lunch');
    else if (hour >= 16 && hour < 21) setMealType('Dinner');
    else setMealType('Snack');
  }, []);

  // Strict Matrix limits parsing numeric floats gracefully dropping NaN artifacts safely
  const multiplier = parseFloat(multiplierStr) || 0;

  const calTotal = Math.round(baseCalories * multiplier);
  const proTotal = Math.round(baseProtein * multiplier);
  const fatTotal = Math.round(baseFats * multiplier);
  const carbTotal = Math.round(baseCarbs * multiplier);

  const handleLogFood = async () => {
    if (!user) return;
    if (multiplier <= 0) {
      Alert.alert("Invalid Serving", "Please enter a valid serving size greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const storedDate = await AsyncStorage.getItem('lastSelectedDate');
      const activeDate = storedDate ? new Date(storedDate) : new Date();

      await addMealLog(user.uid, activeDate, {
        title: nameParam,
        name: nameParam,
        mealType: mealType,
        calories: calTotal,
        protein: proTotal,
        fats: fatTotal,
        carbs: carbTotal
      } as any);

      router.push('/(main)');
    } catch (error) {
      Alert.alert("Error Logging Food", "Could not sync data securely to server limit bounds.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* Structural Native Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Food</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.contentWrap} showsVerticalScrollIndicator={false}>

        {/* Native Food Identity Titles */}
        <View style={styles.titleBlock}>
          <Text style={styles.hugeTitle}>{nameParam}</Text>
          <Text style={styles.brandTitle}>{brandParam}</Text>
        </View>

        {/* Serving Entry Matrix Tracking Explicitly Structurally Custom Scaled Inputs */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeading}>SERVING SIZE</Text>
        </View>
        <View style={styles.servingInputBox}>
          <Text style={styles.servingPrefix}>Per</Text>
          <TextInput
            style={styles.numericInput}
            value={multiplierStr}
            onChangeText={setMultiplierStr}
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={styles.servingSuffix}>{servingParam}</Text>
        </View>

        {/* Central Massive Dynamic Calories Grid */}
        <View style={styles.caloriesCard}>
          <View style={styles.calCardHeader}>
            <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
            <Text style={styles.calCardTitle}>Calories</Text>
          </View>
          <View style={styles.calCardBody}>
            <Text style={styles.calHugeNumber}>{calTotal}</Text>
            <Text style={styles.calUnitText}>kcal</Text>
          </View>
        </View>

        {/* Triple Sub Component Array mapping P, F, C structurally natively explicitly tracking colors visually */}
        <View style={styles.tripleGrid}>
          <View style={styles.macroCard}>
            <View style={[styles.macroIconWrap, { backgroundColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="bowl-mix-outline" size={20} color="#0369A1" />
            </View>
            <Text style={styles.macroCardTitle}>Protein</Text>
            <View style={styles.macroValRow}>
              <Text style={styles.macroBaseNumber}>{proTotal}</Text>
              <Text style={styles.macroBaseUnit}>g</Text>
            </View>
          </View>

          <View style={styles.macroCard}>
            <View style={[styles.macroIconWrap, { backgroundColor: '#FFEDD5' }]}>
              <MaterialCommunityIcons name="lightning-bolt-outline" size={20} color="#EA580C" />
            </View>
            <Text style={styles.macroCardTitle}>Fats</Text>
            <View style={styles.macroValRow}>
              <Text style={styles.macroBaseNumber}>{fatTotal}</Text>
              <Text style={styles.macroBaseUnit}>g</Text>
            </View>
          </View>

          <View style={styles.macroCard}>
            <View style={[styles.macroIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="leaf" size={20} color="#15803D" />
            </View>
            <Text style={styles.macroCardTitle}>Carbs</Text>
            <View style={styles.macroValRow}>
              <Text style={styles.macroBaseNumber}>{carbTotal}</Text>
              <Text style={styles.macroBaseUnit}>g</Text>
            </View>
          </View>
        </View>

        {/* Meal Tracker Toggles Natively parsing the string dynamically */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeading}>MEAL TYPE</Text>
        </View>
        <View style={styles.mealTypeGrid}>
          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => {
            const isActive = mealType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.mealPill, isActive && styles.mealPillActive]}
                onPress={() => setMealType(type as MealType)}
              >
                <Text style={[styles.mealPillText, isActive && styles.mealPillTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* Massive Baseline Confirmation Object completely mapping aesthetic exactness safely explicitly */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logButton}
          onPress={handleLogFood}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <View style={styles.logBtnInner}>
              <MaterialCommunityIcons name="check-circle-outline" size={24} color="#FFF" />
              <Text style={styles.logButtonText}>Log Food</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 44,
  },

  contentWrap: {
    flex: 1,
    paddingHorizontal: 24,
  },

  titleBlock: {
    marginTop: 8,
    marginBottom: 24,
  },
  hugeTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },

  sectionHeaderWrap: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },

  servingInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  servingPrefix: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 8,
  },
  numericInput: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    minWidth: 32,
    borderBottomWidth: 2,
    borderColor: Colors.primary,
    textAlign: 'center',
    paddingVertical: 2,
  },
  servingSuffix: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },

  caloriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  calCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginLeft: 6,
  },
  calCardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calHugeNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  calUnitText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9CA3AF',
    marginLeft: 6,
  },

  tripleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  macroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  macroCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
  },
  macroValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroBaseNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  macroBaseUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 2,
  },

  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  mealPill: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  mealPillActive: {
    backgroundColor: Colors.primary,
  },
  mealPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  mealPillTextActive: {
    color: '#FFFFFF',
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  logButton: {
    height: 64,
    backgroundColor: '#059669', // Specific explicit deep Green identically matching actual aesthetics Native 
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  logBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 8,
  }
});
