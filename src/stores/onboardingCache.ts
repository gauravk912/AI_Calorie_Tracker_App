import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@onboarding_completed';

export const cacheOnboardingStatus = async (status: boolean) => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(status));
  } catch (e) {
    console.error('Error saving onboarding status to storage', e);
  }
};

export const getCachedOnboardingStatus = async (): Promise<boolean | null> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (value !== null) {
      return JSON.parse(value);
    }
    return null; // Means we don't know, have to query Firestore
  } catch (e) {
    console.error('Error reading onboarding status from storage', e);
    return null;
  }
};

export const clearOnboardingCache = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (e) {
    console.error('Error clearing onboarding cache', e);
  }
};
