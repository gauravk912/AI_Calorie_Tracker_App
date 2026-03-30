import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getAuth } from 'firebase/auth'; // Reverting directly back to core auth
import { clearOnboardingCache } from '../../stores/onboardingCache';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await clearOnboardingCache(); // Critical: Dump local state so next login triggers Check logic
      const auth = getAuth();
      await auth.signOut();
    } catch (e) {
      console.error("Logout Error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={48} color={Colors.surface} />
        </View>
        <Text style={styles.emailText}>{user?.email || 'Fitness AI User'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pro Member</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <MaterialCommunityIcons name="logout" size={24} color="#FF3B30" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B3015',
    padding: 20,
    borderRadius: 16,
    gap: 8,
    marginBottom: 100, // Important padding for floating tab bar offset
  },
  signOutText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '700',
  }
});
