import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { addMealLog } from '../services/logService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [targetDateStr, setTargetDateStr] = useState<string>("Today");
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  
  const [title, setTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fats, setFats] = useState('');
  const [carbs, setCarbs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Safely retrieve the date context defined by the Dashboard's DateStrip
    const fetchContextDate = async () => {
      const stored = await AsyncStorage.getItem('lastSelectedDate');
      if (stored) {
        const d = new Date(stored);
        setTargetDate(d);
        // Format it nicely for the header
        const isToday = d.toDateString() === new Date().toDateString();
        setTargetDateStr(isToday ? "Today" : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      }
    };
    fetchContextDate();
  }, []);

  const handleSave = async () => {
    if (!user?.uid) return;
    if (!title || !calories) {
      Alert.alert("Missing Fields", "Please enter a Meal Name and Calories.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addMealLog(user.uid, targetDate, {
        title,
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        fats: parseInt(fats) || 0,
        carbs: parseInt(carbs) || 0,
      });

      // Clear the target context locally so it doesn't artificially persist wildly
      await AsyncStorage.removeItem('lastSelectedDate'); 
      router.back();
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Could not save daily log.");
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Log Meal</Text>
          <Text style={styles.headerSubtitle}>Adding to {targetDateStr}</Text>
        </View>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.formContainer}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Meal Name</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={Colors.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Grilled Chicken Salad"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total Calories</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF9800" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="0 kcal"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
          </View>
        </View>

        {/* 3-Column Macro Row Layout */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Protein (g)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 12 }]}>
            <Text style={styles.label}>Fats (g)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={fats}
                onChangeText={setFats}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Carbs (g)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
              />
            </View>
          </View>
        </View>

      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSave} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
              <Text style={styles.submitText}>Save Log</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 22,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  }
});
