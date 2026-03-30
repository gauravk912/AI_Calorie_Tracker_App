import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "../constants/Colors";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { checkOnboardingStatus } from "../services/userService";
import { cacheOnboardingStatus, getCachedOnboardingStatus } from "../stores/onboardingCache";

const InitialLayout = () => {
  const { isLoaded, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // A clean lock ensuring we don't display Dashboard/Auth prematurely, without destroying Slot unmounts
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  useEffect(() => {
    const handleNavigation = async () => {
      if (!isLoaded) return;

      const inAuthGroup = segments[0] === "(auth)";
      // 'onboarding' and 'calculating-plan' natively mapped to their root files
      const inOnboardingFlow = segments[0] === "onboarding" || segments[0] === "calculating-plan";
      const isSignedIn = !!user;

      if (isSignedIn) {
        // Fetch onboarding status smoothly by asking cache first, then firestore
        let hasOnboarded = await getCachedOnboardingStatus();
        if (hasOnboarded === null) {
          hasOnboarded = await checkOnboardingStatus(user.uid);
          if (hasOnboarded) {
            await cacheOnboardingStatus(true);
          }
        }

        //If user is logged in but not onboarded, send to onboarding
        if (!hasOnboarded) {
          if (!inOnboardingFlow) {
            router.replace("/onboarding"); // Force them into onboarding and remove wrong page from history
          }
        } else {
          // If they are onboarded, but sitting in auth screen or onboarding screen, send to main
          if (inAuthGroup || inOnboardingFlow) {
            router.replace("/(main)"); // Force them into main and remove wrong page from history
          }
        }

        // Safely lower the launch page
        setInitialCheckComplete(true);
      } else if (!isSignedIn && !inAuthGroup) {
        router.replace("/(auth)/sign-in");
        setInitialCheckComplete(true);
      }
    };

    handleNavigation();
  }, [user, isLoaded, segments]);

  if (!isLoaded || !initialCheckComplete) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
