import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function ProfileScreen() {
  const user = auth().currentUser;

  const handleLogout = async () => {
    try {
      await auth().signOut();
      Alert.alert('✅ Logged out successfully');
    } catch (e) {
      Alert.alert('❌ Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || user?.phoneNumber || 'User'}</Text>
        <Text style={styles.label}>User ID</Text>
        <Text style={styles.value}>{user?.uid}</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 3 },
  label: { fontSize: 12, color: '#999', marginTop: 10 },
  value: { fontSize: 16, color: '#1a1a2e', fontWeight: '500' },
  logoutBtn: { backgroundColor: '#e74c3c', padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

