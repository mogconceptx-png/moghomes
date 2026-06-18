import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image, FlatList, ActivityIndicator } from 'react-native';
import { db } from '../firebase';
import { collection, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';

const CATEGORIES = ['All', 'Buy', 'Rent', 'Land', 'Commercial', 'Short Let'];

const CATEGORY_TYPE_MAP = {
  'Buy': 'For Sale',
  'Rent': 'For Rent',
  'Land': 'Land',
  'Commercial': 'Commercial',
  'Short Let': 'Short Let',
};

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600';

function FeaturedCard({ item, onPress }) {
  const [saved, setSaved] = useState(false);
  const image = item.images?.[0] || item.image || PLACEHOLDER_IMAGE;
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.92}>
      <Image source={{ uri: image }} style={styles.featuredImage} />
      <TouchableOpacity style={styles.heartBtn} onPress={() => setSaved(!saved)}>
        <Text style={{ fontSize: 18 }}>{saved ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
      <View style={[styles.typeBadge, { backgroundColor: item.type === 'For Rent' ? '#1B4332' : '#C9A84C' }]}>
        <Text style={styles.typeText}>{item.type}</Text>
      </View>
      {item.isPremium && (
        <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>⭐</Text></View>
      )}
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredPrice}>₦{Number(item.price).toLocaleString()}</Text>
        <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.featuredLocation}>📍 {item.location}, {item.state}</Text>
        <View style={styles.featuredRow}>
          {item.beds > 0 && <Text style={styles.metaItem}>🛏 {item.beds} beds</Text>}
          {item.baths > 0 && <Text style={styles.metaItem}>🚿 {item.baths} baths</Text>}
          <Text style={styles.agentName}>{item.verified ? '✅ Verified' : '⏳ Pending'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecentCard({ item, onPress }) {
  const [saved, setSaved] = useState(false);
  const image = item.images?.[0] || item.image || PLACEHOLDER_IMAGE;
  return (
    <TouchableOpacity style={styles.recentCard} onPress={onPress} activeOpacity={0.92}>
      <Image source={{ uri: image }} style={styles.recentImage} />
      <View style={styles.recentInfo}>
        <Text style={styles.recentPrice}>₦{Number(item.price).toLocaleString()}</Text>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.recentLocation} numberOfLines={1}>📍 {item.location}</Text>
        {item.beds > 0 && <Text style={styles.recentMeta}>🛏 {item.beds}  🚿 {item.baths}  {item.verified ? '✅' : '⏳'}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const featuredQ = query(collection(db, 'listings'), where('isPremium', '==', true), orderBy('createdAt', 'desc'), limit(10));
    const unsubFeatured = onSnapshot(featuredQ, snap => {
      setFeatured(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => setFeatured([]));

    const recentQ = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(20));
    const unsubRecent = onSnapshot(recentQ, snap => {
      setRecent(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => { setRecent([]); setLoading(false); });

    return () => { unsubFeatured(); unsubRecent(); };
  }, []);

  const filteredRecent = activeCategory === 'All'
    ? recent
    : recent.filter(l => l.type === CATEGORY_TYPE_MAP[activeCategory]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day 👋</Text>
            <Text style={styles.tagline}>Find your dream property</Text>
          </View>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>MOG</Text>
            <Text style={styles.logoSub}>HOMES</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.searchBox} onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search location, area, landmark...</Text>
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[styles.catBtn, activeCategory === cat && styles.catBtnActive]} onPress={() => setActiveCategory(cat)}>
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.statsBanner}>
          <View style={styles.statItem}><Text style={styles.statNum}>{recent.length || '0'}</Text><Text style={styles.statLabel}>Listings</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statNum}>{featured.length || '0'}</Text><Text style={styles.statLabel}>Featured</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statNum}>🇳🇬</Text><Text style={styles.statLabel}>Nigeria</Text></View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#1B4332" style={{ marginLeft: 20 }} />
        ) : featured.length === 0 ? (
          <Text style={styles.emptyText}>No featured listings yet</Text>
        ) : (
          <FlatList data={featured} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }} renderItem={({ item }) => <FeaturedCard item={item} onPress={() => navigation.navigate('PropertyDetail', { property: item })} />} />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'All' ? 'Recent Listings' : activeCategory + ' Listings'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#1B4332" style={{ marginLeft: 20 }} />
        ) : filteredRecent.length === 0 ? (
          <Text style={styles.emptyText}>No listings in this category yet</Text>
        ) : (
          filteredRecent.map(item => <RecentCard key={item.id} item={item} onPress={() => navigation.navigate('PropertyDetail', { property: item })} />)
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6F1' },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greeting: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tagline: { fontSize: 20, color: '#1A1A1A', fontWeight: '800', marginTop: 2 },
  logoBox: { alignItems: 'center', backgroundColor: '#1B4332', borderRadius: 10, padding: 8, paddingHorizontal: 12 },
  logoText: { fontSize: 16, color: '#C9A84C', fontWeight: '900', letterSpacing: 2 },
  logoSub: { fontSize: 8, color: '#FFFFFF', fontWeight: '700', letterSpacing: 3 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, elevation: 3, marginBottom: 16, borderWidth: 1, borderColor: '#E5E0D5' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchPlaceholder: { fontSize: 14, color: '#6B7280' },
  catScroll: { paddingLeft: 20, marginBottom: 16 },
  catBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 10, borderWidth: 1, borderColor: '#E5E0D5' },
  catBtnActive: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  catText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  catTextActive: { color: '#FFFFFF' },
  statsBanner: { flexDirection: 'row', backgroundColor: '#1B4332', marginHorizontal: 20, borderRadius: 16, padding: 16, justifyContent: 'space-around', marginBottom: 24 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 20, color: '#C9A84C', fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#FFFFFF', marginTop: 2, opacity: 0.8 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
  seeAll: { fontSize: 13, color: '#1B4332', fontWeight: '600' },
  emptyText: { fontSize: 13, color: '#6B7280', marginLeft: 20, marginBottom: 16 },
  featuredCard: { width: 260, marginRight: 14, borderRadius: 18, backgroundColor: '#FFFFFF', elevation: 5, marginBottom: 20, overflow: 'hidden' },
  featuredImage: { width: '100%', height: 160 },
  heartBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 6 },
  typeBadge: { position: 'absolute', top: 12, left: 12, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  premiumBadge: { position: 'absolute', top: 44, left: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  premiumBadgeText: { fontSize: 12 },
  typeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  featuredInfo: { padding: 14 },
  featuredPrice: { fontSize: 18, fontWeight: '900', color: '#1B4332' },
  featuredTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginTop: 4 },
  featuredLocation: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  featuredRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, flexWrap: 'wrap' },
  metaItem: { fontSize: 12, color: '#6B7280', marginRight: 10 },
  agentName: { fontSize: 11, color: '#1B4332', fontWeight: '600' },
  recentCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 14, marginBottom: 12, elevation: 3, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E0D5' },
  recentImage: { width: 110, height: 100 },
  recentInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  recentPrice: { fontSize: 15, fontWeight: '900', color: '#1B4332' },
  recentTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginTop: 3 },
  recentLocation: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  recentMeta: { fontSize: 11, color: '#6B7280', marginTop: 4 },
});
