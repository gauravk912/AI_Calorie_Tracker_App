import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { addExerciseLog } from '../services/logService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogExerciseSuccessScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Natively intercepting dynamic mathematical payload parameters pushed down from parent forms explicitly
  const { title, durationMins, intensity, burn } = useLocalSearchParams<{ 
    title: string; 
    durationMins: string; 
    intensity: string; 
    burn: string; 
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exact Database Sync pushing data only when authorized by user directly interacting with the green Submit node!
  const executeFinalCommit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const storedDate = await AsyncStorage.getItem('lastSelectedDate');
      const activeDate = storedDate ? new Date(storedDate) : new Date();
      
      const parsedDuration = parseInt(durationMins) || 0;
      const parsedBurn = parseInt(burn) || 0;

      await addExerciseLog(user.uid, activeDate, {
        title: title || 'Workout',
        intensity: intensity,
        durationMins: parsedDuration,
        caloriesBurned: parsedBurn,
      });

      router.push('/(main)');
    } catch (error) {
      Alert.alert("Error logging exercise", "Please check your network and try again.");
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
      </View>

      <View style={styles.centeredContent}>
        
        {/* Central Fire Layout Badge Engine */}
        <View style={styles.flameCircle}>
          <MaterialCommunityIcons name="fire" size={64} color="#FF9800" />
        </View>

        <Text style={styles.successPrompt}>Your {title || 'workout'} burned</Text>
        
        {/* Massive dynamic mathematical payload integer mapping */}
        <View style={styles.calsContainer}>
          <Text style={styles.calsNumber}>{burn || '0'}</Text>
          <Text style={styles.calsLabel}>Cals</Text>
        </View>
        
        {/* Secondary metric tag array displaying explicit parameter history context */}
        <View style={styles.metaBadgeContainer}>
           <View style={styles.metaBadge}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.metaText}>{durationMins} min</Text>
           </View>
           <View style={styles.metaBadge}>
              <MaterialCommunityIcons name="lightning-bolt-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.metaText}>{intensity}</Text>
           </View>
        </View>

      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logButton} 
          onPress={executeFinalCommit} 
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
             <Text style={styles.logButtonText}>Log Workout</Text>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Soft off-white mapping identical UX boundaries 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -40, // Perfectly balances layout constraints mapping Fire Logo organically
  },
  flameCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF3E0', // Soft Orange specifically referencing mapping fire badge arrays
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    // Elaborative outer shadow bounding light emission aesthetically 
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  successPrompt: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  calsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  calsNumber: {
    fontSize: 84, // Statically Massive Font Weight pulling dynamic constraints natively
    fontWeight: '900',
    color: '#FF9800',
    letterSpacing: -2,
    includeFontPadding: false,
    height: 96,
  },
  calsLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9CA3AF',
    marginLeft: 12,
    marginBottom: 12, // Baseline alignment offsets specifically mapped explicitly
  },

  metaBadgeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  logButton: {
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
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
