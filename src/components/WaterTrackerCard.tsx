import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { updateWaterLog } from '../services/logService';

export function WaterTrackerCard({
  targetLiters,
  consumedGlasses,
  selectedDate,
  onWaterLogged
}: {
  targetLiters: number;
  consumedGlasses: number;
  selectedDate: Date;
  onWaterLogged?: () => void; // Trigger a dashboard refresh
}) {
  const { user } = useAuth();
  
  // Safe Fallbacks
  const tLiters = targetLiters || 2.5;
  const cGlasses = consumedGlasses || 0;
  const maxGlasses = 9; // User rigidly specified exactly 9 glasses dynamically calculating exact mapping

  // 1 glass = targetLiters / 9 (dynamically dividing exact fractions mapped logically per physical image)
  const glassVolumeLiters = (tLiters / maxGlasses).toFixed(2); 

  const handleGlassToggle = async () => {
    if (!user) return;
    const fillAmount = cGlasses < maxGlasses ? 1 : 0; 
    
    // Add 1 glass natively parsing explicitly standard 250ml mappings structurally safely
    await updateWaterLog(user.uid, selectedDate, 1, 250);
    if(onWaterLogged) onWaterLogged();
  };

  const decrementGlass = async () => {
    if (!user || cGlasses <= 0) return;
    await updateWaterLog(user.uid, selectedDate, -1, -250);
    if(onWaterLogged) onWaterLogged();
  }

  const glassesLeft = Math.max(0, maxGlasses - cGlasses);

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.cardTitle}>Water</Text>
          <Text style={styles.subtitle}>({glassVolumeLiters}L / glass)</Text>
        </View>
      </View>

      {/* Glasses Row */}
      <View style={styles.glassesContainer}>
        {[...Array(maxGlasses)].map((_, i) => {
          const isFilled = i < cGlasses;
          return (
            <TouchableOpacity 
              key={i} 
              onPress={isFilled ? decrementGlass : handleGlassToggle}
              activeOpacity={0.7}
            >
              <Image 
                source={isFilled ? require('../../assets/images/full_glass.png') : require('../../assets/images/empty_glass.png')} 
                style={styles.glassIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer Text */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          {glassesLeft === 0 
            ? "Daily Goal Met! Excellent Hydration 💧" 
            : `${glassesLeft} ${glassesLeft === 1 ? 'glass' : 'glasses'} of water left`}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16, 
    padding: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  glassesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  glassIcon: {
    width: 28, // Scaled precisely fitting exactly 9 elements securely inside horizontal viewport boundaries!
    height: 40,
  },
  footerRow: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  }
});
