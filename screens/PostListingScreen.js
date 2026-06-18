import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Image, Modal, Pressable, Clipboard, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CLOUDINARY_CLOUD = 'donoemwfm';
const CLOUDINARY_UPLOAD_PRESET = 'moghomes_unsigned';

const TYPES = ['For Sale', 'For Rent', 'Land', 'Commercial', 'Short Let'];
const STATES = ['Lagos', 'Abuja', 'Rivers', 'Ogun', 'Oyo', 'Kano', 'Delta'];

const PREMIUM_BENEFITS = [
  { icon: '🔝', title: 'Top Search Placement', desc: 'Your listing appears above all standard listings' },
  { icon: '⭐', title: 'Premium Agent Badge', desc: 'Verified badge builds trust with buyers & tenants' },
  { icon: '📸', title: 'Up to 15 Photos', desc: 'Standard listings allow only 5 photos' },
  { icon: '📊', title: 'Listing Analytics', desc: 'See views, saves, and enquiry counts in real time' },
  { icon: '🏠', title: 'Homepage Feature', desc: 'Rotate on the homepage banner for max exposure' },
  { icon: '📅', title: '60-Day Duration', desc: 'Standard listings expire after 30 days' },
];

const PLANS = [
  { id: 'per_listing', label: 'Per Listing', price: '₦15,000', tag: null, desc: 'One-time boost for this listing only', color: '#1B4332' },
  { id: 'monthly', label: 'Monthly', price: '₦35,000', tag: '⭐ BEST VALUE', desc: 'Unlimited premium listings for 30 days', color: '#C9A84C' },
];

const BANK_ACCOUNTS = [
  { bank: 'United Bank for Africa (UBA)', number: '1025219583', name: 'Monumental Opulence Global Conceptx' },
  { bank: 'Zenith Bank Plc', number: '1223597470', name: 'Monumental Opulence Global Conceptx' },
];

