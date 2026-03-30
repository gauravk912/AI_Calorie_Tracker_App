import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, Modal, Text, TouchableWithoutFeedback, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

export function FloatingTabBar({ state, descriptors, navigation }: any) {
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const router = useRouter();

  const handleActionMenu = (action: string) => {
    setActionMenuVisible(false);
    if (action === 'food') {
      router.push('/add-log');
    } else if (action === 'exercise') {
      router.push('/log-exercise');
    } else if (action === 'scan') {
      Alert.alert("Premium Feature", "Scan Food is only available for Premium Paid users!");
    } else if (action === 'water') {
      router.push('/add-water');
    } else {
      // Catch-all
      Alert.alert("Coming Soon", `The ${action} feature is under construction!`);
    }
  };
  return (
    <View style={styles.masterContainer}>

      {/* Primary 3-Tab Navigation Pill */}
      <View style={styles.tabPill}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Map dynamic icons
          let iconName = 'home-outline';
          if (route.name === 'analytics') iconName = 'chart-box-outline';
          if (route.name === 'profile') iconName = 'account-outline';

          if (isFocused) {
            if (route.name === 'index') iconName = 'home';
            if (route.name === 'analytics') iconName = 'chart-box';
            if (route.name === 'profile') iconName = 'account';
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabButton}
            >
              <MaterialCommunityIcons
                name={iconName as any}
                size={34}
                color={isFocused ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Action Button (+), intercepting straight to Grid Menu */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setActionMenuVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Translucent Action Modal Framework */}
      <Modal visible={actionMenuVisible} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setActionMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                
                {/* Top Row */}
                <View style={styles.gridRow}>
                  <TouchableOpacity style={styles.actionCard} onPress={() => handleActionMenu('food')}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons name="database-search" size={28} color={Colors.primary} />
                    </View>
                    <Text style={styles.actionText}>Food Database</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionCard} onPress={() => handleActionMenu('scan')}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons name="line-scan" size={28} color="#FF9800" />
                      {/* Premium Crown Badge */}
                      <View style={styles.premiumBadge}>
                        <MaterialCommunityIcons name="crown" size={12} color="#FFFFFF" />
                      </View>
                    </View>
                    <Text style={[styles.actionText, { color: '#FF9800' }]}>Scan Food</Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom Row */}
                <View style={styles.gridRow}>
                  <TouchableOpacity style={styles.actionCard} onPress={() => handleActionMenu('water')}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons name="water-outline" size={28} color="#2196F3" />
                    </View>
                    <Text style={styles.actionText}>Add Water</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionCard} onPress={() => handleActionMenu('exercise')}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons name="dumbbell" size={28} color="#9C27B0" />
                    </View>
                    <Text style={styles.actionText}>Log Exercise</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    // Heavy Drop Shadow
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    marginLeft: 16, // Separates it gracefully from the main UI pill
    alignItems: 'center',
    justifyContent: 'center',
    // Elevated Shadow mapping primary brand color
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Custom Modal Inject Layouts
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly dimming focusing directly into the Grid!
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 120 : 110, // Natively positioning directly above the FAB
  },
  menuContainer: {
    alignSelf: 'stretch', // Spans full horizontal mapping inside padding bounds
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFB300',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  }
});
