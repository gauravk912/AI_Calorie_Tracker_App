import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { MealLog, ExerciseLog } from '../services/logService';

type ActivityItem = {
  id: string;
  recordType: 'meal' | 'exercise';
  title: string;
  timestamp: number;
  calories: number;
  // Meal specific
  protein?: number;
  fats?: number;
  carbs?: number;
  // Exercise specific
  intensity?: string;
  durationMins?: number;
};

export function RecentActivity({ meals = [], exercises = [] }: { meals?: MealLog[], exercises?: ExerciseLog[] }) {
  
  // Natively consolidate disparate payload arrays evaluating universal timestamps
  const combinedActivities: ActivityItem[] = [
    ...meals.map(m => ({
       id: m.id,
       recordType: 'meal' as const,
       title: m.title || (m as any).name || (m as any).mealType || 'Analyzed Food',
       timestamp: m.timestamp,
       calories: m.calories,
       protein: m.protein,
       fats: m.fats,
       carbs: m.carbs
    })),
    ...exercises.map(e => ({
       id: e.id,
       recordType: 'exercise' as const,
       title: e.title,
       timestamp: e.timestamp,
       calories: e.caloriesBurned,
       intensity: e.intensity,
       durationMins: e.durationMins
    }))
  ];

  // Force pure descending chronological alignment organically capping length at 5 strictly
  const topActivities = combinedActivities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  if (topActivities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="food-apple-outline" size={56} color={Colors.textMuted} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Activity Found</Text>
          <Text style={styles.emptySubtitle}>Log your first meal or exercise using the + button to start tracking your daily activity!</Text>
        </View>
      </View>
    );
  }

  const formatAMPM = (timestamp: number) => {
    const d = new Date(timestamp);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  const renderIcon = (item: ActivityItem) => {
    if (item.recordType === 'meal') {
      return (
        <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '12' }]}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={26} color={Colors.primary} />
        </View>
      );
    }
    
    // Exercise specific logic securely analyzing string identifiers
    if (item.title === 'Weight Lifting') {
      return (
        <View style={[styles.iconWrapper, { backgroundColor: '#E0F7FA' }]}>
          <MaterialCommunityIcons name="dumbbell" size={26} color="#00BCD4" />
        </View>
      );
    }
    if (item.title === 'Cardio' || item.title === 'Run') {
      return (
        <View style={[styles.iconWrapper, { backgroundColor: '#FFEBEE' }]}>
          <MaterialCommunityIcons name="shoe-sneaker" size={26} color="#F44336" />
        </View>
      );
    }
    
    // Manual fallback organically rendering UI map arrays specifically 
    return (
      <View style={[styles.iconWrapper, { backgroundColor: '#FFF8E1' }]}>
         <MaterialCommunityIcons name="fire" size={26} color="#FFC107" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.listContainer}>
        {topActivities.map((item) => (
          <View key={item.id} style={styles.activityCard}>
            
            {renderIcon(item)}

            <View style={styles.cardContent}>
              
              {/* Header Header */}
              <View style={styles.rowBetween}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.timeTag}>{formatAMPM(item.timestamp)}</Text>
              </View>

              {/* Fire / Calorie Indicator Matrix */}
              <View style={[styles.rowAlign, { marginTop: 6, marginBottom: 8 }]}>
                <MaterialCommunityIcons 
                  name={item.recordType === 'exercise' ? "fire" : "food-apple"} 
                  size={20} 
                  color="#4CAF50" 
                />
                <Text style={styles.calsText}>{item.calories} <Text style={{fontSize: 14}}>kcal</Text></Text>
              </View>

              {/* Contextual Meta Tracking String logic */}
              {item.recordType === 'exercise' ? (
                <View style={styles.metaColumn}>
                  {item.intensity && (
                    <View style={styles.rowAlign}>
                      <MaterialCommunityIcons name="lightning-bolt-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.metaLabel}> Intensity: <Text style={styles.metaBold}>{item.intensity}</Text></Text>
                    </View>
                  )}
                  {item.durationMins && (
                    <View style={[styles.rowAlign, item.intensity && { marginTop: 4 }]}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.metaLabel}> Duration: <Text style={styles.metaBold}>{item.durationMins} min</Text></Text>
                    </View>
                  )}
                  {/* Dedicated string layout explicitly dropping descriptor cleanly mapping manual forms */}
                  {!item.intensity && !item.durationMins && (
                    <Text style={[styles.metaLabel, { fontStyle: 'italic', marginTop: 8 }]}>Manual Entry</Text>
                  )}
                </View>
              ) : (
                <View style={styles.metaColumn}>
                  <Text style={styles.metaLabel}>
                    P: <Text style={styles.metaBold}>{item.protein}g</Text>  •  
                    F: <Text style={styles.metaBold}>{item.fats}g</Text>  •  
                    C: <Text style={styles.metaBold}>{item.carbs}g</Text>
                  </Text>
                </View>
              )}

            </View>

          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24, 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  
  // Empty State logic safely retained seamlessly 
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },

  listContainer: {
    gap: 16, // Loosened up mimicking the SS arrays distinctly 
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    // Deep structural shadows executing native premium UI mockups safely
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  cardContent: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  timeTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calsText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#388E3C', // Deep Green mapped explicitly corresponding organically to UI logic matrices 
    marginLeft: 6,
  },

  metaColumn: {
    marginTop: 2,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  metaBold: {
    fontWeight: '800',
    color: '#374151',
  }
});
