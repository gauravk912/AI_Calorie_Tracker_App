import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const saveUserProfileIfNeeded = async (uid: string, data: { email: string; firstName?: string | null; lastName?: string | null; imageUrl?: string | null }) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    // If the document of user does not exist, create it
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userId: uid,
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        profileImageUrl: data.imageUrl || '',
        createdAt: serverTimestamp(),
        onboardingCompleted: false, // Explicitly set to false securely
      });
      console.log("User profile saved to Firestore");
    } else {
      console.log("User profile already exists in Firestore");
    }
  } catch (error) {
    console.error("Error saving user profile to Firestore:", error);
  }
};

export const checkOnboardingStatus = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().onboardingCompleted === true;
    }
    return false;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};

export const updateUserMetrics = async (
  uid: string,
  metrics: {
    gender: string;
    goal: string;
    workoutDays: string;
    dob: { date: string; month: string; year: string; };
    height: { feets: string; inches: string; };
    weight: string;
  },
  aiPlan: any
) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      metrics,
      aiPlan,
      onboardingCompleted: true
    }, { merge: true });
    console.log("User metrics and AI Blueprint saved securely to Firestore");
  } catch (error) {
    console.error("Error updating user metrics:", error);
    throw error; // Re-throw so the UI catches it
  }
};

export const updateAiPlan = async (uid: string, aiPlan: any) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { aiPlan }, { merge: true });
    console.log("AI Plan updated specifically in Firestore");
  } catch (error) {
    console.error("Error updating AI Plan:", error);
    throw error;
  }
};
