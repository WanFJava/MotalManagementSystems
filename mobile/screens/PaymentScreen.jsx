import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { createPaymentUrl, payCash } from '../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { invoiceId, totalAmount, invoiceCode } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('VNPAY');

  const handleProcessPayment = async () => {
    if (!invoiceId) {
      Alert.alert('Lỗi', 'Không tìm thấy hóa đơn cần thanh toán');
      return;
    }

    try {
      setLoading(true);
      if (selectedMethod === 'VNPAY') {
        const res = await createPaymentUrl(invoiceId);
        if (res.data?.paymentUrl) {
          Alert.alert(
            'Cổng thanh toán VNPay Sandbox (TC_INV_03)',
            `Đã tạo liên kết thanh toán thành công!\nMã đơn: ${invoiceCode}\nSố tiền: ${totalAmount?.toLocaleString('vi-VN')} đ\n\n(Mô phỏng: Xác nhận trừ tiền thành công trên Sandbox)`,
            [
              {
                text: 'Mô phỏng thanh toán thành công',
                onPress: async () => {
                  // Xác nhận hoàn tất thanh toán
                  await payCash(invoiceId, 'Thanh toán qua VNPay Sandbox Mobile App');
                  Alert.alert('Thành công', 'Thanh toán hóa đơn thành công! (PAID)');
                  navigation.navigate('PaymentHistory');
                }
              },
              { text: 'Đóng', style: 'cancel' }
            ]
          );
        }
      } else {
        await payCash(invoiceId, 'Thanh toán tiền mặt trực tiếp');
        Alert.alert('Thành công', 'Đã xác nhận thu tiền mặt thành công!');
        navigation.navigate('PaymentHistory');
      }
    } catch (err) {
      Alert.alert('Lỗi thanh toán', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💳 Thanh toán Hóa đơn (UC09)</Text>
      <Text style={styles.subtitle}>Chọn phương thức thanh toán an toàn và tiện lợi</Text>

      {/* Tóm tắt thanh toán */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Mã hóa đơn:</Text>
        <Text style={styles.summaryValue}>{invoiceCode || 'INV-DEMO'}</Text>

        <Text style={styles.summaryLabel}>Số tiền cần thanh toán:</Text>
        <Text style={styles.amountValue}>{(totalAmount || 0).toLocaleString('vi-VN')} VNĐ</Text>
      </View>

      {/* Lựa chọn phương thức */}
      <Text style={styles.sectionTitle}>Phương thức thanh toán:</Text>
      <TouchableOpacity
        style={[styles.methodCard, selectedMethod === 'VNPAY' && styles.methodCardActive]}
        onPress={() => setSelectedMethod('VNPAY')}
      >
        <Text style={styles.methodIcon}>🏦</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.methodName}>Cổng thanh toán VNPay Sandbox</Text>
          <Text style={styles.methodDesc}>Quét mã VNPAY-QR hoặc thẻ ATM nội địa</Text>
        </View>
        <Text style={styles.radio}>{selectedMethod === 'VNPAY' ? '🔘' : '⚪'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, selectedMethod === 'CASH' && styles.methodCardActive]}
        onPress={() => setSelectedMethod('CASH')}
      >
        <Text style={styles.methodIcon}>💵</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.methodName}>Thanh toán tiền mặt tại quầy (UC10)</Text>
          <Text style={styles.methodDesc}>Nhân viên xác nhận thu tiền mặt trực tiếp</Text>
        </View>
        <Text style={styles.radio}>{selectedMethod === 'CASH' ? '🔘' : '⚪'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.payBtn} onPress={handleProcessPayment} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payBtnText}>🚀 Xác nhận thanh toán</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.navigate('InvoiceList')}>
        <Text style={styles.cancelBtnText}>Hủy giao dịch</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1e3a8a', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  summaryLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  amountValue: { fontSize: 22, fontWeight: '800', color: '#b91c1c' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  methodCardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  methodIcon: { fontSize: 24, marginRight: 12 },
  methodName: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  methodDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  radio: { fontSize: 18 },
  payBtn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  payBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  cancelBtn: { padding: 12, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#64748b', fontSize: 13 }
});
