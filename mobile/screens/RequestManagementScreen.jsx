import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { rentalRequestApi } from '../services/api';

export default function RequestManagementScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await rentalRequestApi.getRequests();
      setRequests(res.data.data || []);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = (id, newStatus, currentItem) => {
    const actionText = newStatus === 'APPROVED' ? 'Phê duyệt' : 'Từ chối';
    Alert.alert(
      `Xác nhận ${actionText}`,
      `Bạn có chắc chắn muốn ${actionText.toLowerCase()} yêu cầu thuê phòng của ${currentItem.tenantName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: newStatus === 'REJECTED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setActionLoadingId(id);
              await rentalRequestApi.updateStatus(id, newStatus);
              Alert.alert(
                'Thành công',
                `${actionText} yêu cầu thành công!`,
                newStatus === 'APPROVED' ? [
                  {
                    text: 'Lập hợp đồng ngay',
                    onPress: () => {
                      if (navigation?.navigate) {
                        navigation.navigate('ManageContract', {
                          prefill: {
                            roomId: currentItem.roomId?._id,
                            roomNumber: currentItem.roomId?.roomNumber,
                            tenantName: currentItem.tenantName,
                            rentalPrice: currentItem.roomId?.basePrice
                          }
                        });
                      }
                    }
                  },
                  { text: 'Đóng', style: 'cancel' }
                ] : [{ text: 'Đóng' }]
              );
              fetchRequests();
            } catch (err) {
              Alert.alert('Lỗi thao tác', err.response?.data?.message || err.message);
            } finally {
              setActionLoadingId(null);
            }
          }
        }
      ]
    );
  };

  const filteredRequests = requests.filter(item => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Đã duyệt', bg: '#dcfce7', color: '#166534' };
      case 'REJECTED':
        return { text: 'Đã từ chối', bg: '#fee2e2', color: '#991b1b' };
      default:
        return { text: 'Chờ xử lý', bg: '#fef3c7', color: '#92400e' };
    }
  };

  const renderItem = ({ item }) => {
    const badge = getStatusBadge(item.status);
    const room = item.roomId || {};
    const isPending = item.status === 'PENDING';
    const isCurrentAction = actionLoadingId === item._id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.roomTitle}>Phòng {room.roomNumber || '---'}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        <Text style={styles.priceText}>
          Giá niêm yết: {room.basePrice ? Number(room.basePrice).toLocaleString('vi-VN') + ' đ/tháng' : '---'}
        </Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Khách gửi yêu cầu:</Text>
          <Text style={styles.infoValueBold}>{item.tenantName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoValue}>{item.tenantPhone || 'Chưa cung cấp'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày gửi:</Text>
          <Text style={styles.infoValue}>
            {item.requestDate ? new Date(item.requestDate).toLocaleDateString('vi-VN') : '---'}
          </Text>
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
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Lời nhắn:</Text>
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        ) : null}

        {isPending && (
          <View style={styles.actionsContainer}>
            {isCurrentAction ? (
              <ActivityIndicator color="#2563eb" />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleUpdateStatus(item._id, 'APPROVED', item)}
                >
                  <Text style={styles.actionBtnText}>✓ Phê duyệt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleUpdateStatus(item._id, 'REJECTED', item)}
                >
                  <Text style={[styles.actionBtnText, styles.rejectBtnText]}>✕ Từ chối</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý yêu cầu thuê phòng</Text>
        <Text style={styles.subtitle}>Phê duyệt hoặc từ chối các yêu cầu giữ phòng từ khách</Text>

        <View style={styles.filterRow}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, filterStatus === st && styles.filterChipActive]}
              onPress={() => setFilterStatus(st)}
            >
              <Text style={[styles.filterChipText, filterStatus === st && styles.filterChipTextActive]}>
                {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ duyệt' : st === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có yêu cầu thuê nào.</Text>
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
  title: { fontSize: 19, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 3, marginBottom: 12 },
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
  roomTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  priceText: { fontSize: 14, color: '#2563eb', fontWeight: '600', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 13, color: '#1e293b' },
  infoValueBold: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  noteBox: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 4 },
  noteLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  noteText: { fontSize: 13, color: '#334155', marginTop: 2 },
  actionsContainer: { flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  approveBtn: { backgroundColor: '#16a34a' },
  rejectBtn: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  actionBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  rejectBtnText: { color: '#b91c1c' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 15, color: '#64748b' }
});

