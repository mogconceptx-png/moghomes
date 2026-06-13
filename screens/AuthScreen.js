import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [otp, setOtp] = useState('');

  const handleSignUp = async () => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Account created!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Signed in!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSendOtp = async () => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phone);
      setConfirm(confirmation);
      Alert.alert('OTP Sent', 'Check your phone!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await confirm.confirm(otp);
      Alert.alert('Success', 'Phone verified!');
    } catch (e) {
      Alert.alert('Error', 'Invalid OTP. Try again.');
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
        <Text style={styles.divider}>── or ──</Text>
        <TextInput style={styles.input} placeholder="Phone e.g. +2348012345678" onChangeText={setPhone} keyboardType="phone-pad" />
        <TouchableOpacity style={styles.phoneBtn} onPress={handleSendOtp}>
          <Text style={styles.btnText}>📱 Send OTP</Text>
        </TouchableOpacity>
        {confirm && (
          <>
            <TextInput style={styles.input} placeholder="Enter OTP" onChangeText={setOtp} keyboardType="number-pad" />
            <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp}>
              <Text style={styles.btnText}>Verify OTP</Text>
            </TouchableOpacity>
          </>
        )}
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
  phoneBtn: { backgroundColor: '#25D366', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  toggle: { textAlign: 'center', color: '#1a1a2e', marginBottom: 10, textDecorationLine: 'underline' },
  divider: { textAlign: 'center', color: '#aaa', marginVertical: 10 },
});
