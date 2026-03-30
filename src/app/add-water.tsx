import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { updateWaterLog } from '../services/logService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Constants matching exact user scaling logic cleanly
const GLASS_SIZE_ML = 250;
const INCREMENT_ML = 125;
const MAX_ML = 1000;

export default function AddWaterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [totalMl, setTotalMl] = useState<number>(375); // Starting fallback mock matching Screenshot cleanly 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIncrement = () => {
    setTotalMl(prev => Math.min(prev + INCREMENT_ML, MAX_ML));
  };

  const handleDecrement = () => {
    setTotalMl(prev => Math.max(prev - INCREMENT_ML, 0));
  };

  const handleLogWater = async () => {
    if (!user) return;
    if (totalMl === 0) {
       Alert.alert("No Water Added", "Please increase the glass amount before logging.");
       return;
    }

    setIsSubmitting(true);
    try {
      const storedDate = await AsyncStorage.getItem('lastSelectedDate');
      const activeDate = storedDate ? new Date(storedDate) : new Date();

      // Natively convert absolute ML constraints strictly down into physical glass array sizes exactly matching Database hooks (e.g. 125ml / 250ml = 0.5 glasses)
      const glassesToLog = totalMl / GLASS_SIZE_ML;

      // Note: We pass currentGlasses theoretically as `0` knowing the backend mathematically sums directly evaluating raw increment floats exactly!
      // In logService: newCount = Math.max(0, currentGlasses + increment);
      // Since backend fetches `dailyLog` directly dynamically we ONLY pass the float increment explicitly 
      // Safely mapped `totalMl` tracking integers exactly identically bounding `glassesToLog`
      await updateWaterLog(user.uid, activeDate, glassesToLog, totalMl);

      router.push('/(main)');
    } catch (error) {
      Alert.alert("Error logging water", "Could not sync securely to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine precisely how many glasses to draw physically onto the layout mapping bounds
  const numGlassesToRender = Math.max(1, Math.ceil(totalMl / GLASS_SIZE_ML));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      {/* Header Array */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Water Intake</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.centeredContent}>
        
        {/* Dynamic Graphic Constraints Engine mapping array bounds physically resolving empty/full crop masks */}
        <View style={styles.glassesContainer}>
          {Array.from({ length: numGlassesToRender }).map((_, i) => {
             const glassStartMl = i * GLASS_SIZE_ML;
             let fillPercentage = 0;
             if (totalMl >= glassStartMl + GLASS_SIZE_ML) {
                 fillPercentage = 100;
             } else if (totalMl > glassStartMl) {
                 fillPercentage = ((totalMl - glassStartMl) / GLASS_SIZE_ML) * 100;
             }

             return (
               <View key={i} style={styles.glassWrapper}>
                 
                 {/* Empty Background Base Layout */}
                 <Image 
                   source={require('../../assets/images/empty_glass.png')} 
                   style={styles.emptyGlassImg}
                   resizeMode="contain"
                 />

                 {/* Foreground Floating Clipping Matrix mapping explicit Water height strings */}
                 <View style={[styles.clippingBox, { height: `${fillPercentage}%` }]}>
                    <Image 
                      source={require('../../assets/images/full_glass.png')} 
                      style={styles.fullGlassImg}
                      resizeMode="cover" // Specifically cover matching exactly the bounding overlay bottom 
                    />
                 </View>

               </View>
             );
          })}
        </View>

        {/* Counter UI Control Maps */}
        <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.operatorBtn} onPress={handleDecrement} activeOpacity={0.6}>
               <MaterialCommunityIcons name="minus" size={28} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.mathBlock}>
               <Text style={styles.massiveMl}>{totalMl}</Text>
               <Text style={styles.mlTag}>ml</Text>
            </View>

            <TouchableOpacity style={styles.operatorBtn} onPress={handleIncrement} activeOpacity={0.6}>
               <MaterialCommunityIcons name="plus" size={28} color="#9CA3AF" />
            </TouchableOpacity>
        </View>

      </View>

      {/* Persistent Bottom Array Log */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logButton} 
          onPress={handleLogWater} 
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <ActivityIndicator color="#FFF" />
          ) : (
             <Text style={styles.logButtonText}>Log Water</Text>
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

  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between', // Splits heavily allocating upper glasses array and lower Math array structurally
    paddingTop: 80,
    paddingBottom: 40,
  },

  // Graphical Clip Image Bounding Arrays
  glassesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  glassWrapper: {
    width: 120, // Exactly mapping static Mockup scale limits rendering beautifully internally
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGlassImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  clippingBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end', // Crucial: Aligns the inner full_glass dynamically against bottom bounds resolving visual water levels precisely!
  },
  fullGlassImg: {
    width: 120, // Mathematically mirroring exact parent width organically wrapping sizes safely 
    height: 160, // Enforces the image physically preserves its absolute height ratio tracking explicitly 
  },

  // Interface Nodes
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  operatorBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF', // Clean White nesting structurally inside Gray border matching Mockup exactly
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  mathBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  massiveMl: {
    fontSize: 64,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  mlTag: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: -8, // Safely hugs visually beneath numeric string integers heavily
  },

  // Base Commit Matrix
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  logButton: {
    height: 64,
    backgroundColor: '#007AFF', // Solid deep Blue explicitly diverging from Primary Green matching Mockups natively 
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  }
});
