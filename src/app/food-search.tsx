import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchFoodsUSDA } from '../services/usdaFoodService';

export default function FoodSearchScreen() {
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 500ms software debounce securely limiting typing sequences into actual queries structurally
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Network pipeline executing automatically securely upon debounced triggers cleanly
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 3) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const fetchedFoods = await searchFoodsUSDA(debouncedQuery.trim());
        setResults(fetchedFoods);
      } catch (error: any) {
        console.error("Search fetch failed natively:", error);
        setErrorMsg(error.message || "An unknown error occurred");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleAddFood = (food: any) => {
    // Organically track entire payload parameters sending natively into dynamic entry views strictly
    router.push({
      pathname: '/log-food',
      params: food
    });
  };

  const extractUSDAMacros = (nutrients: any[]) => {
    const cals = nutrients.find((n: any) => n.nutrientName === 'Energy')?.value || 0;
    const protein = nutrients.find((n: any) => n.nutrientName === 'Protein')?.value || 0;
    const carbs = nutrients.find((n: any) => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;
    const fat = nutrients.find((n: any) => n.nutrientName === 'Total lipid (fat)')?.value || 0;
    
    return { 
      calories: Math.round(cals),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    };
  };

  const parseUSDAItem = (item: any) => {
    const name = item.description;
    const brand = item.brandOwner || "Generic Base";
    
    // Default to '100g' securely if generic structural elements miss explicitly serving sizes
    const serving = item.servingSize 
      ? `${item.servingSize}${item.servingSizeUnit || 'g'}` 
      : '100g';
    const { calories, protein, carbs, fat } = extractUSDAMacros(item.foodNutrients || []);
    return { name, serving, calories, protein, carbs, fat, brand };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      {/* Structural Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.title}>Search Food</Text>
        
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={24} color={Colors.textMuted} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search food database..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            autoCorrect={false}
          />
          {query.length > 0 && (
             <TouchableOpacity onPress={() => setQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color={Colors.textMuted} />
             </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centerBox}>
             <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : errorMsg ? (
          <View style={styles.centerBox}>
             <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#F44336" style={{marginBottom: 16}} />
             <Text style={[styles.noResultsTitle, { color: '#F44336' }]}>API Request Failed</Text>
             <Text style={styles.noResultsSub}>{errorMsg}</Text>
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.fdcId ? item.fdcId.toString() : index.toString()}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const parsedFood = parseUSDAItem(item);
              
              return (
                <View style={styles.foodCard}>
                  <View style={styles.cardLeft}>
                     <Text style={styles.foodName} numberOfLines={1}>{parsedFood.name}</Text>
                     
                     <View style={styles.metaRow}>
                       <Text style={styles.servingText}>{parsedFood.serving}</Text>
                       <Text style={styles.metaDot}>•</Text>
                       <View style={styles.calRow}>
                          <MaterialCommunityIcons name="fire" size={14} color="#FF9800" />
                          <Text style={styles.calText}>{parsedFood.calories} kcal</Text>
                       </View>
                     </View>
                  </View>

                  <TouchableOpacity style={styles.addButton} onPress={() => handleAddFood(parsedFood)}>
                     <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        ) : debouncedQuery.length >= 3 ? (
          <View style={styles.centerBox}>
             <MaterialCommunityIcons name="food-variant" size={48} color={Colors.border} style={{marginBottom: 16}} />
             <Text style={styles.noResultsTitle}>No foods found</Text>
             <Text style={styles.noResultsSub}>Try a different search term specifically adjusting constraints.</Text>
          </View>
        ) : (
          null // Awaiting 3 character threshold securely silently
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
    marginRight: 8,
    fontWeight: '500',
    height: '100%',
  },

  listContainer: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '20%', // Optical center offset vertically cleanly
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  noResultsSub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  flatListContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    marginRight: 16,
  },
  foodName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  metaDot: {
    color: '#D1D5DB',
    marginHorizontal: 8,
    fontSize: 14,
  },
  calRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    marginLeft: 4,
  },
  
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  }
});
