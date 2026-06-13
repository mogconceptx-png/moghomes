import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;
  const [saved, setSaved] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const images = [property.image, property.image, property.image];

  const handleCall = () => Linking.openURL('tel:+2348012345678');
  const handleWhatsApp = () => Linking.openURL('https://wa.me/2348012345678?text=Hi, I am interested in ' + property.title);

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onScroll={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
          scrollEventThrottle={16}
        >
          {images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={[styles.mainImage, { width }]} />
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setSaved(!saved)}>
            <Text style={{ fontSize: 20 }}>{saved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={{ fontSize: 20 }}>🔗</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{property.price}</Text>
            <View style={[styles.badge, { backgroundColor: property.type === 'For Rent' ? '#1B4332' : '#C9A84C' }]}>
              <Text style={styles.badgeText}>{property.type}</Text>
            </View>
          </View>

          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.location}>📍 {property.location}</Text>

          <View style={styles.features}>
            {property.beds > 0 && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🛏</Text>
                <Text style={styles.featureNum}>{property.beds}</Text>
                <Text style={styles.featureLabel}>Bedrooms</Text>
              </View>
            )}
            {property.baths > 0 && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🚿</Text>
                <Text style={styles.featureNum}>{property.baths}</Text>
                <Text style={styles.featureLabel}>Bathrooms</Text>
              </View>
            )}
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📐</Text>
              <Text style={styles.featureNum}>450</Text>
              <Text style={styles.featureLabel}>Sqm</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚗</Text>
              <Text style={styles.featureNum}>2</Text>
              <Text style={styles.featureLabel}>Parking</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            This stunning property offers premium finishes throughout, spacious rooms with excellent
            natural light, and a prime location with easy access to major roads, schools, and shopping
            centres. Features modern kitchen fittings, fitted wardrobes, backup generator, borehole
            water, 24-hour security, and CCTV surveillance.
          </Text>

          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenities}>
            {['🔒 Security', '💡 Generator', '💧 Borehole', '🏊 Pool', '🌿 Garden', '📡 DSTV'].map(a => (
              <View key={a} style={styles.amenityItem}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Listed by</Text>
          <TouchableOpacity
            style={styles.agentCard}
            onPress={() => navigation.navigate('Agent', { agentName: property.agent })}
          >
            <View style={styles.agentAvatar}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={styles.agentInfo}>
              <View style={styles.agentNameRow}>
                <Text style={styles.agentName}>{property.agent || 'MOG Agent'}</Text>
                {property.verified && <Text style={styles.verifiedBadge}>✅ Verified</Text>}
              </View>
              <Text style={styles.agentSub}>MOG Homes Certified Agent</Text>
              <Text style={styles.agentProperties}>12 active listings</Text>
            </View>
            <Text style={styles.arrowRight}>›</Text>
          </TouchableOpacity>

          <View style={styles.investBox}>
            <Text style={styles.investTitle}>📈 Investment Insight</Text>
            <Text style={styles.investText}>
              Estimated rental yield:{' '}
              <Text style={{ color: '#1B4332', fontWeight: '700' }}>8.2% per year</Text>
            </Text>
            <Text style={styles.investText}>
              Projected value in 3 years:{' '}
              <Text style={{ color: '#1B4332', fontWeight: '700' }}>+23%</Text>
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
          <Text style={styles.whatsappText}>💬 WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Text style={styles.callText}>📞 Call Agent</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6F1' },
  backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  backText: { fontSize: 14, fontWeight: '700', color: '#1B4332' },
  mainImage: { height: 280, resizeMode: 'cover' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E0D5', marginHorizontal: 3 },
  dotActive: { backgroundColor: '#1B4332', width: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, marginTop: 4 },
  actionBtn: { marginLeft: 12, padding: 6 },
  content: { paddingHorizontal: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  price: { fontSize: 24, fontWeight: '900', color: '#1B4332' },
  badge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginTop: 6 },
  location: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  features: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E5E0D5' },
  featureItem: { alignItems: 'center' },
  featureIcon: { fontSize: 20 },
  featureNum: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginTop: 4 },
  featureLabel: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 10, marginTop: 6 },
  description: { fontSize: 13, color: '#6B7280', lineHeight: 21, marginBottom: 16 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  amenityItem: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E0D5' },
  amenityText: { fontSize: 12, color: '#1A1A1A', fontWeight: '600' },
  agentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E5E0D5' },
  agentAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F8F6F1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  agentInfo: { flex: 1 },
  agentNameRow: { flexDirection: 'row', alignItems: 'center' },
  agentName: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginRight: 6 },
  verifiedBadge: { fontSize: 11, color: '#1B4332', fontWeight: '600' },
  agentSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  agentProperties: { fontSize: 11, color: '#1B4332', fontWeight: '600', marginTop: 2 },
  arrowRight: { fontSize: 24, color: '#6B7280' },
  investBox: { backgroundColor: '#EDF7EE', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#B7DFBA' },
  investTitle: { fontSize: 14, fontWeight: '800', color: '#1B4332', marginBottom: 6 },
  investText: { fontSize: 13, color: '#1A1A1A', marginBottom: 3 },
  bottomBar: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E0D5', gap: 12 },
  whatsappBtn: { flex: 1, backgroundColor: '#25D366', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  whatsappText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  callBtn: { flex: 1, backgroundColor: '#1B4332', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  callText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

