import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { FoodItemData, searchFoodRegistry } from '../services/fatSecretService';

export default function AddFoodSearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FoodItemData[]>([]);

  // React strictly mapping a passive trailing Debounce engine enforcing API limits structurally
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (query.length >= 3) {
      setLoading(true);
      timeoutId = setTimeout(async () => {
        try {
          const fetchedData = await searchFoodRegistry(query);
          setResults(fetchedData || []);
        } catch (e) {
          console.error("FatSecret Front-End Evaluation Error", e);
        } finally {
          setLoading(false);
        }
      }, 800); // 800ms trailing wait bounds strictly caching limits
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Navigate securely forwarding complete Macro objects natively via stringified params into the Final Editing UI bounds
  const handleSelectFood = (item: FoodItemData) => {
    router.push({
      pathname: '/log-food',
      params: {
        id: item.id,
        name: item.name,
        brand: item.brand,
        servingDesc: item.servingDesc,
        calories: item.calories.toString(),
        protein: item.protein.toString(),
        fats: item.fats.toString(),
        carbs: item.carbs.toString()
      }
    });
  };

  const renderFoodItem = ({ item }: { item: FoodItemData }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
        {item.brand && item.brand !== 'Generic Base' && (
          <Text style={styles.foodBrand}>{item.brand}</Text>
        )}
        <Text style={styles.foodMacros}>
          {item.servingDesc}  •  {item.calories} kcal
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleSelectFood(item)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Standalone Header Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Food</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Live Database Search Module structurally mapping identical rounded bounds explicitly */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search API..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            autoCapitalize="sentences"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearIcon}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Output Arrays tracking generic mapping safely passing loader logic natively */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderFoodItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                query.length >= 3 && !loading ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No exact organic FatSecret matches.</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>

      </KeyboardAvoidingView>
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
    backgroundColor: '#F9FAFB',
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Identical pure white structural input tracking SS precisely
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Fine gray structural trace mathematically mapping exact SS limits
    paddingHorizontal: 16,
    height: 56,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    height: '100%',
  },
  clearIcon: {
    padding: 8,
  },

  resultsContainer: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12, // Spaces between dynamic array overlays natively 
  },

  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6', // Extra-light inner border preventing massive shadow sprawl strictly 
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    marginRight: 16,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BFA5', // Crisp deep Mint/Green exact match directly pulling mockups dynamically
    marginBottom: 4,
  },
  foodMacros: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Custom SS generic generic `+` icon bounding structure safely
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9', // Pale green identically matching pure Mockups cleanly natively
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  }
});
