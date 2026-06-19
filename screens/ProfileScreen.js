import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, TextInput, Image, ActivityIndicator, Platform } from 'react-native';
import { signOut, deleteUser } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const CLOUDINARY_CLOUD = 'donoemwfm';
const CLOUDINARY_UPLOAD_PRESET = 'moghomes_unsigned';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [profile, setProfile] = useState({
    displayName: '',
    phone: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    photoURL: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.log('Error loading profile:', e.message);
      }
    };
    loadProfile();
  }, []);

  const updateField = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission needed', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhotoToCloudinary = async (uri) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const fileResponse = await fetch(uri);
      const blob = await fileResponse.blob();
      formData.append('file', blob, `profile_${Date.now()}.jpg`);
    } else {
      formData.append('file', { uri, type: 'image/jpeg', name: `profile_${Date.now()}.jpg` });
    }
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'moghomes/profiles');
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) return data.secure_url;
    throw new Error(data.error?.message || 'Photo upload failed');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let photoURL = profile.photoURL;
      if (photoUri) {
        setUploadingPhoto(true);
        photoURL = await uploadPhotoToCloudinary(photoUri);
        setUploadingPhoto(false);
      }
      const updatedProfile = { ...profile, photoURL };
      await setDoc(doc(db, 'users', user.uid), {
        ...updatedProfile,
        email: user.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setProfile(updatedProfile);
      setPhotoUri(null);
      setEditing(false);
      Alert.alert('✅ Saved', 'Your profile has been updated.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.\n' + e.message);
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  const handleCancel = () => {
    setPhotoUri(null);
    setEditing(false);
  };

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

  const displayPhoto = photoUri || profile.photoURL;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>👤 Profile</Text>
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editLink}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={editing ? handlePickPhoto : undefined} style={styles.photoWrap} disabled={!editing}>
            {displayPhoto ? (
              <Image source={{ uri: displayPhoto }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>{(profile.displayName || user?.email || '?')[0].toUpperCase()}</Text>
              </View>
            )}
            {editing && (
              <View style={styles.cameraBadge}><Text style={{ fontSize: 14 }}>📷</Text></View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Display Name</Text>
        {editing ? (
          <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#9CA3AF" value={profile.displayName} onChangeText={v => updateField('displayName', v)} />
        ) : (
          <Text style={styles.value}>{profile.displayName || 'Not set'}</Text>
        )}

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || 'Not provided'}</Text>

        <Text style={styles.label}>Phone</Text>
        {editing ? (
          <TextInput style={styles.input} placeholder="e.g. 08012345678" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={profile.phone} onChangeText={v => updateField('phone', v)} />
        ) : (
          <Text style={styles.value}>{profile.phone || user?.phoneNumber || 'Not provided'}</Text>
        )}

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
        <Text style={styles.sectionTitle}>Social Links</Text>

        <Text style={styles.label}>Facebook</Text>
        {editing ? (
          <TextInput style={styles.input} placeholder="facebook.com/yourname" placeholderTextColor="#9CA3AF" autoCapitalize="none" value={profile.facebook} onChangeText={v => updateField('facebook', v)} />
        ) : (
          profile.facebook ? (
            <TouchableOpacity onPress={() => Linking.openURL(profile.facebook.startsWith('http') ? profile.facebook : `https://${profile.facebook}`)}>
              <Text style={styles.linkValue}>{profile.facebook}</Text>
            </TouchableOpacity>
          ) : <Text style={styles.value}>Not set</Text>
        )}

        <Text style={styles.label}>Instagram</Text>
        {editing ? (
          <TextInput style={styles.input} placeholder="instagram.com/yourname" placeholderTextColor="#9CA3AF" autoCapitalize="none" value={profile.instagram} onChangeText={v => updateField('instagram', v)} />
        ) : (
          profile.instagram ? (
            <TouchableOpacity onPress={() => Linking.openURL(profile.instagram.startsWith('http') ? profile.instagram : `https://${profile.instagram}`)}>
              <Text style={styles.linkValue}>{profile.instagram}</Text>
            </TouchableOpacity>
          ) : <Text style={styles.value}>Not set</Text>
        )}

        <Text style={styles.label}>WhatsApp Number</Text>
        {editing ? (
          <TextInput style={styles.input} placeholder="e.g. 2348012345678" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={profile.whatsapp} onChangeText={v => updateField('whatsapp', v)} />
        ) : (
          profile.whatsapp ? (
            <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`)}>
              <Text style={styles.linkValue}>{profile.whatsapp}</Text>
            </TouchableOpacity>
          ) : <Text style={styles.value}>Not set</Text>
        )}
      </View>

      {editing && (
        <View style={styles.editActionsRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={saving}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>{uploadingPhoto ? 'Uploading photo...' : 'Save Changes'}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  editLink: { fontSize: 14, color: '#1B4332', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3, borderWidth: 1, borderColor: '#E5E0D5' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 },
  label: { fontSize: 12, color: '#999', marginTop: 10 },
  value: { fontSize: 15, color: '#1a1a2e', fontWeight: '600', marginTop: 2 },
  linkValue: { fontSize: 15, color: '#1B4332', fontWeight: '700', marginTop: 2, textDecorationLine: 'underline' },
  input: { backgroundColor: '#F8F6F1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1a1a2e', borderWidth: 1, borderColor: '#E5E0D5', marginTop: 4 },
  photoSection: { alignItems: 'center', marginBottom: 8 },
  photoWrap: { position: 'relative' },
  photo: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#1B4332' },
  photoPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: 32, color: '#C9A84C', fontWeight: '900' },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 6, borderWidth: 1, borderColor: '#E5E0D5' },
  editActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  cancelBtn: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E0D5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: '#6B7280', fontWeight: '700', fontSize: 14 },
  saveBtn: { flex: 1, backgroundColor: '#1B4332', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
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
