import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { addExerciseLog } from '../services/logService';

export default function LogExerciseManualScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [calories, setCalories] = useState(''); // Default mocked exactly via SS
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const burnt = parseInt(calories);
    if (isNaN(burnt) || burnt <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount of calories burned.");
      return;
    }

    if (!user) return;
    setIsSubmitting(true);

    try {
      const storedDate = await AsyncStorage.getItem('lastSelectedDate');
      const activeDate = storedDate ? new Date(storedDate) : new Date();

      await addExerciseLog(user.uid, activeDate, {
        title: 'Manual Entry',
        caloriesBurned: burnt,
        description: description.trim() || undefined,
      });

      router.push('/(main)');
    } catch (error) {
      Alert.alert("Error logging manual calories", "Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Ribbon */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manual Entry</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Flame Badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.flameCircle}>
              <MaterialCommunityIcons name="fire" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.promptText}>How many calories did you burn?</Text>
          </View>

          {/* Epic Input Array */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.hugeInput}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              maxLength={4}
              placeholder="0"
              placeholderTextColor="#D1D5DB"
            />
            <Text style={styles.calLabel}>cal</Text>
          </View>

          {/* Description Block */}
          <View style={styles.descBlock}>
            <Text style={styles.descLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.descInput}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Hiking, Yoga class..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>

        </ScrollView>

        {/* Floating Green Submission Layout */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.logButtonText}>Log Calories</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white background exactly matching SS
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
    backgroundColor: '#F3F4F6',
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
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },

  // Flame Badge map
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  flameCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9', // Soft light green mirroring exactly the mockup arrays
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },

  // Massive Input Map
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 60,
  },
  hugeInput: {
    fontSize: 72,
    fontWeight: '800',
    color: Colors.primary, // Natively mapping the dark Primary Green text from mockup
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    height: 80, // strict boundary constraint protecting height jumping
  },
  calLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#9CA3AF', // Gray 'kcal' tag specifically appended exactly to baseline
    marginBottom: 8,
    marginLeft: 8,
  },

  // Description map
  descBlock: {
    width: '100%',
  },
  descLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  descInput: {
    width: '100%',
    height: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
  },

  // Fixed Bottom Button
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  logButton: {
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 30, // Huge rounded pill exactly matching SS
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  }
});
