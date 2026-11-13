import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { roomApi } from '../services/api';

export default function RoomSearchScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (status) params.status = status;

      const res = await roomApi.searchRooms(params);
      setResults(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setStatus('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={styles.formContainer}>
            <Text style={styles.title}>🔍 Tìm Kiếm Phòng Trọ</Text>
            <Text style={styles.subtitle}>Lọc phòng nhanh theo số phòng, mức giá, trạng thái</Text>

            {/* Từ khóa */}
            <Text style={styles.label}>Từ khóa / Số phòng</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 101, 201, VIP..."
              value={keyword}
              onChangeText={setKeyword}
            />

            {/* Mức giá */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Giá tối thiểu (đ)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: 1500000"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Giá tối đa (đ)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: 4000000"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>

            {/* Trạng thái phòng */}
            <Text style={styles.label}>Trạng thái phòng</Text>
            <View style={styles.statusChips}>
              {[
                { key: '', label: 'Tất cả' },
                { key: 'AVAILABLE', label: 'Còn trống' },
                { key: 'RENTED', label: 'Đang thuê' },
              ].map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.chip, status === s.key && styles.activeChip]}
                  onPress={() => setStatus(s.key)}
                >
                  <Text style={[styles.chipText, status === s.key && styles.activeChipText]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nút hành động */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                <Text style={styles.searchBtnText}>🔍 Tìm kiếm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Text style={styles.resetBtnText}>Đặt lại</Text>
              </TouchableOpacity>
            </View>

            {/* Tiêu đề kết quả */}
            {hasSearched && (
              <Text style={styles.resultCount}>
                Kết quả tìm kiếm: {results.length} phòng
              </Text>
            )}
            {loading && <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RoomDetail', { roomId: item._id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.roomNum}>Phòng {item.roomNumber}</Text>
              <Text style={styles.roomPrice}>{item.basePrice?.toLocaleString('vi-VN')} đ</Text>
            </View>
            <Text style={styles.roomMeta}>
              Trạng thái: <Text style={{ fontWeight: '700', color: item.status === 'AVAILABLE' ? '#16a34a' : '#2563eb' }}>{item.status}</Text> • 📐 {item.area}m²
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          hasSearched && !loading ? (
            <Text style={styles.emptyMsg}>Không tìm thấy phòng trọ nào với bộ lọc này.</Text>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  statusChips: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  activeChip: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  activeChipText: { color: '#ffffff' },
  btnRow: { flexDirection: 'row', gap: 10 },
  searchBtn: {
    flex: 2,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  resetBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetBtnText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  resultCount: { marginTop: 16, fontSize: 14, fontWeight: '700', color: '#0f172a' },
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomNum: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  roomPrice: { fontSize: 15, fontWeight: '700', color: '#2563eb' },
  roomMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  emptyMsg: { textAlign: 'center', color: '#94a3b8', marginVertical: 30, fontSize: 14 },
});
