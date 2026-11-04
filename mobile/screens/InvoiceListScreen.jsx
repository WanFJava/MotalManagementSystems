import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { getInvoices, getCurrentUserStore, contractApi } from '../services/api';

export default function InvoiceListScreen({ navigation, route, currentUser: propUser }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const currentUser = propUser || route?.params?.currentUser || getCurrentUserStore();
  const isTenant = currentUser && currentUser.role === 'TENANT';

  useEffect(() => {
    loadInvoices();
  }, [currentUser]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      let list = data || [];

      // Phân quyền: Khách thuê chỉ xem hóa đơn của phòng mình thuê
      if (isTenant) {
        // Tìm số phòng của khách thuê từ hợp đồng
        let myRoomNumbers = [];
        try {
          const cRes = await contractApi.getContracts();
          const allContracts = cRes.data?.data || [];
          const myContracts = allContracts.filter(c => {
            const tId = c.tenantId?._id || c.tenantId;
            const matchId = tId && currentUser._id && tId.toString() === currentUser._id.toString();
            const matchPhone = currentUser.phone && c.tenantPhone === currentUser.phone;
            const matchCccd = currentUser.identityNumber && (
              c.tenantCccd === currentUser.identityNumber || 
              c.tenantIdentityNumber === currentUser.identityNumber
            );
            return matchId || matchPhone || matchCccd;
          });
          myRoomNumbers = myContracts.map(c => c.roomNumber).filter(Boolean);
        } catch (e) {
          // ignore
        }

        list = list.filter(inv => {
          const matchRoom = inv.room?.roomNumber && myRoomNumbers.includes(inv.room.roomNumber);
          const matchDirectRoom = inv.roomNumber && myRoomNumbers.includes(inv.roomNumber);
          const matchPhone = currentUser.phone && inv.tenantPhone === currentUser.phone;
          const matchName = currentUser.fullName && inv.tenantName && inv.tenantName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase();
          return matchRoom || matchDirectRoom || matchPhone || matchName;
        });
      }

      setInvoices(list);
    } catch (err) {
      console.log('Error loading invoices:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    if (filter === 'ALL') return true;
    return inv.status === filter;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadInvoices(); }} />
      }
    >
      <Text style={styles.title}>
        {isTenant ? '🧾 Hóa Đơn & Tiền Phòng' : '🧾 Quản Lý Hóa Đơn & VNPay'}
      </Text>
      <Text style={styles.subtitle}>
        {isTenant ? 'Theo dõi hóa đơn tiền điện, nước và thanh toán trực tuyến qua VNPay' : 'Quản lý hóa đơn tiền phòng và dịch vụ hàng tháng'}
      </Text>

      {/* Tabs lọc */}
      <View style={styles.filterRow}>
        {['ALL', 'UNPAID', 'PAID'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterBtn, filter === tab && styles.filterBtnActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
              {tab === 'ALL' ? 'Tất cả' : tab === 'UNPAID' ? '⏳ Chưa trả' : '✅ Đã trả'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🧾</Text>
          <Text style={styles.emptyText}>
            {isTenant ? 'Bạn không có hóa đơn nào trong danh mục này.' : 'Chưa có hóa đơn nào phù hợp.'}
          </Text>
        </View>
      ) : (
        filtered.map((inv) => {
          const isPaid = inv.status === 'PAID';
          return (
            <TouchableOpacity
              key={inv._id}
              style={styles.invoiceCard}
              onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv._id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.invoiceCode}>{inv.invoiceCode || 'HĐ-DICHVU'}</Text>
                <Text style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
                  {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </Text>
              </View>

              <Text style={styles.tenantText}>
                👤 Khách thuê: {inv.tenantName || '---'} • Phòng {inv.room?.roomNumber || inv.roomNumber || '---'}
              </Text>
              <Text style={styles.monthText}>📅 Kỳ hóa đơn: Tháng {inv.month || '---'}</Text>

              <View style={styles.footerRow}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={[styles.totalAmount, { color: isPaid ? '#16a34a' : '#b91c1c' }]}>
                  {(inv.totalAmount || 0).toLocaleString('vi-VN')} đ
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 18 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  filterTextActive: { color: '#ffffff' },
  emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center' },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  invoiceCode: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  statusBadge: { fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  paidBadge: { backgroundColor: '#dcfce7', color: '#15803d' },
  unpaidBadge: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  tenantText: { fontSize: 13, color: '#475569', marginBottom: 4 },
  monthText: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 8,
  },
  totalLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  totalAmount: { fontSize: 16, fontWeight: '900' },
});
