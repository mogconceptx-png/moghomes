import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';

const TYPES = ['For Sale', 'For Rent', 'Land', 'Commercial', 'Short Let'];
const STATES = ['Lagos', 'Abuja', 'Rivers', 'Ogun', 'Oyo', 'Kano', 'Delta'];

export default function PostListingScreen() {
  const [form, setForm] = useState({
    title: '', type: 'For Sale', price: '', location: '',
    state: 'Lagos', beds: '', baths: '', description: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = () => {
    if (!form.title || !form.price || !form.location) {
      Alert.alert('Missing info', 'Please fill in title, price, and location.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  if (submitted) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 60 }}>🎉</Text>
        <Text style={styles.successTitle}>Listing Submitted!</Text>
        <Text style={styles.successSub}>
          Your property is under review.{'\n'}
          MOG Homes team will verify and publish it shortly.
        </Text>
        <View style={styles.successBadge}>
          <Text style={styles.successBadgeText}>📋 Review pending</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Post a Listing</Text>
          <Text style={styles.headerSub}>Reach thousands of verified buyers and tenants</Text>
        </View>

        <TouchableOpacity style={styles.upgradeBanner}>
          <Text style={styles.upgradeText}>⭐ Get more views — Upgrade to Premium Agent</Text>
        </TouchableOpacity>

        <View style={styles.form}>

          <Text style={styles.label}>Property Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                onPress={() => update('type', t)}
              >
                <Text style={[styles.typeText, form.type === t && styles.typeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Property Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3-Bedroom Duplex at Lekki Phase 1"
            placeholderTextColor="#6B7280"
            value={form.title}
            onChangeText={v => update('title', v)}
          />

          <Text style={styles.label}>Price (₦) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 45000000"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={form.price}
            onChangeText={v => update('price', v)}
          />

          <Text style={styles.label}>Street / Area *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5 Admiralty Way, Lekki Phase 1"
            placeholderTextColor="#6B7280"
            value={form.location}
            onChangeText={v => update('location', v)}
          />

          <Text style={styles.label}>State</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {STATES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.typeBtn, form.state === s && styles.typeBtnActive]}
                onPress={() => update('state', s)}
              >
                <Text style={[styles.typeText, form.state === s && styles.typeTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Bedrooms</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 3"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={form.beds}
                onChangeText={v => update('beds', v)}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Bathrooms</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={form.baths}
                onChangeText={v => update('baths', v)}
              />
            </View>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the property — features, condition, nearby landmarks..."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={5}
            value={form.description}
            onChangeText={v => update('description', v)}
          />

          <Text style={styles.label}>Property Photos</Text>
          <TouchableOpacity style={styles.photoBox}>
            <Text style={{ fontSize: 32 }}>📷</Text>
            <Text style={styles.photoText}>Tap to upload photos</Text>
            <Text style={styles.photoSub}>HD photos get 3x more enquiries</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Listing Plan</Text>
          <View style={styles.plansRow}>
            <View style={[styles.planCard, styles.planFree]}>
              <Text style={styles.planName}>Free</Text>
              <Text style={styles.planPrice}>₦0</Text>
              <Text style={styles.planFeature}>• Standard listing</Text>
              <Text style={styles.planFeature}>• 30-day duration</Text>
              <Text style={styles.planFeature}>• Basic analytics</Text>
            </View>
            <View style={[styles.planCard, styles.planFeatured]}>
              <Text style={styles.featuredLabel}>⭐ POPULAR</Text>
              <Text style={[styles.planName, { color: '#FFFFFF' }]}>Featured</Text>
              <Text style={[styles.planPrice, { color: '#C9A84C' }]}>₦15,000</Text>
              <Text style={styles.planFeatureW}>• Top search placement</Text>
              <Text style={styles.planFeatureW}>• Homepage banner</Text>
              <Text style={styles.planFeatureW}>• 60-day duration</Text>
              <Text style={styles.planFeatureW}>• Full analytics</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Listing</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By submitting, you confirm this property is real and you have the right to list it.
            Fake listings will result in account suspension.
          </Text>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6F1' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  upgradeBanner: { marginHorizontal: 20, backgroundColor: '#C9A84C', borderRadius: 12, padding: 12, marginBottom: 16 },
  upgradeText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center', fontSize: 13 },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 6, marginTop: 4 },
  typeBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E0D5', marginRight: 8, backgroundColor: '#FFFFFF' },
  typeBtnActive: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  typeText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  typeTextActive: { color: '#FFFFFF' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: '#1A1A1A', borderWidth: 1, borderColor: '#E5E0D5', marginBottom: 14 },
  textArea: { height: 110, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  photoBox: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 2, borderColor: '#E5E0D5', borderStyle: 'dashed', padding: 24, alignItems: 'center', marginBottom: 16 },
  photoText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
  photoSub: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  plansRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1 },
  planFree: { backgroundColor: '#FFFFFF', borderColor: '#E5E0D5' },
  planFeatured: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  featuredLabel: { fontSize: 10, color: '#C9A84C', fontWeight: '800', marginBottom: 4 },
  planName: { fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  planPrice: { fontSize: 20, fontWeight: '900', color: '#1B4332', marginBottom: 8 },
  planFeature: { fontSize: 11, color: '#6B7280', marginBottom: 3 },
  planFeatureW: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 3 },
  submitBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  disclaimer: { fontSize: 11, color: '#6B7280', textAlign: 'center', lineHeight: 17 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', marginTop: 16 },
  successSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 21 },
  successBadge: { marginTop: 20, backgroundColor: '#EDF7EE', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  successBadgeText: { color: '#1B4332', fontWeight: '700', fontSize: 14 },
});

