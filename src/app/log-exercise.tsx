import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LogExerciseScreen() {
  const router = useRouter();

  const handleOptionSelect = (option: string) => {
    if (option === 'Manual Flow') {
      router.push('/log-exercise-manual');
    } else {
      router.push({
        pathname: '/log-exercise-details',
        params: { type: option }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      {/* Structural Header Ribbon */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Exercise</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Option 1: Run */}
        <TouchableOpacity style={styles.optionCard} onPress={() => handleOptionSelect('Run')} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="run-fast" size={34} color="#2196F3" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Run</Text>
            <Text style={styles.optionDesc}>Running, walking, Cycling, etc</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Option 2: Weight Lifting */}
        <TouchableOpacity style={styles.optionCard} onPress={() => handleOptionSelect('Weight Lifting')} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
            <MaterialCommunityIcons name="weight-lifter" size={34} color="#9C27B0" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Weight lifting</Text>
            <Text style={styles.optionDesc}>Gym, machine, etc</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Option 3: Manual Logging */}
        <TouchableOpacity style={styles.optionCard} onPress={() => handleOptionSelect('Manual Flow')} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
            <MaterialCommunityIcons name="fire" size={34} color="#FF9800" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Manual</Text>
            <Text style={styles.optionDesc}>Enter calories burn manually</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Standard sleek application canvas tint
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
    width: 48, // Balances header cleanly mapping empty box specifically centering Title String
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  }
});
