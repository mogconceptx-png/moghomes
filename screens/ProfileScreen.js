import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking } from 'react-native';
import { signOut, deleteUser } from 'firebase/auth';
import { auth } from '../firebase';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteUser(user);
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
            } catch (e) {
              setDeleting(false);
              if (e.code === 'auth/requires-recent-login') {
                Alert.alert('Session Expired', 'Please log out and log back in before deleting your account.');
              } else {
                Alert.alert('Error', e.message);
              }
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || 'Not provided'}</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{user?.phoneNumber || 'Not provided'}</Text>
        <Text style={styles.label}>Account Status</Text>
        <Text style={[styles.value, { color: '#1B4332' }]}>
          {user?.emailVerified ? '✅ Verified' : '⚠️ Unverified'}
        </Text>
        <Text style={styles.label}>Member Since</Text>
        <Text style={styles.value}>
          {user?.metadata?.creationTime
            ? new Date(user.metadata.creationTime).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'Unknown'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://moghomes.netlify.app/privacy-policy.html')}>
          <Text style={styles.linkText}>🔒 Privacy Policy</Text>
          <Text style={styles.linkArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://moghomes.netlify.app/terms-of-service.html')}>
          <Text style={styles.linkText}>📄 Terms of Service</Text>
          <Text style={styles.linkArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('mailto:mogconceptx@gmail.com')}>
          <Text style={styles.linkText}>✉️ Contact Support</Text>
          <Text style={styles.linkArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} disabled={deleting}>
        <Text style={styles.deleteText}>{deleting ? 'Deleting...' : '🗑️ Delete My Account'}</Text>
      </TouchableOpacity>

      <Text style={styles.deleteNote}>
        Deleting your account will permanently remove all your data including listings and messages.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F1', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3, borderWidth: 1, borderColor: '#E5E0D5' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 },
  label: { fontSize: 12, color: '#999', marginTop: 10 },
  value: { fontSize: 15, color: '#1a1a2e', fontWeight: '600', marginTop: 2 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  linkText: { fontSize: 14, color: '#1a1a2e', fontWeight: '500' },
  linkArrow: { fontSize: 18, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#E5E0D5' },
  logoutBtn: { backgroundColor: '#1B4332', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#FFF0F0', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#FFD0D0' },
  deleteText: { color: '#e74c3c', fontSize: 15, fontWeight: '700' },
  deleteNote: { fontSize: 11, color: '#6B7280', textAlign: 'center', lineHeight: 16 },
});
