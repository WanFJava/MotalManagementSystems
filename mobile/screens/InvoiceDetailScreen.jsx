import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getInvoiceById, payCash } from '../services/api';

export default function InvoiceDetailScreen({ route, navigation }) {
  const invoiceId = route?.params?.invoiceId;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoiceId) loadDetail();
  }, [invoiceId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết hóa đơn: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayCash = async () => {
    Alert.alert('Xác nhận thu tiền', 'Bạn xác nhận đã thu đủ tiền mặt cho hóa đơn này?', [
      { text: 'Hủy' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            await payCash(invoiceId, 'Xác nhận thu tiền mặt trên Mobile App');
            Alert.alert('Thành công', 'Hóa đơn đã được chuyển sang trạng thái ĐÃ THANH TOÁN (PAID)!');
            loadDetail();
          } catch (err) {
            Alert.alert('Lỗi', err.response?.data?.message || err.message);
          }
        }
      }
    ]);
  };

  if (loading || !invoice) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: '#64748b' }}>Đang tải hóa đơn...</Text>
      </View>
    );
  }

  const isPaid = invoice.status === 'PAID';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📄 CHI TIẾT HÓA ĐƠN</Text>
      <Text style={styles.codeText}>Mã: {invoice.invoiceCode}</Text>

      {/* Thông tin phòng & khách */}
      <View style={styles.card}>
        <Text style={styles.infoRow}><Text style={styles.bold}>Phòng:</Text> {invoice.room?.roomNumber}</Text>
        <Text style={styles.infoRow}><Text style={styles.bold}>Khách thuê:</Text> {invoice.tenantName}</Text>
        <Text style={styles.infoRow}><Text style={styles.bold}>Kỳ tháng:</Text> {invoice.month}</Text>
        <Text style={styles.infoRow}>
          <Text style={styles.bold}>Trạng thái:</Text>{' '}
          <Text style={{ color: isPaid ? '#16a34a' : '#b91c1c', fontWeight: 'bold' }}>
            {isPaid ? `ĐÃ THANH TOÁN (${invoice.paymentMethod})` : 'CHƯA THANH TOÁN'}
          </Text>
        </Text>
      </View>

      {/* Chi tiết từng khoản phí */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Bảng chiết tính chi phí</Text>
        
        <View style={styles.tableRow}>
          <Text style={styles.itemText}>Tiền phòng:</Text>
          <Text style={styles.priceText}>{invoice.roomAmount?.toLocaleString('vi-VN')} đ</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.itemText}>⚡ Điện ({invoice.electricUsage} kWh):</Text>
          <Text style={styles.priceText}>{invoice.electricAmount?.toLocaleString('vi-VN')} đ</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.itemText}>💧 Nước ({invoice.waterUsage} m³):</Text>
          <Text style={styles.priceText}>{invoice.waterAmount?.toLocaleString('vi-VN')} đ</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.itemText}>Mạng Internet:</Text>
          <Text style={styles.priceText}>{invoice.internetFee?.toLocaleString('vi-VN')} đ</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.itemText}>Rác & Vệ sinh:</Text>
          <Text style={styles.priceText}>{invoice.garbageFee?.toLocaleString('vi-VN')} đ</Text>
        </View>

        {invoice.otherFees > 0 && (
          <View style={styles.tableRow}>
            <Text style={styles.itemText}>Phụ phí khác:</Text>
            <Text style={styles.priceText}>{invoice.otherFees?.toLocaleString('vi-VN')} đ</Text>
          </View>
        )}

        <View style={[styles.tableRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>TỔNG CỘNG:</Text>
          <Text style={styles.totalValue}>{invoice.totalAmount?.toLocaleString('vi-VN')} VNĐ</Text>
        </View>
      </View>

      {/* Nút hành động */}
      {!isPaid ? (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.vnpayBtn}
            onPress={() => navigation.navigate('Payment', { invoiceId: invoice._id, totalAmount: invoice.totalAmount, invoiceCode: invoice.invoiceCode })}
          >
            <Text style={styles.btnText}>🏦 Thanh toán Online (VNPay Sandbox)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cashBtn} onPress={handlePayCash}>
            <Text style={styles.btnText}>💵 Xác nhận thu tiền mặt (UC10)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.paidNotice}>
          <Text style={styles.paidNoticeText}>✅ Hóa đơn này đã được thanh toán hoàn tất.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('InvoiceList')}>
        <Text style={styles.backBtnText}>⬅️ Quay lại danh sách</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: '800', color: '#1e3a8a', textAlign: 'center' },
  codeText: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  infoRow: { fontSize: 13, color: '#334155', marginBottom: 6 },
  bold: { fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  itemText: { fontSize: 13, color: '#475569' },
  priceText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  totalRow: { borderBottomWidth: 0, borderTopWidth: 2, borderTopColor: '#e2e8f0', marginTop: 8, paddingTop: 10 },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#b91c1c' },
  actionContainer: { gap: 10, marginBottom: 16 },
  vnpayBtn: { backgroundColor: '#005baa', padding: 14, borderRadius: 10, alignItems: 'center' },
  cashBtn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  paidNotice: { backgroundColor: '#dcfce7', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  paidNoticeText: { color: '#15803d', fontWeight: 'bold' },
  backBtn: { padding: 12, alignItems: 'center' },
  backBtnText: { color: '#64748b', fontSize: 13, fontWeight: '600' }
});
