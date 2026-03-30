import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { updateUserMetrics } from '../services/userService';
import { cacheOnboardingStatus } from '../stores/onboardingCache';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LOADING_PHASES = [
  "Analyzing physical stats",
  "Consulting metabolic AI",
  "Balancing macro goals",
  "Structuring hydration tracking",
  "Finalizing blueprint"
];

export default function CalculatingPlanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { metrics } = useLocalSearchParams();
  
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  
  // Synchronization Flags
  const [aiDataReady, setAiDataReady] = useState(false);
  const [uiSequenceComplete, setUiSequenceComplete] = useState(false);
  
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    // Artificial progression of loading steps strictly for UX
    let phase = 0;
    const interval = setInterval(() => {
      if (phase < LOADING_PHASES.length - 1) { // Stop right before the final phase
        setCompletedPhases(prev => [...prev, phase]);
        phase++;
        setCurrentPhase(phase);
      } else {
        // UI Animation has successfully reached the final step
        setUiSequenceComplete(true);
        clearInterval(interval);
      }
    }, 1300); // 1.3 seconds protects against React Native bridge stutters during heavy network fetch

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (metrics && typeof metrics === 'string') {
      try {
        const parsed = JSON.parse(metrics);
        executeAIBlueprintGeneration(parsed);
      } catch (e) {
        setErrorStatus("Invalid JSON metrics structure.");
      }
    } else {
      setErrorStatus("Failed to receive metrics payloads.");
    }
  }, [metrics]);

  // Merge synchronized states: Wait for BOTH AI to finish returning data AND the UI to finish animating
  useEffect(() => {
    if (aiDataReady && uiSequenceComplete) {
      // Complete the very last UI checkmark manually now that both constraints are satisfied!
      setCompletedPhases(prev => [...prev, LOADING_PHASES.length - 1]);
      
      // Hang on the fully checked 'Finalizing blueprint' visual for 1.25 seconds, then boot!
      setTimeout(() => {
        router.replace('/(main)');
      }, 1250);
    }
  }, [aiDataReady, uiSequenceComplete]);

  const executeAIBlueprintGeneration = async (parsedMetrics: any) => {
    if (!user) return;

    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey || apiKey === "YOUR_OPENAI_KEY_HERE") {
        throw new Error("Missing exact OpenAI API Key in .env file.");
      }

      const prompt = `
        You are an elite sports nutritionist AI. I am providing you with my exact physical metrics.
        Please calculate my optimal daily macros and water intake to achieve my specific goal.
        
        My Metrics:
        ${JSON.stringify(parsedMetrics, null, 2)}
        
        Generate a highly personalized fitness strategy based exactly on my age, gender, goal, and workout frequency.
        Your 'fitnessTip' MUST be a highly detailed, personalized 3-sentence paragraph specifically mentioning my traits.
        (For example: "Since your goal is to lose weight as a [Gender] born in [Year] training [Frequency] days a week, your metabolism will require X... Make sure to focus on Y because of Z.").
        
        Make the fitnessTip actually deeply tailored to the provided stats above.
        
        Respond ONLY with a valid JSON object strictly matching this exact signature:
        {
          "dailyCalories": number,
          "proteinGrams": number,
          "carbsGrams": number,
          "fatsGrams": number,
          "waterLiters": number,
          "bmi": number,
          "fitnessTip": string
        }
      `;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a perfect JSON generator. Never wrap the JSON in markdown code blocks, just return pure JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }

      const rawJSON = await response.json();
      const aiPlan = JSON.parse(rawJSON.choices[0].message.content);

      // Systematically lock plan directly into Firestore
      await updateUserMetrics(user.uid, parsedMetrics, aiPlan);
      await cacheOnboardingStatus(true);
      
      // Officially signal that the network payload is acquired and stored!
      setAiDataReady(true);

    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Failed to generate AI architecture.");
    }
  };

  if (errorStatus) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Generation Failed</Text>
        <Text style={styles.errorSubtitle}>{errorStatus}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>AI Blueprint Generation</Text>
      
      <View style={styles.checklistContainer}>
        {LOADING_PHASES.map((phaseText, index) => {
          // A phase is visually completed if it's in the completed array!
          const isCompleted = completedPhases.includes(index);
          const isCurrent = currentPhase === index && !isCompleted;
          
          return (
            <View key={index} style={[styles.checklistItem, isCurrent && styles.checklistItemCurrent]}>
              <View style={styles.iconContainer}>
                {isCompleted ? (
                  <MaterialCommunityIcons name="check-circle" size={28} color={Colors.primary} />
                ) : isCurrent ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <MaterialCommunityIcons name="circle-outline" size={28} color={Colors.border} />
                )}
              </View>
              <Text style={[
                styles.checklistText, 
                isCompleted && styles.checklistTextCompleted,
                isCurrent && styles.checklistTextCurrent
              ]}>
                {phaseText}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 40,
    textAlign: 'center',
  },
  checklistContainer: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    opacity: 0.5,
  },
  checklistItemCurrent: {
    opacity: 1,
  },
  iconContainer: {
    width: 32,
    alignItems: 'flex-start',
  },
  checklistText: {
    fontSize: 18,
    color: Colors.textMuted,
    fontWeight: '500',
    marginLeft: 8,
  },
  checklistTextCurrent: {
    color: Colors.primary,
    fontWeight: '700',
  },
  checklistTextCompleted: {
    color: '#1A1A1A',
  },
  errorTitle: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  errorSubtitle: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
  }
});
