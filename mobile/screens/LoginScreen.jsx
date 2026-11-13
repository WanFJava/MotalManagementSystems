import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { authApi, setAuthToken, setCurrentUserStore } from '../services/api';

/**
 * Màn hình Đăng Nhập Hệ Thống (LoginScreen)
 * Đồng bộ chuẩn 100% với Web (frontend/src/screens/AuthScreen.jsx)
 * - Tab Switch: [ 🔑 Đăng Nhập ] | [ 📝 Đăng Ký Khách Thuê ]
 * - Nhập SĐT hoặc Email và Mật khẩu
 * - Điền nhanh tài khoản kiểm thử cho 3 vai trò (Chủ trọ, Nhân viên, Khách thuê)
 */
export default function LoginScreen({ navigation, route, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState(route?.params?.fillPhone || '');
  const [password, setPassword] = useState(route?.params?.fillPass || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route?.params?.fillPhone) setIdentifier(route.params.fillPhone);
    if (route?.params?.fillPass) setPassword(route.params.fillPass);
  }, [route?.params]);

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập số điện thoại / email và mật khẩu!');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({
        identifier: identifier.trim(),
        password: password
      });

      if (res.data && res.data.success) {
        const { token, user } = res.data.data;
        setAuthToken(token);
        setCurrentUserStore(user);

        if (onLoginSuccess) {
          onLoginSuccess(user, token);
        } else if (route?.params?.onLoginSuccess) {
          route.params.onLoginSuccess(user, token);
        }

        Alert.alert(
          'Đăng nhập thành công 🎉',
          `Xin chào, ${user.fullName} (${user.role === 'MANAGER' ? 'Chủ Trọ' : user.role === 'STAFF' ? 'Nhân Viên' : 'Khách Thuê'})!`,
          [
            {
              text: 'Bắt đầu sử dụng',
              onPress: () => {
                navigation.navigate('Home', { currentUser: user });
              }
            }
          ]
        );
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (phone, pass) => {
    setIdentifier(phone);
    setPassword(pass);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Switch Tabs Đồng bộ chuẩn Web */}
        <View style={styles.tabHeader}>
          <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>
              🔑 Đăng Nhập
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.tabBtnText}>
              📝 Đăng Ký Khách Thuê
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đăng Nhập Tài Khoản</Text>
          <Text style={styles.cardSubtitle}>
            Nhập số điện thoại hoặc email đã đăng ký để tiếp tục
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại hoặc Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0912345678 hoặc email@domain.com"
              placeholderTextColor="#9ca3af"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginBtnText}>🔑 ĐĂNG NHẬP NGAY</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>Chưa có tài khoản khách thuê? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Fast Login Helper */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>⚡ Điền nhanh tài khoản kiểm thử:</Text>
          <View style={styles.demoBtnsRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => fillQuickAccount('0901234567', 'Password123@')}
            >
              <Text style={styles.demoBtnText}>👑 Chủ trọ (Manager)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => fillQuickAccount('0902345678', 'Password123@')}
            >
              <Text style={styles.demoBtnText}>👔 Nhân viên (Staff)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => fillQuickAccount('0912345678', 'Password123@')}
            >
              <Text style={styles.demoBtnText}>👤 Khách thuê mẫu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#10b981', backgroundColor: '#f0fdf4' }]}
              onPress={() => fillQuickAccount('0399326304', '123456')}
            >
              <Text style={[styles.demoBtnText, { color: '#059669', fontWeight: '700' }]}>🏠 Khách P.207 (Quang)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#2563eb',
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  promptText: { fontSize: 13, color: '#64748b' },
  registerLink: { fontSize: 13, color: '#2563eb', fontWeight: '800' },

  // Demo box
  demoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginTop: 16,
  },
  demoTitle: { fontSize: 12, fontWeight: '800', color: '#1e40af', marginBottom: 8 },
  demoBtnsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  demoBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  demoBtnText: { fontSize: 11, fontWeight: '700', color: '#1d4ed8' },
});
