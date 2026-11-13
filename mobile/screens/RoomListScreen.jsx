import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { roomApi } from '../services/api';

export default function RoomListScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getRooms();
      setRooms(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'Còn trống', bg: '#dcfce7', color: '#15803d' };
      case 'RENTED':
        return { label: 'Đang thuê', bg: '#dbeafe', color: '#1d4ed8' };
      case 'MAINTENANCE':
        return { label: 'Bảo trì', bg: '#fef3c7', color: '#b45309' };
      default:
        return { label: status, bg: '#f1f5f9', color: '#475569' };
    }
  };

  const renderRoom = ({ item }) => {
    const badge = getStatusBadge(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RoomDetail', { roomId: item._id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.roomNumber}>Phòng {item.roomNumber}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        <Text style={styles.price}>{item.basePrice?.toLocaleString('vi-VN')} đ/tháng</Text>

        <View style={styles.specsRow}>
          <Text style={styles.spec}>📐 {item.area} m²</Text>
          <Text style={styles.spec}>👥 Tối đa {item.maxOccupants} người</Text>
        </View>

        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.amenities}>
          {(item.amenities || []).map((a, i) => (
            <Text key={i} style={styles.amenityChip}>{a}</Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Danh Sách Phòng</Text>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => navigation.navigate('RoomSearch')}
        >
          <Text style={styles.searchBtnText}>🔍 Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'AVAILABLE', label: 'Còn trống' },
          { key: 'RENTED', label: 'Đang thuê' },
          { key: 'MAINTENANCE', label: 'Bảo trì' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, filterStatus === tab.key && styles.activeTab]}
            onPress={() => setFilterStatus(tab.key)}
          >
            <Text style={[styles.tabText, filterStatus === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item._id}
          renderItem={renderRoom}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchRooms(); }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy phòng trọ nào phù hợp.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  searchBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  searchBtnText: { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  tabs: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  activeTab: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#ffffff', fontWeight: '700' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomNumber: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  price: { fontSize: 16, fontWeight: '800', color: '#2563eb', marginVertical: 6 },
  specsRow: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  spec: { fontSize: 13, color: '#64748b' },
  desc: { fontSize: 12, color: '#475569', marginBottom: 8, lineHeight: 18 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityChip: {
    fontSize: 11,
    backgroundColor: '#f8fafc',
    color: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 },
});
