import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export function HomeHeader() {
  const { user } = useAuth();
  
  // Example dummy avatar, in a real app you might pull from user.photoURL
  const avatarUrl = user?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <View style={styles.headerContainer}>
      <View style={styles.profileSection}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatarImage} 
        />
        <View style={styles.textStack}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{displayName}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="bell-outline" size={28} color={Colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
  },
  textStack: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textTransform: 'capitalize',
  }
});
