import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { addMealLog } from '../services/logService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogFoodDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Natively intercept stringified payload integers directly routed explicitly from the FlatList search!
  const { name, brand, servingDesc, calories, protein, fats, carbs } = useLocalSearchParams<{
    name: string;
    brand: string;
    servingDesc: string;
    calories: string;
    protein: string;
    fats: string;
    carbs: string;
  }>();

  // Parse baseline explicitly securely resolving Base API stats cleanly
  const baseCals = parseInt(calories || "0");
  const basePro = parseFloat(protein || "0");
  const baseFat = parseFloat(fats || "0");
  const baseCarb = parseFloat(carbs || "0");

  const [quantity, setQuantity] = useState<string>("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Scale Generator precisely executing real-time Float bounds based aggressively on the Input multiplier
  const multiplier = parseFloat(quantity) || 0; // Fallback strictly resolving 0 visually mitigating `NaN`
  
  const compCals = Math.round(baseCals * multiplier);
  const compPro = (basePro * multiplier).toFixed(1).replace(/\.0$/, ''); // Rounds softly trimming `.0` natively
  const compFat = (baseFat * multiplier).toFixed(1).replace(/\.0$/, '');
  const compCarb = (baseCarb * multiplier).toFixed(1).replace(/\.0$/, '');

  const handleLogFood = async () => {
    if (!user) return;
    if (multiplier <= 0) {
      Alert.alert("Invalid Size", "Please strictly enter a valid quantity greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const storedDate = await AsyncStorage.getItem('lastSelectedDate');
      const activeDate = storedDate ? new Date(storedDate) : new Date();

      await addMealLog(user.uid, activeDate, {
        title: name || 'Custom Food',
        calories: compCals,
        protein: parseFloat(compPro),
        fats: parseFloat(compFat),
        carbs: parseFloat(compCarb)
      });

      router.push('/(main)');
    } catch (e) {
      Alert.alert("Error logging meal", "Could not safely sync to Firebase backend directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Food</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Core Detail Title Array mirroring exactly SS bounds */}
        <View style={styles.titleBlock}>
          <Text style={styles.foodTitle}>{name}</Text>
          {brand && brand !== 'Generic Base' && (
             <Text style={styles.foodBrand}>{brand}</Text>
          )}
        </View>

        {/* Scalable Multiplier Bounds mapping user edits specifically natively */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>SERVING QUANTITY</Text>
          <View style={styles.inputArrayBox}>
             <TextInput
                style={styles.quantityInput}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                maxLength={4}
                selectTextOnFocus
             />
             <Text style={styles.baseDescriptorTag}>x ({servingDesc})</Text>
          </View>
        </View>

        {/* Master Calorie Core Box natively structuring huge layouts accurately */}
        <View style={styles.calorieCard}>
          <View style={styles.ccRow}>
             <MaterialCommunityIcons name="fire" size={20} color="#EF5350" />
             <Text style={styles.ccLabel}>Calories</Text>
          </View>
          <View style={styles.ccMathRow}>
             <Text style={styles.ccHugeInt}>{compCals}</Text>
             <Text style={styles.ccUnit}>kcal</Text>
          </View>
        </View>

        {/* 3 Macro Data Grid Cells isolating explicitly precisely matching structural mockups identically */}
        <View style={styles.macroGrid}>
          
          <View style={styles.macroCell}>
            <View style={[styles.macroIconCircle, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="pot-mix" size={20} color="#2196F3" />
            </View>
            <Text style={styles.macroCellLabel}>Protein</Text>
            <Text style={styles.macroCellValue}>{compPro} <Text style={styles.macroCellUnit}>g</Text></Text>
          </View>

          <View style={styles.macroCell}>
            <View style={[styles.macroIconCircle, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FF9800" />
            </View>
            <Text style={styles.macroCellLabel}>Fats</Text>
            <Text style={styles.macroCellValue}>{compFat} <Text style={styles.macroCellUnit}>g</Text></Text>
          </View>

          <View style={styles.macroCell}>
            <View style={[styles.macroIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="leaf" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.macroCellLabel}>Carbs</Text>
            <Text style={styles.macroCellValue}>{compCarb} <Text style={styles.macroCellUnit}>g</Text></Text>
          </View>

        </View>
      </ScrollView>

      {/* Persistent Base Log Matrix completely decoupled exactly rendering solid #00BFA5 purely */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logButton} 
          onPress={handleLogFood} 
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <ActivityIndicator color="#FFF" />
          ) : (
             <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <MaterialCommunityIcons name="check-circle-outline" size={24} color="#FFFFFF" />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Extensively slight native bounding shadow structurally matching mockups 
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 44,
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40, 
  },
  
  titleBlock: {
    marginBottom: 28, // Safely isolating primary contexts precisely natively 
  },
  foodTitle: {
    fontSize: 32, // Huge tracking exactly mirroring SS bounding matrices cleanly manually
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  foodBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BFA5', 
  },

  sectionBlock: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 12, 
  },
  inputArrayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  quantityInput: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    width: 60,
    height: '100%',
  },
  baseDescriptorTag: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },

  // Central Calorie Mathematics Block organically nesting cleanly 
  calorieCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 24,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16, 
    // Intense physical native tracking explicitly matching soft mock shadow bounds 
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3, 
  },
  ccRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  ccLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ccMathRow: {
    flexDirection: 'row',
    alignItems: 'baseline', 
    gap: 8,
  },
  ccHugeInt: {
    fontSize: 56,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  ccUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  // 3-Macro Matrix Array cleanly splitting structurally matching identical Mockups 
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  macroIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  macroCellLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  macroCellValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  macroCellUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  logButton: {
    height: 60,
    backgroundColor: '#00BFA5', // Explicit deep vibrant Green pulling exact organic DB bounds cleanly 
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  }
});
