import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { updateUserMetrics } from '../services/userService';
import { cacheOnboardingStatus } from '../stores/onboardingCache';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [workoutDays, setWorkoutDays] = useState('');
  
  // DOB
  const [dobDate, setDobDate] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  
  // Stats
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightLbs, setWeightLbs] = useState('');

  // Dynamic Theming
  const accentColor = gender === 'Female' ? '#FF2D55' : (gender === 'Male' ? '#007AFF' : Colors.primary);
  const accentBg = gender === 'Female' ? '#FDECF4' : (gender === 'Male' ? '#E6F4FE' : Colors.primary + '10');

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishOnboarding = () => {
    if (!user) return;
    setLoading(true);
    
    const metrics = {
      gender,
      goal,
      workoutDays,
      dob: { date: dobDate, month: dobMonth, year: dobYear },
      height: { feets: heightFt, inches: heightIn },
      weight: weightLbs,
    };

    router.replace({ 
      pathname: '/calculating-plan', 
      params: { metrics: JSON.stringify(metrics) } 
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return gender !== '';
      case 2: return goal !== '';
      case 3: return workoutDays !== '';
      case 4: return dobDate.length > 0 && dobMonth.length > 0 && dobYear.length === 4;
      case 5: return heightFt.length > 0 && heightIn.length > 0 && weightLbs.length > 0;
      default: return false;
    }
  };

  const renderProgressBar = () => {
    const progress = (step / TOTAL_STEPS) * 100;
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: accentColor }]} />
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>What is your gender?</Text>
      <Text style={styles.subtitle}>Helps us calculate your metabolic rate accurately.</Text>
      
      <View style={styles.optionsRow}>
        <TouchableOpacity 
          style={[
            styles.card, 
            gender === 'Male' && { borderColor: '#007AFF', backgroundColor: '#E6F4FE' }
          ]} 
          onPress={() => setGender('Male')}
        >
          <MaterialCommunityIcons 
            name="gender-male" 
            color={gender === 'Male' ? '#007AFF' : Colors.text} 
            size={48} 
          />
          <Text style={[styles.cardText, { color: gender === 'Male' ? '#007AFF' : Colors.text }]}>Male</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.card, 
            gender === 'Female' && { borderColor: '#FF2D55', backgroundColor: '#FDECF4' }
          ]} 
          onPress={() => setGender('Female')}
        >
          <MaterialCommunityIcons 
            name="gender-female" 
            color={gender === 'Female' ? '#FF2D55' : Colors.text} 
            size={48} 
          />
          <Text style={[styles.cardText, { color: gender === 'Female' ? '#FF2D55' : Colors.text }]}>Female</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => {
    const goalsList = [
      { id: 'Lose weight', title: 'Lose Weight', icon: 'trending-down' },
      { id: 'Maintain', title: 'Maintain Weight', icon: 'scale-balance' },
      { id: 'Gain weight', title: 'Gain Weight', icon: 'trending-up' }
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>What is your primary goal?</Text>
        <Text style={styles.subtitle}>We'll adjust your daily intake targets based on this.</Text>
        
        {goalsList.map(g => (
          <TouchableOpacity 
            key={g.id}
            style={[styles.rowCard, goal === g.id && { borderColor: accentColor, backgroundColor: accentBg }]} 
            onPress={() => setGoal(g.id)}
          >
            <MaterialCommunityIcons name={g.icon as any} color={goal === g.id ? accentColor : Colors.text} size={28} />
            <Text style={[styles.rowCardText, { color: goal === g.id ? accentColor : Colors.text }]}>{g.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStep3 = () => {
    const frequencyList = [
      { id: '2-3 Days', icon: 'walk' },
      { id: '3-4 Days', icon: 'run' },
      { id: '5-6 Days', icon: 'weight-lifter' }
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Workout Frequency</Text>
        <Text style={styles.subtitle}>How many days a week do you train?</Text>
        
        {frequencyList.map(f => (
          <TouchableOpacity 
            key={f.id}
            style={[styles.rowCard, workoutDays === f.id && { borderColor: accentColor, backgroundColor: accentBg }]} 
            onPress={() => setWorkoutDays(f.id)}
          >
            <MaterialCommunityIcons name={f.icon as any} color={workoutDays === f.id ? accentColor : Colors.text} size={28} />
            <Text style={[styles.rowCardText, { color: workoutDays === f.id ? accentColor : Colors.text }]}>{f.id}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>When were you born?</Text>
      <Text style={styles.subtitle}>Your age affects how many calories you burn.</Text>
      
      <View style={styles.dateInputRow}>
        <TextInput
          style={[styles.dateInput, dobDate.length > 0 && { borderColor: accentColor }]}
          placeholder="DD"
          placeholderTextColor={Colors.border}
          keyboardType="number-pad"
          maxLength={2}
          value={dobDate}
          onChangeText={setDobDate}
        />
        <TextInput
          style={[styles.dateInput, dobMonth.length > 0 && { borderColor: accentColor }]}
          placeholder="MM"
          placeholderTextColor={Colors.border}
          keyboardType="number-pad"
          maxLength={2}
          value={dobMonth}
          onChangeText={setDobMonth}
        />
        <TextInput
          style={[styles.dateInput, { flex: 1.5 }, dobYear.length === 4 && { borderColor: accentColor }]}
          placeholder="YYYY"
          placeholderTextColor={Colors.border}
          keyboardType="number-pad"
          maxLength={4}
          value={dobYear}
          onChangeText={setDobYear}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Physical Stats</Text>
      <Text style={styles.subtitle}>Last step! We need your height and weight.</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.inputLabel}>Height</Text>
        <View style={styles.dateInputRow}>
          <View style={[styles.inputWithSuffix, heightFt.length > 0 && { borderColor: accentColor }]}>
            <TextInput
              style={styles.statsInput}
              placeholder="0"
              placeholderTextColor={Colors.border}
              keyboardType="number-pad"
              value={heightFt}
              onChangeText={setHeightFt}
            />
            <Text style={styles.suffix}>ft</Text>
          </View>
          <View style={[styles.inputWithSuffix, heightIn.length > 0 && { borderColor: accentColor }]}>
            <TextInput
              style={styles.statsInput}
              placeholder="0"
              placeholderTextColor={Colors.border}
              keyboardType="number-pad"
              value={heightIn}
              onChangeText={setHeightIn}
            />
            <Text style={styles.suffix}>in</Text>
          </View>
        </View>

        <Text style={[styles.inputLabel, { marginTop: 24 }]}>Weight</Text>
        <View style={[styles.inputWithSuffix, { width: '50%' }, weightLbs.length > 0 && { borderColor: accentColor }]}>
          <TextInput
            style={styles.statsInput}
            placeholder="0"
            placeholderTextColor={Colors.border}
            keyboardType="number-pad"
            value={weightLbs}
            onChangeText={setWeightLbs}
          />
          <Text style={styles.suffix}>lbs</Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : <View style={styles.backButton} />}
        <Text style={styles.stepProgressText}>Step {step} of {TOTAL_STEPS}</Text>
        <View style={styles.backButton} />
      </View>

      {renderProgressBar()}

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            { backgroundColor: accentColor, shadowColor: accentColor },
            !isStepValid() && styles.primaryButtonDisabled
          ]} 
          onPress={handleNext} 
          disabled={!isStepValid() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{step === TOTAL_STEPS ? 'Finish & Save' : 'Continue'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  stepProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.border,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 40,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  rowCardText: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    height: 80,
  },
  statsContainer: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWithSuffix: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 80,
  },
  statsInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  suffix: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.border + '80', // Dim border for disabled
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
});
