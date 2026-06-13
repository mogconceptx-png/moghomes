import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, FlatList,
} from 'react-native';

const ALL_PROPERTIES = [
  { id: '1', title: 'Luxury 4-Bedroom Duplex', location: 'Lekki Phase 1, Lagos', price: '₦85,000,000', type: 'Buy', beds: 4, baths: 3, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', verified: true },
  { id: '2', title: 'Modern 3-Bedroom Apartment', location: 'Victoria Island, Lagos', price: '₦2,500,000/yr', type: 'Rent', beds: 3, baths: 2, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', verified: true },
  { id: '3', title: 'Executive 5-Bedroom Mansion', location: 'Banana Island, Lagos', price: '₦320,000,000', type: 'Buy', beds: 5, baths: 5, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', verified: false },
  { id: '4', title: '2-Bedroom Flat', location: 'Ikeja GRA, Lagos', price: '₦1,800,000/yr', type: 'Rent', beds: 2, baths: 1, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', verified: true },
  { id: '5', title: 'Land (600 sqm)', location: 'Ibeju-Lekki, Lagos', price: '₦12,000,000', type: 'Land', beds: 0, baths: 0, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400', verified: false },
  { id: '6', title: '3-Bedroom Terrace', location: 'Ajah, Lagos', price: '₦45,000,000', type: 'Buy', beds: 3, baths: 2, image: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400', verified: true },
  { id: '7', title: 'Studio Apartment', location: 'Yaba, Lagos', price: '₦900,000/yr', type: 'Rent', beds: 1, baths: 1, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', verified: true },
  { id: '8', title: 'Commercial Space', location: 'Surulere, Lagos', price: '₦5,000,000/yr', type: 'Commercial', beds: 0, baths: 2, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', verified: false },
];

const TYPES = ['All', 'Buy', 'Rent', 'Land', 'Commercial'];
const BEDS = ['Any', '1', '2', '3', '4', '5+'];

function SearchResult({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.resultCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultPrice}>{item.price}</Text>
        <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.resultLocation} numberOfLines={1}>📍 {item.location}</Text>
        <View style={styles.resultMeta}>
          {item.beds > 0 && <Text style={styles.metaChip}>🛏 {item.beds}</Text>}
          {item.baths > 0 && <Text style={styles.metaChip}>🚿 {item.baths}</Text>}
          <Text style={[styles.typePill, { backgroundColor: item.type === 'Rent' ? '#1B4332' : '#C9A84C' }]}>
            {item.type}
          </Text>
          {item.verified && <Text style={styles.verifiedChip}>✅</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [activeBeds, setActiveBeds] = useState('Any');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = ALL_PROPERTIES.filter(p => {
    const matchQuery =
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.location.toLowerCase().includes(query.toLowerCase());
    const matchType = activeType === 'All' || p.type === activeType;
    const matchBeds =
      activeBeds === 'Any' ||
      (activeBeds === '5+' ? p.beds >= 5 : p.beds === parseInt(activeBeds));
    return matchQuery && matchType && matchBeds;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Properties</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Location, property name..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: '#6B7280', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && { backgroundColor: '#1B4332' }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>Property Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.filterChip, activeType === t && styles.filterChipActive]}
                onPress={() => setActiveType(t)}
              >
                <Text style={[styles.filterChipText, activeType === t && { color: '#FFFFFF' }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Bedrooms</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BEDS.map(b => (
              <TouchableOpacity
                key={b}
                style={[styles.filterChip, activeBeds === b && styles.filterChipActive]}
                onPress={() => setActiveBeds(b)}
              >
                <Text style={[styles.filterChipText, activeBeds === b && { color: '#FFFFFF' }]}>
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{filtered.length} properties found</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 40 }}>🏠</Text>
            <Text style={styles.emptyText}>No properties found</Text>
            <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SearchResult
            item={item}
            onPress={() => navigation.navigate('PropertyDetail', { property: item })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6F1' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8, alignItems: 'center', gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E0D5' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  filterBtn: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E5E0D5' },
  filtersPanel: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E0D5' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E0D5', marginRight: 8, backgroundColor: '#F8F6F1' },
  filterChipActive: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  filterChipText: { fontSize: 13, color: '#1A1A1A', fontWeight: '600' },
  resultsHeader: { paddingHorizontal: 20, paddingVertical: 6 },
  resultsCount: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  resultCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E0D5', elevation: 2 },
  resultImage: { width: 110, height: 100 },
  resultInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  resultPrice: { fontSize: 15, fontWeight: '900', color: '#1B4332' },
  resultTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginTop: 3 },
  resultLocation: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 4 },
  metaChip: { fontSize: 11, color: '#6B7280' },
  typePill: { fontSize: 10, color: '#FFFFFF', fontWeight: '700', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedChip: { fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
});
