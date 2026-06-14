import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Signed in!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏠 MOG Homes</Text>
      <View style={styles.card}>
        <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <TextInput style={styles.input} placeholder="Email address" onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.btn} onPress={isSignUp ? handleSignUp : handleSignIn}>
          <Text style={styles.btnText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggle}>{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', elevation: 4 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1a1a2e', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  btn: { backgroundColor: '#1a1a2e', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  toggle: { textAlign: 'center', color: '#1a1a2e', marginBottom: 10, textDecorationLine: 'underline' },
});
