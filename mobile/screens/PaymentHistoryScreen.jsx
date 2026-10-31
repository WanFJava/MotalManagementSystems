import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { getPaymentTransactions } from '../services/api';

export default function PaymentHistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getPaymentTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.log('Error loading transactions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📜 Lịch sử Thanh toán</Text>
      <Text style={styles.subtitle}>Ghi nhận các giao dịch thanh toán thành công (MongoDB)</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có giao dịch thanh toán nào được ghi nhận.</Text>
        </View>
      ) : (
        transactions.map((tx) => (
          <View key={tx._id} style={styles.txCard}>
            <View style={styles.headerRow}>
              <Text style={styles.txCode}>{tx.transactionCode}</Text>
              <Text style={styles.methodBadge}>{tx.paymentMethod}</Text>
            </View>

            <Text style={styles.txDate}>
              📅 Thời gian: {new Date(tx.paidAt || tx.createdAt).toLocaleString('vi-VN')}
            </Text>

            <View style={styles.amountRow}>
              <Text style={styles.noteText}>{tx.note || 'Thanh toán hóa đơn'}</Text>
              <Text style={styles.txAmount}>+{tx.amount?.toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1e3a8a', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748b' },
  txCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  txCode: { fontSize: 13, fontWeight: 'bold', color: '#1e3a8a' },
  methodBadge: { backgroundColor: '#dbeafe', color: '#1e40af', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, fontSize: 10, fontWeight: 'bold' },
  txDate: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  noteText: { fontSize: 12, color: '#475569', flex: 1 },
  txAmount: { fontSize: 15, fontWeight: '800', color: '#16a34a' }
});