export default function PostListingScreen() {
  const [form, setForm] = useState({ title: '', type: 'For Sale', price: '', location: '', state: 'Lagos', beds: '', baths: '', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('per_listing');
  const [listingPlan, setListingPlan] = useState('free');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [copiedAccount, setCopiedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const MAX_PHOTOS = isPremium ? 15 : 5;
  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleCopyAccount = (number, bank) => {
    Clipboard.setString(number);
    setCopiedAccount(bank);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handlePickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission needed', 'Please allow access to your photo library.'); return; }
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(isPremium ? 'Photo limit reached' : 'Upgrade for more photos', isPremium ? 'You can upload up to 15 photos.' : 'Upgrade to Premium Agent to upload up to 15 photos.', isPremium ? [{ text: 'OK' }] : [{ text: 'Upgrade', onPress: () => setShowUpgradeModal(true) }, { text: 'Cancel' }]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) {
      const remaining = MAX_PHOTOS - photos.length;
      setPhotos(prev => [...prev, ...result.assets.slice(0, remaining).map(a => a.uri)]);
    }
  };

  const uploadToCloudinary = async (uri, index, total) => {
    setUploadProgress(`Uploading photo ${index + 1} of ${total}...`);
    const formData = new FormData();
    formData.append('file', { uri, type: 'image/jpeg', name: `photo_${Date.now()}.jpg` });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'moghomes/listings');
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) return data.secure_url;
    throw new Error(data.error?.message || 'Upload failed');
  };

  const handleUpgrade = () => {
    if (paymentMethod === 'paystack') {
      Alert.alert('Paystack Coming Soon', 'Paystack payment will be available soon. Please use bank transfer for now.', [{ text: 'OK' }]);
      return;
    }
    const amount = selectedPlan === 'monthly' ? '₦35,000' : '₦15,000';
    Alert.alert('✅ Confirm Payment', `Once you have transferred ${amount} to any account above, tap "I've Paid" and we will activate your plan within minutes.`,
      [{ text: "I've Paid", onPress: () => { setIsPremium(true); setListingPlan('featured'); setShowUpgradeModal(false); Alert.alert('🎉 Payment Received!', 'Your Premium listing will be activated shortly after verification.'); } }, { text: 'Cancel', style: 'cancel' }]);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.location) { Alert.alert('Missing info', 'Please fill in title, price, and location.'); return; }
    setLoading(true);
    try {
      const imageUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadToCloudinary(photos[i], i, photos.length);
        imageUrls.push(url);
      }
      setUploadProgress('Saving listing...');
      await addDoc(collection(db, 'listings'), {
        ...form,
        images: imageUrls,
        image: imageUrls[0] || '',
        isPremium,
        plan: listingPlan,
        verified: false,
        status: 'pending',
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
        createdAt: serverTimestamp(),
      });
      setLoading(false);
      setUploadProgress('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (e) {
      setLoading(false);
      setUploadProgress('');
      Alert.alert('Error', 'Failed to submit listing. Please try again.\n' + e.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1B4332" />
        <Text style={{ marginTop: 16, fontSize: 15, color: '#1B4332', fontWeight: '700', textAlign: 'center', paddingHorizontal: 40 }}>
          {uploadProgress || 'Saving your listing...'}
        </Text>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 60 }}>🎉</Text>
        <Text style={styles.successTitle}>Listing Submitted!</Text>
        {isPremium && <View style={styles.premiumSuccessBadge}><Text style={styles.premiumSuccessText}>⭐ Premium Agent — Featured Listing</Text></View>}
        <Text style={styles.successSub}>Your property is under review.{'\n'}MOG Homes team will verify and publish it shortly.</Text>
        <View style={styles.successBadge}><Text style={styles.successBadgeText}>📋 Review pending</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Post a Listing</Text>
            {isPremium && <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>⭐ Premium</Text></View>}
          </View>
          <Text style={styles.headerSub}>Reach thousands of verified buyers and tenants</Text>
        </View>
        {!isPremium && (
          <TouchableOpacity style={styles.upgradeBanner} onPress={() => setShowUpgradeModal(true)}>
            <Text style={styles.upgradeText}>⭐ Get more views — Upgrade to Premium Agent</Text>
            <Text style={styles.upgradeSubText}>Top placement · Badge · Analytics · 15 photos</Text>
          </TouchableOpacity>
        )}
        {isPremium && <View style={styles.premiumActiveBanner}><Text style={styles.premiumActiveText}>⭐ Premium Agent Active — Your listing will be featured</Text></View>}
        <View style={styles.form}>
          <Text style={styles.label}>Property Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {TYPES.map(t => <TouchableOpacity key={t} style={[styles.typeBtn, form.type === t && styles.typeBtnActive]} onPress={() => update('type', t)}><Text style={[styles.typeText, form.type === t && styles.typeTextActive]}>{t}</Text></TouchableOpacity>)}
          </ScrollView>
          <Text style={styles.label}>Property Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. 3-Bedroom Duplex at Lekki Phase 1" placeholderTextColor="#6B7280" value={form.title} onChangeText={v => update('title', v)} />
          <Text style={styles.label}>Price (₦) *</Text>
          <TextInput style={styles.input} placeholder="e.g. 45000000" placeholderTextColor="#6B7280" keyboardType="numeric" value={form.price} onChangeText={v => update('price', v)} />
          <Text style={styles.label}>Street / Area *</Text>
          <TextInput style={styles.input} placeholder="e.g. 5 Admiralty Way, Lekki Phase 1" placeholderTextColor="#6B7280" value={form.location} onChangeText={v => update('location', v)} />
          <Text style={styles.label}>State</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {STATES.map(s => <TouchableOpacity key={s} style={[styles.typeBtn, form.state === s && styles.typeBtnActive]} onPress={() => update('state', s)}><Text style={[styles.typeText, form.state === s && styles.typeTextActive]}>{s}</Text></TouchableOpacity>)}
          </ScrollView>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Bedrooms</Text>
              <TextInput style={styles.input} placeholder="e.g. 3" placeholderTextColor="#6B7280" keyboardType="numeric" value={form.beds} onChangeText={v => update('beds', v)} />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Bathrooms</Text>
              <TextInput style={styles.input} placeholder="e.g. 2" placeholderTextColor="#6B7280" keyboardType="numeric" value={form.baths} onChangeText={v => update('baths', v)} />
            </View>
          </View>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the property — features, condition, nearby landmarks..." placeholderTextColor="#6B7280" multiline numberOfLines={5} value={form.description} onChangeText={v => update('description', v)} />
          <View style={styles.photoLabelRow}>
            <Text style={styles.label}>Property Photos</Text>
            <Text style={styles.photoCount}>{photos.length}/{MAX_PHOTOS}</Text>
          </View>
          <TouchableOpacity style={styles.photoBox} onPress={handlePickPhotos}>
            <Text style={{ fontSize: 32 }}>📷</Text>
            <Text style={styles.photoText}>Tap to upload photos</Text>
            <Text style={styles.photoSub}>{isPremium ? 'Up to 15 photos (Premium)' : 'HD photos get 3x more enquiries · 5 max'}</Text>
          </TouchableOpacity>
          {!isPremium && <TouchableOpacity onPress={() => setShowUpgradeModal(true)}><Text style={styles.upgradePhotoHint}>⭐ Upgrade to upload up to 15 photos →</Text></TouchableOpacity>}
          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {photos.map((uri, i) => <Image key={i} source={{ uri }} style={styles.photoThumb} />)}
            </ScrollView>
          )}
          <Text style={styles.label}>Listing Plan</Text>
          <View style={styles.plansRow}>
            <TouchableOpacity style={[styles.planCard, styles.planFree, listingPlan === 'free' && styles.planSelected]} onPress={() => { setListingPlan('free'); setIsPremium(false); }}>
              <Text style={styles.planName}>Free</Text>
              <Text style={styles.planPrice}>₦0</Text>
              <Text style={styles.planFeature}>• Standard listing</Text>
              <Text style={styles.planFeature}>• 5 photos</Text>
              <Text style={styles.planFeature}>• 30-day duration</Text>
              <Text style={styles.planFeature}>• Basic analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.planCard, styles.planFeatured, listingPlan === 'featured' && styles.planFeaturedSelected]} onPress={() => setShowUpgradeModal(true)}>
              <Text style={styles.featuredLabel}>⭐ POPULAR</Text>
              <Text style={[styles.planName, { color: '#FFFFFF' }]}>Featured</Text>
              <Text style={[styles.planPrice, { color: '#C9A84C' }]}>from ₦15,000</Text>
              <Text style={styles.planFeatureW}>• Top search placement</Text>
              <Text style={styles.planFeatureW}>• Premium badge</Text>
              <Text style={styles.planFeatureW}>• 15 photos</Text>
              <Text style={styles.planFeatureW}>• 60-day duration</Text>
              <Text style={styles.planFeatureW}>• Full analytics</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>{isPremium ? '⭐ Submit Featured Listing' : 'Submit Listing'}</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>By submitting, you confirm this property is real and you have the right to list it. Fake listings will result in account suspension.</Text>
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      <Modal visible={showUpgradeModal} animationType="slide" transparent onRequestClose={() => setShowUpgradeModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowUpgradeModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⭐ Premium Agent</Text>
              <Text style={styles.modalSubtitle}>Get up to 5× more views on your listings</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {PREMIUM_BENEFITS.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>{b.icon}</Text>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{b.title}</Text>
                    <Text style={styles.benefitDesc}>{b.desc}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.planSectionTitle}>Choose your plan</Text>
              {PLANS.map(plan => (
                <TouchableOpacity key={plan.id} style={[styles.planOption, selectedPlan === plan.id && styles.planOptionSelected]} onPress={() => setSelectedPlan(plan.id)}>
                  <View style={styles.planOptionLeft}>
                    <View style={[styles.planRadio, selectedPlan === plan.id && styles.planRadioSelected]}>
                      {selectedPlan === plan.id && <View style={styles.planRadioDot} />}
                    </View>
                    <View>
                      <View style={styles.planLabelRow}>
                        <Text style={styles.planOptionName}>{plan.label}</Text>
                        {plan.tag && <View style={styles.planTag}><Text style={styles.planTagText}>{plan.tag}</Text></View>}
                      </View>
                      <Text style={styles.planOptionDesc}>{plan.desc}</Text>
                    </View>
                  </View>
                  <Text style={[styles.planOptionPrice, { color: plan.color }]}>{plan.price}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.planSectionTitle}>Payment Method</Text>
              <View style={styles.paymentToggleRow}>
                <TouchableOpacity style={[styles.paymentToggleBtn, paymentMethod === 'bank' && styles.paymentToggleBtnActive]} onPress={() => setPaymentMethod('bank')}>
                  <Text style={[styles.paymentToggleText, paymentMethod === 'bank' && styles.paymentToggleTextActive]}>🏦 Bank Transfer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.paymentToggleBtn, paymentMethod === 'paystack' && styles.paymentToggleBtnActive]} onPress={() => setPaymentMethod('paystack')}>
                  <Text style={[styles.paymentToggleText, paymentMethod === 'paystack' && styles.paymentToggleTextActive]}>💳 Paystack</Text>
                </TouchableOpacity>
              </View>
              {paymentMethod === 'bank' && (
                <View style={styles.bankSection}>
                  <Text style={styles.bankSectionNote}>Transfer {selectedPlan === 'monthly' ? '₦35,000' : '₦15,000'} to any account below, then tap "I've Paid"</Text>
                  {BANK_ACCOUNTS.map((acc, i) => (
                    <View key={i} style={styles.bankCard}>
                      <View style={styles.bankCardTop}><Text style={styles.bankName}>{acc.bank}</Text></View>
                      <View style={styles.bankCardBody}>
                        <View>
                          <Text style={styles.bankAccNumber}>{acc.number}</Text>
                          <Text style={styles.bankAccName}>{acc.name}</Text>
                        </View>
                        <TouchableOpacity style={[styles.copyBtn, copiedAccount === acc.bank && styles.copyBtnCopied]} onPress={() => handleCopyAccount(acc.number, acc.bank)}>
                          <Text style={styles.copyBtnText}>{copiedAccount === acc.bank ? '✓ Copied' : 'Copy'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
              {paymentMethod === 'paystack' && (
                <View style={styles.paystackSection}>
                  <Text style={styles.paystackComingSoon}>🔜 Paystack Coming Soon</Text>
                  <Text style={styles.paystackDesc}>Online card and bank payment via Paystack will be available shortly. Please use bank transfer for now.</Text>
                </View>
              )}
              <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade}>
                <Text style={styles.upgradeBtnText}>{paymentMethod === 'paystack' ? '💳 Pay with Paystack — Coming Soon' : "✅ I've Paid — Activate Premium"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={() => setShowUpgradeModal(false)}>
                <Text style={styles.skipText}>Continue with Free listing</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6F1' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  premiumBadge: { backgroundColor: '#C9A84C', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  premiumBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  upgradeBanner: { marginHorizontal: 20, backgroundColor: '#C9A84C', borderRadius: 12, padding: 12, marginBottom: 16 },
  upgradeText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center', fontSize: 13 },
  upgradeSubText: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontSize: 11, marginTop: 3 },
  premiumActiveBanner: { marginHorizontal: 20, backgroundColor: '#1B4332', borderRadius: 12, padding: 12, marginBottom: 16 },
  premiumActiveText: { color: '#C9A84C', fontWeight: '700', textAlign: 'center', fontSize: 13 },
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
  photoLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 4 },
  photoCount: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  photoBox: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 2, borderColor: '#E5E0D5', borderStyle: 'dashed', padding: 24, alignItems: 'center', marginBottom: 8 },
  photoText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
  photoSub: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  photoThumb: { width: 80, height: 80, borderRadius: 10, marginRight: 8 },
  upgradePhotoHint: { fontSize: 12, color: '#C9A84C', fontWeight: '700', marginBottom: 14 },
  plansRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1 },
  planFree: { backgroundColor: '#FFFFFF', borderColor: '#E5E0D5' },
  planFeatured: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  planSelected: { borderColor: '#1B4332', borderWidth: 2 },
  planFeaturedSelected: { borderColor: '#C9A84C', borderWidth: 2 },
  featuredLabel: { fontSize: 10, color: '#C9A84C', fontWeight: '800', marginBottom: 4 },
  planName: { fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  planPrice: { fontSize: 18, fontWeight: '900', color: '#1B4332', marginBottom: 8 },
  planFeature: { fontSize: 11, color: '#6B7280', marginBottom: 3 },
  planFeatureW: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 3 },
  submitBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  disclaimer: { fontSize: 11, color: '#6B7280', textAlign: 'center', lineHeight: 17 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', marginTop: 16 },
  successSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 21 },
  successBadge: { marginTop: 20, backgroundColor: '#EDF7EE', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  successBadgeText: { color: '#1B4332', fontWeight: '700', fontSize: 14 },
  premiumSuccessBadge: { marginTop: 10, backgroundColor: '#FFF8E7', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 8 },
  premiumSuccessText: { color: '#C9A84C', fontWeight: '800', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingHorizontal: 20, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E5E0D5', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  benefitIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  benefitText: { flex: 1 },
  benefitTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  benefitDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  planSectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginTop: 8, marginBottom: 12 },
  planOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F6F1', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  planOptionSelected: { borderColor: '#1B4332', backgroundColor: '#EDF7EE' },
  planOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  planRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  planRadioSelected: { borderColor: '#1B4332' },
  planRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1B4332' },
  planLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planOptionName: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  planTag: { backgroundColor: '#FFF8E7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  planTagText: { fontSize: 9, color: '#C9A84C', fontWeight: '800' },
  planOptionDesc: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  planOptionPrice: { fontSize: 16, fontWeight: '900' },
  paymentToggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  paymentToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: '#E5E0D5', alignItems: 'center', backgroundColor: '#F8F6F1' },
  paymentToggleBtnActive: { borderColor: '#1B4332', backgroundColor: '#EDF7EE' },
  paymentToggleText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  paymentToggleTextActive: { color: '#1B4332' },
  bankSection: { marginBottom: 16 },
  bankSectionNote: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 12, lineHeight: 18 },
  bankCard: { backgroundColor: '#F8F6F1', borderRadius: 14, borderWidth: 1, borderColor: '#E5E0D5', marginBottom: 10, overflow: 'hidden' },
  bankCardTop: { backgroundColor: '#1B4332', paddingHorizontal: 14, paddingVertical: 8 },
  bankName: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  bankCardBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  bankAccNumber: { fontSize: 20, fontWeight: '900', color: '#1A1A1A', letterSpacing: 1 },
  bankAccName: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  copyBtn: { backgroundColor: '#1B4332', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  copyBtnCopied: { backgroundColor: '#C9A84C' },
  copyBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  paystackSection: { backgroundColor: '#FFF8E7', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16 },
  paystackComingSoon: { fontSize: 16, fontWeight: '800', color: '#C9A84C', marginBottom: 8 },
  paystackDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  upgradeBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  upgradeBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
});
