import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const CONTAINER_WIDTH = width - 32; // 16 margin on each side

// Core architectural change: Generate absolute discrete 7-day chunks (Weeks)
const generateWeeks = (weeksPast = 12) => {
  const weeks = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Map to the most recent Sunday
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());

  // Count backwards dynamically up to 0 (which mathematically locks out next week!)
  for (let i = -weeksPast; i <= 0; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      const d = new Date(currentSunday);
      d.setDate(currentSunday.getDate() + (i * 7) + j);
      week.push(d);
    }
    weeks.push(week);
  }
  return weeks;
};

export function DateSelector({ onSelectDate }: { onSelectDate?: (date: Date) => void }) {
  const [weeks] = useState(generateWeeks(12));
  const [selectedDate, setSelectedDate] = useState(new Date().setHours(0,0,0,0));
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Snap directly to the final Array Index (which represents the strictly current week) immediately
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 50);
  }, []);

  const handleSelect = (date: Date) => {
    setSelectedDate(date.getTime());
    if (onSelectDate) onSelectDate(date);
  };

  const renderDay = (date: Date) => {
    const time = date.getTime();
    const isSelected = time === selectedDate;
    
    // Explicit Formatters
    const dayString = date.toLocaleDateString('en-US', { weekday: 'short' }); 
    const dateNum = date.getDate();

    return (
      <TouchableOpacity 
        key={time}
        style={[styles.dateCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelect(date)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dayText, isSelected && styles.selectedText]}>{dayString}</Text>
        <View style={[styles.numberCircle, isSelected && styles.selectedNumberCircle]}>
          <Text style={[styles.numberText, isSelected && styles.selectedNumberText]}>{dateNum}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderWeek = ({ item: week }: { item: Date[] }) => {
    return (
      <View style={styles.weekRow}>
        {week.map(renderDay)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={weeks}
        horizontal
        pagingEnabled // Mathematically locks swipe boundaries to the physical component width
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `week-${index}`}
        renderItem={renderWeek}
        getItemLayout={(_, index) => ({ length: CONTAINER_WIDTH, offset: CONTAINER_WIDTH * index, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary + '15', // Soft wrapper styling
    paddingVertical: 16,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 8,
    width: CONTAINER_WIDTH,
  },
  weekRow: {
    width: CONTAINER_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dateCard: {
    width: 42,
    height: 76,
    backgroundColor: '#FFFFFF', // Inactive configuration
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: Colors.primary, // Active deeply-saturated configuration
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dayText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background, // Nested circle
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedNumberCircle: {
    backgroundColor: '#FFFFFF',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  selectedNumberText: {
    color: Colors.primary,
  }
});
