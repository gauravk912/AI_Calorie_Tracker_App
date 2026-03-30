import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

type IntensityLevel = 'Low' | 'Medium' | 'High';

export default function LogExerciseDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { type } = useLocalSearchParams<{ type: string }>();
  const exerciseType = type || 'Workout';

  // Form State
  const [intensity, setIntensity] = useState<IntensityLevel>('Medium');
  const [activeDuration, setActiveDuration] = useState<number | null>(null); // In minutes natively
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer State hooks
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeElapsedSec, setTimeElapsedSec] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsedSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const toggleTimer = () => {
    if (!timerRunning) {
      // Starting the timer overrides static duration picks naturally resolving UX conflict
      setActiveDuration(null);
    }
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeElapsedSec(0);
  };

  const handleChipSelect = (mins: number) => {
    setTimerRunning(false);
    setTimeElapsedSec(0); // Erases dynamic time mapping specifically resolving UX overlap explicitly
    setActiveDuration(mins);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async () => {
    let finalDurationMins = activeDuration;
    if (!finalDurationMins) {
      if (timeElapsedSec > 0) {
        finalDurationMins = Math.max(1, Math.round(timeElapsedSec / 60)); // Minimum 1 min
      } else {
        Alert.alert("Missing Duration", "Please pick a duration chip or run the timer before logging.");
        return;
      }
    }

    if (!user) return;
    setIsSubmitting(true);

    try {
      // Pull explicit Physical variables natively from Onboarding database
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const metrics = userSnap.data()?.metrics || {};

      let age = 30; // Default fallback securely mapping mathematical stability
      if (metrics.dob?.year) {
        age = new Date().getFullYear() - parseInt(metrics.dob.year);
      }

      let weightKg = 70; // Default fallback
      if (metrics.weight) {
        // Assume pounds mapped from string organically translating to KG for rigorous Keytel math
        weightKg = parseInt(metrics.weight) / 2.20462;
      }

      const gender = metrics.gender === 'Female' ? 'Female' : 'Male';

      // Advanced Heart Rate Energy Proxies (Keytel et al. 2005 constraints)
      let estimatedHR = 135; // Medium
      if (intensity === 'Low') estimatedHR = 110;
      if (intensity === 'High') estimatedHR = 160;

      let estimatedBurn = 0;
      if (gender === 'Male') {
        // [(Age x 0.2017) - (Weight_kg x 0.09036) + (HR x 0.6309) - 55.0969] x Time / 4.184
        const joules = (age * 0.2017) - (weightKg * 0.09036) + (estimatedHR * 0.6309) - 55.0969;
        estimatedBurn = (joules * finalDurationMins) / 4.184;
      } else {
        // [(Age x 0.074) - (Weight_kg x 0.05741) + (HR x 0.4472) - 20.4022] x Time / 4.184
        const joules = (age * 0.074) - (weightKg * 0.05741) + (estimatedHR * 0.4472) - 20.4022;
        estimatedBurn = (joules * finalDurationMins) / 4.184;
      }

      // Safeguard enforcing minimal organic burns preventing negative strings organically
      estimatedBurn = Math.max(10, Math.round(estimatedBurn));

      // Route parameters cleanly forwarding payload arrays exclusively evaluating Success Splash
      router.push({
        pathname: '/log-exercise-success',
        params: {
          title: exerciseType,
          intensity: intensity,
          durationMins: finalDurationMins,
          burn: estimatedBurn
        }
      });

    } catch (error) {
      Alert.alert("Error computing parameters", "Could not securely calculate Burn math.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      {/* Structural Native Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exerciseType}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.description}>Track your {exerciseType.toLowerCase()} metrics explicitly.</Text>

        {/* 1. Custom Intensity Segmented Control Map (Pill Design) */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightning-bolt-outline" size={20} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitleSmall}>Intensity</Text>
          </View>
          
          <View style={styles.segmentContainer}>
            {(['Low', 'Medium', 'High'] as IntensityLevel[]).map((level) => {
              const isActive = intensity === level;
              return (
                <TouchableOpacity 
                  key={level} 
                  style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                  onPress={() => setIntensity(level)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{level}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Duration Chips */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitleSmall, { marginBottom: 16 }]}>Quick Duration</Text>
          <View style={styles.chipsContainer}>
            {[15, 30, 60, 90].map((mins) => {
              const isActive = activeDuration === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  style={[styles.chipBase, isActive && styles.chipActive]}
                  onPress={() => handleChipSelect(mins)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{mins} min</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Live Embedded Stopwatch */}
        <View style={[styles.sectionBlock, styles.timerCard]}>
          <Text style={[styles.sectionTitleSmall, { marginBottom: 12 }]}>Stopwatch</Text>
          
          <Text style={styles.timerClockText}>{formatTime(timeElapsedSec)}</Text>
          
          <View style={styles.timerControls}>
            <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
              <MaterialCommunityIcons name="refresh" size={24} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.playBtn, timerRunning && styles.pauseBtn]} 
              onPress={toggleTimer}
            >
              <MaterialCommunityIcons 
                name={timerRunning ? "pause" : "play"} 
                size={32} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.stopBtn} onPress={() => setTimerRunning(false)}>
              <MaterialCommunityIcons name="stop" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Heavy Bottom Anchored Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8} disabled={isSubmitting}>
          {isSubmitting ? (
             <ActivityIndicator color="#FFF" />
          ) : (
             <Text style={styles.submitText}>Complete & Log</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 48, 
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24, // Squeezed bottom safety mapped exactly avoiding excess scrolling natively
    gap: 16, // Globally squashed gaps compressing views natively into a single bound
  },
  description: {
    fontSize: 14, // Squished
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Tighter corner bounds physically mapping less excess layout
    padding: 16, // Thinner internal bounds mapping constraints tightly
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleSmall: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  // Pill Segment Control Map
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // The light grey exact background capsule bound
    borderRadius: 16,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12, // Nestled carefully exactly inside the structural container background maps
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.primary,
  },

  // Chips Engine
  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  chipBase: {
    flex: 1,
    height: 44, // Squish height tightly
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Timer Engine
  timerCard: {
    alignItems: 'center',
  },
  timerClockText: {
    fontSize: 52, // Brutally hacked to fit safely into viewport ranges avoiding scroll overflow explicitly
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 2,
    marginBottom: 16,
    fontVariant: ['tabular-nums'], 
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  resetBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 64, // Squished Play node
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  pauseBtn: {
    backgroundColor: '#FF9800', // Fire-orange warning mapping strictly dropping into paused boundaries
    shadowColor: '#FF9800',
  },

  // Final Action Component
  submitButton: {
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  }
});
