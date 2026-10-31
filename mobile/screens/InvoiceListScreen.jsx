import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { getInvoices } from '../services/api';

export default function InvoiceListScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.log('Error loading invoices:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    if (filter === 'ALL') return true;
    return inv.status === filter;
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧾 Danh sách Hóa đơn (UC08)</Text>
      <Text style={styles.subtitle}>Quản lý hóa đơn tiền phòng và dịch vụ hàng tháng</Text>

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
          <Text style={styles.emptyText}>Chưa có hóa đơn nào phù hợp.</Text>
        </View>
      ) : (
        filtered.map((inv) => {
          const isPaid = inv.status === 'PAID';
          return (
            <TouchableOpacity
              key={inv._id}
              style={styles.invoiceCard}
              onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv._id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.invoiceCode}>{inv.invoiceCode}</Text>
                <Text style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
                  {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </Text>
              </View>

              <Text style={styles.tenantText}>👤 Khách thuê: {inv.tenantName} • P.{inv.room?.roomNumber}</Text>
              <Text style={styles.monthText}>📅 Kỳ: Tháng {inv.month}</Text>

              <View style={styles.footerRow}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={[styles.totalAmount, { color: isPaid ? '#16a34a' : '#b91c1c' }]}>
                  {inv.totalAmount?.toLocaleString('vi-VN')} VNĐ
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
  title: { fontSize: 20, fontWeight: '800', color: '#1e3a8a', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#1e3a8a' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterTextActive: { color: '#ffffff' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748b' },
  invoiceCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  invoiceCode: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, fontSize: 10, fontWeight: 'bold' },
  paidBadge: { backgroundColor: '#dcfce7', color: '#15803d' },
  unpaidBadge: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  tenantText: { fontSize: 13, color: '#1e293b', marginBottom: 4 },
  monthText: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  totalLabel: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  totalAmount: { fontSize: 16, fontWeight: '800' }
});
