import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { Link } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { saveUserProfileIfNeeded } from '../../services/userService';

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');

  const onSignUpPress = async () => {
    setLoading(true);
    setErrorMSG('');

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, emailAddress, password);
      
      // 2. Automatically save their profile to Firestore database
      if (userCredential?.user?.uid) {
        await saveUserProfileIfNeeded(userCredential.user.uid, {
          email: emailAddress,
          firstName,
          lastName,
        });
      }

      // We do not need to manually route here because _layout.tsx 
      // is listening to onAuthStateChanged mapping and will redirect us to /(main)
    } catch (err: any) {
      setErrorMSG(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and track your calories smartly</Text>
        </View>

        {errorMSG ? <Text style={styles.errorText}>{errorMSG}</Text> : null}

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <User color="#8E8E93" size={20} style={styles.icon} />
            <TextInput
              value={firstName}
              placeholder="First Name"
              placeholderTextColor="#8E8E93"
              onChangeText={setFirstName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <User color="#8E8E93" size={20} style={styles.icon} />
            <TextInput
              value={lastName}
              placeholder="Last Name"
              placeholderTextColor="#8E8E93"
              onChangeText={setLastName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail color="#8E8E93" size={20} style={styles.icon} />
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email address"
              placeholderTextColor="#8E8E93"
              onChangeText={setEmailAddress}
              style={styles.input}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#8E8E93" size={20} style={styles.icon} />
            <TextInput
              value={password}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={true}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={onSignUpPress} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign Up</Text>}
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionText: {
    color: '#1A1A1A',
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

