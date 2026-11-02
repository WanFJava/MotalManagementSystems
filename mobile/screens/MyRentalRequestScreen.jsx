import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { rentalRequestApi } from '../services/api';

export default function MyRentalRequestScreen({ navigation, route }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await rentalRequestApi.getRequests();
      setRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Đã duyệt (Chờ ký HĐ)', bg: '#dcfce7', color: '#166534' };
      case 'REJECTED':
        return { text: 'Bị từ chối', bg: '#fee2e2', color: '#991b1b' };
      case 'CANCELLED':
        return { text: 'Đã hủy', bg: '#f1f5f9', color: '#64748b' };
      default:
        return { text: 'Đang chờ duyệt', bg: '#fef3c7', color: '#92400e' };
    }
  };

  const renderItem = ({ item }) => {
    const badge = getStatusBadge(item.status);
    const room = item.roomId || {};
    const dateFormatted = item.requestDate ? new Date(item.requestDate).toLocaleDateString('vi-VN') : '---';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.roomTitle}>Phòng {room.roomNumber || 'N/A'}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        <Text style={styles.priceText}>
          Giá thuê dự kiến: {room.basePrice ? Number(room.basePrice).toLocaleString('vi-VN') + ' đ/tháng' : 'Chưa cập nhật'}
        </Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Khách thuê:</Text>
          <Text style={styles.infoValue}>{item.tenantName} ({item.tenantPhone || 'Không có SĐT'})</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày gửi yêu cầu:</Text>
          <Text style={styles.infoValue}>{dateFormatted}</Text>
        </View>

        {item.expectedMoveInDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dự kiến vào ở:</Text>
            <Text style={styles.infoValue}>
              {new Date(item.expectedMoveInDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}

        {item.note ? (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Ghi chú:</Text>
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yêu cầu thuê phòng của tôi</Text>
        <Text style={styles.subtitle}>Theo dõi tiến độ duyệt yêu cầu từ ban quản lý</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRequests(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bạn chưa gửi yêu cầu thuê phòng nào.</Text>
              <TouchableOpacity
                style={styles.newRequestBtn}
                onPress={() => navigation?.navigate && navigation.navigate('RentalRequest')}
              >
                <Text style={styles.newRequestBtnText}>+ Gửi yêu cầu ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 3 },
  listContent: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  priceText: { fontSize: 14, color: '#2563eb', fontWeight: '600', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#1e293b' },
  noteContainer: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 4 },
  noteLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  noteText: { fontSize: 13, color: '#334155', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 15, color: '#64748b', marginBottom: 15 },
  newRequestBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  newRequestBtnText: { color: '#ffffff', fontWeight: 'bold' }
});

