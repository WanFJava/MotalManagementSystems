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
import { contractApi } from '../services/api';

export default function ContractListScreen({ navigation }) {
  const [contracts, setContracts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await contractApi.getContracts();
      setContracts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { text: 'Hiệu lực', bg: '#dcfce7', color: '#166534' };
      case 'TERMINATED':
        return { text: 'Đã thanh lý', bg: '#fee2e2', color: '#991b1b' };
      case 'EXPIRED':
        return { text: 'Hết hạn', bg: '#f1f5f9', color: '#64748b' };
      default:
        return { text: status || 'DRAFT', bg: '#fef3c7', color: '#92400e' };
    }
  };

  const renderItem = ({ item }) => {
    const roomInfo = item.roomId || item.room || {};
    const badge = getStatusBadge(item.status);
    const startStr = item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : '---';
    const endStr = item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '---';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          if (navigation?.navigate) {
            navigation.navigate('ContractDetail', { contractId: item._id });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.roomText}>Hợp đồng phòng {roomInfo.roomNumber || '---'}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        <Text style={styles.tenantName}>Người thuê: {item.tenantName}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Giá thuê:</Text>
          <Text style={styles.priceHighlight}>
            {Number(item.rentalPrice || 0).toLocaleString('vi-VN')} đ/tháng
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tiền cọc:</Text>
          <Text style={styles.val}>
            {Number(item.depositAmount || 0).toLocaleString('vi-VN')} đ
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Thời hạn:</Text>
          <Text style={styles.val}>{startStr} → {endStr}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailText}>Xem chi tiết & thao tác →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Danh sách hợp đồng</Text>
            <Text style={styles.subtitle}>Quản lý các hợp đồng thuê phòng</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation?.navigate && navigation.navigate('ManageContract')}
          >
            <Text style={styles.addButtonText}>+ Lập HĐ mới</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {['ALL', 'ACTIVE', 'TERMINATED', 'EXPIRED'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, filterStatus === st && styles.filterChipActive]}
              onPress={() => setFilterStatus(st)}
            >
              <Text style={[styles.filterChipText, filterStatus === st && styles.filterChipTextActive]}>
                {st === 'ALL' ? 'Tất cả' : st === 'ACTIVE' ? 'Đang hiệu lực' : st === 'TERMINATED' ? 'Đã thanh lý' : 'Hết hạn'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredContracts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchContracts(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có hợp đồng nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b' },
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9' },
  filterChipActive: { backgroundColor: '#2563eb' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterChipTextActive: { color: '#ffffff' },
  listContent: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomText: { fontSize: 17, fontWeight: 'bold', color: '#0f172a' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  tenantName: { fontSize: 14, color: '#334155', marginTop: 4, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, color: '#64748b' },
  val: { fontSize: 13, color: '#1e293b', fontWeight: '500' },
  priceHighlight: { fontSize: 14, color: '#2563eb', fontWeight: 'bold' },
  cardFooter: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f8fafc', alignItems: 'flex-end' },
  viewDetailText: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 15, color: '#64748b' }
});

