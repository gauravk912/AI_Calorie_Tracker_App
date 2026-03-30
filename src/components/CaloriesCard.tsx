import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { updateAiPlan } from '../services/userService';

const { width } = Dimensions.get('window');

// Mathematics to calculate explicit top-half SVG arcs
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees + 180) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const arcPath = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, 0, 1, end.x, end.y
  ].join(" ");
};

// Subcomponent for Macro Cards
const MacroCard = ({ icon, iconColor, label, value }: { icon: any, iconColor: string, label: string, value: string }) => (
  <View style={styles.macroCard}>
    <MaterialCommunityIcons name={icon} size={24} color={iconColor} style={styles.macroIcon} />
    <Text style={styles.macroValue}>{value}</Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

export interface MacroSet {
  dailyCalories: number;
  proteinGrams: number;
  fatsGrams: number;
  carbsGrams: number;
}

export function CaloriesCard({
  targetMacros,
  consumedMacros,
  targetWater,
  burnedCalories = 0,
  onUpdateTarget
}: {
  targetMacros: MacroSet | null,
  consumedMacros: MacroSet | null,
  targetWater?: number,
  burnedCalories?: number,
  onUpdateTarget?: (newTargets: MacroSet, newWaterLiters?: number) => void
}) {
  const { user } = useAuth();

  // Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editCals, setEditCals] = useState('');
  const [editWater, setEditWater] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editFats, setEditFats] = useState('');
  const [editCarbs, setEditCarbs] = useState('');

  // Safe Fallback mathematical mapping protecting UI rendering
  const t = targetMacros || { dailyCalories: 2000, proteinGrams: 150, fatsGrams: 70, carbsGrams: 250 };
  const c = consumedMacros || { dailyCalories: 0, proteinGrams: 0, fatsGrams: 0, carbsGrams: 0 };

  const handleOpenEdit = () => {
    setEditCals(t.dailyCalories.toString());
    setEditWater(targetWater ? targetWater.toString() : '2.5');
    setEditProtein(t.proteinGrams.toString());
    setEditFats(t.fatsGrams.toString());
    setEditCarbs(t.carbsGrams.toString());
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const newWater = parseFloat(editWater) || targetWater || 2.5;
      const newPlan = {
        ...t, // retains unedited keys like BMI
        dailyCalories: parseInt(editCals) || t.dailyCalories,
        proteinGrams: parseInt(editProtein) || t.proteinGrams,
        fatsGrams: parseInt(editFats) || t.fatsGrams,
        carbsGrams: parseInt(editCarbs) || t.carbsGrams,
        waterLiters: newWater
      };

      await updateAiPlan(user.uid, newPlan);

      if (onUpdateTarget) onUpdateTarget(newPlan, newWater);
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "Could not update target counts.");
    } finally {
      setIsSaving(false);
    }
  };

  const remainingCals = Math.max(0, t.dailyCalories - c.dailyCalories + burnedCalories);
  // Physical Progress calculates standard completion out of the target natively, but offset by Burn tracking loosely
  const progressRatio = t.dailyCalories > 0 ? (c.dailyCalories / t.dailyCalories) : 0;

  // Mathematically clamps the UI progression algorithm making absolutely sure it renders identically between 0 (Empty) and 1 (Full)
  const clampedRatio = Math.min(1, Math.max(0, progressRatio));

  const totalSegments = 14;
  const filledSegments = Math.round(clampedRatio * totalSegments);

  const segmentGap = 1.5;
  const totalGapSpace = (totalSegments - 1) * segmentGap;
  const segmentAngle = (180 - totalGapSpace) / totalSegments;

  const chartWidth = 260;
  const chartHeight = 130; // Granted more breathing room for longer tracer strokes
  const radius = 92; // Slightly condensed to avoid clipping the heavily elongated stroke logic
  const cx = chartWidth / 2;
  const cy = chartHeight - 10;

  return (
    <View style={styles.cardContainer}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Calories</Text>
        <TouchableOpacity onPress={handleOpenEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="pencil-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Segmented Half-Circle Graph */}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {Array.from({ length: totalSegments }).map((_, i) => {
            const startAngle = i * (segmentAngle + segmentGap);
            const endAngle = startAngle + segmentAngle;
            const isActive = i < filledSegments;

            return (
              <Path
                key={i}
                d={arcPath(cx, cy, radius, startAngle, endAngle)}
                stroke={isActive ? Colors.primary : "#EAEAEA"}
                strokeWidth={45} // Explicitly elongated bars radially
                strokeLinecap="butt"
                fill="none"
              />
            );
          })}
        </Svg>

        {/* Inner Text Center Payload */}
        <View style={styles.chartTextContainer}>
          <MaterialCommunityIcons name="fire" size={28} color="#FF9800" style={styles.fireIcon} />
          <Text style={styles.calorieText}>{remainingCals}</Text>
          <Text style={styles.remainingText}>Remaining</Text>
        </View>
      </View>

      {/* Bottom Macros Row */}
      <View style={styles.macrosRow}>
        <MacroCard icon="dumbbell" iconColor={Colors.primary} label="Protein Left" value={`${Math.max(0, t.proteinGrams - c.proteinGrams)}g`} />
        <MacroCard icon="fire" iconColor="#FF9800" label="Fats Left" value={`${Math.max(0, t.fatsGrams - c.fatsGrams)}g`} />
        <MacroCard icon="rice" iconColor="#2196F3" label="Carbs Left" value={`${Math.max(0, t.carbsGrams - c.carbsGrams)}g`} />
      </View>

      {/* Editing Modal Overlay */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Daily Targets</Text>

            {/* Daily Calories Section */}
            <Text style={styles.modalSectionLabel}>Daily Calories</Text>
            <View style={styles.editRowMain}>
              <TextInput
                style={styles.modalInputMain}
                keyboardType="numeric"
                value={editCals}
                onChangeText={setEditCals}
                placeholder="1800"
              />
            </View>

            {/* Water Goal Section */}
            <Text style={[styles.modalSectionLabel, { marginTop: 16 }]}>Water Goal (Liters)</Text>
            <View style={styles.editRowMain}>
              <TextInput 
                style={styles.modalInputMain} 
                keyboardType="numeric" 
                value={editWater} 
                onChangeText={setEditWater} 
                placeholder="2.5" 
              />
            </View>

            {/* Macros Section */}
            <Text style={[styles.modalSectionLabel, { marginTop: 16 }]}>Macros</Text>
            <View style={styles.macrosEditContainer}>

              {/* Protein Col */}
              <View style={styles.macroEditCol}>
                <View style={styles.macroEditHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={16} color={Colors.primary} />
                  <Text style={styles.macroEditLabel}>Protein</Text>
                </View>
                <View style={styles.editRowSub}>
                  <TextInput style={styles.modalInputSub} keyboardType="numeric" value={editProtein} onChangeText={setEditProtein} />
                  <Text style={styles.inputSuffix}>g</Text>
                </View>
              </View>

              {/* Fats Col */}
              <View style={styles.macroEditCol}>
                <View style={styles.macroEditHeader}>
                  <MaterialCommunityIcons name="fire" size={16} color="#FF9800" />
                  <Text style={styles.macroEditLabel}>Fats</Text>
                </View>
                <View style={styles.editRowSub}>
                  <TextInput style={styles.modalInputSub} keyboardType="numeric" value={editFats} onChangeText={setEditFats} />
                  <Text style={styles.inputSuffix}>g</Text>
                </View>
              </View>

              {/* Carbs Col */}
              <View style={styles.macroEditCol}>
                <View style={styles.macroEditHeader}>
                  <MaterialCommunityIcons name="rice" size={16} color="#2196F3" />
                  <Text style={styles.macroEditLabel}>Carbs</Text>
                </View>
                <View style={styles.editRowSub}>
                  <TextInput style={styles.modalInputSub} keyboardType="numeric" value={editCarbs} onChangeText={setEditCarbs} />
                  <Text style={styles.inputSuffix}>g</Text>
                </View>
              </View>

            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)} disabled={isSaving}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveEdit} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSaveText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Slightly tighter radii
    marginHorizontal: 16,
    marginTop: 16, // Collapsed
    padding: 20, // Reduced padding tightly squeezing elements
    // Soft deep shadow replicating the wireframe UI
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
    marginBottom: 4, // Slimmed padding
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 120, // Heavily reduced
    marginTop: 12,
    marginBottom: 16, // Narrowed
  },
  chartTextContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fireIcon: {
    marginBottom: -6,
  },
  calorieText: {
    fontSize: 34, // Dynamically sized down slightly to fit the 120 chart height
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1,
  },
  remainingText: {
    fontSize: 12, // Tighter font layout
    color: Colors.textMuted,
    fontWeight: '500',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.primary + '12',
    borderRadius: 14,
    paddingVertical: 12, // Condensed inner array padding blocks
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroIcon: {
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2, // Margins shifted to support Top-Heavy format
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  editRowMain: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  modalInputMain: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  macrosEditContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroEditCol: {
    flex: 1,
  },
  macroEditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  macroEditLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  editRowSub: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    height: 48,
  },
  modalInputSub: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalSaveBtn: {
    flex: 2, // Wider save button per typical design specs
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: Colors.primary,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  }
});
