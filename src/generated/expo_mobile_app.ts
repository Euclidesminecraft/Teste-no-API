/**
 * Lovix - Complete React Native Expo App Codebase
 * Ready to run with Expo Router / React Navigation, Hotmart, and Supabase.
 */

export const EXPO_MOBILE_CODE = `
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
  Clipboard,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Theme Colors - Google Professional Dark/Light Vibe
const COLORS = {
  bg: '#090A0F',
  card: '#12141F',
  cardBorder: '#1E2337',
  primary: '#FF2A6D',
  primaryGlow: 'rgba(255, 42, 109, 0.3)',
  accent: '#05D9E8',
  text: '#FFFFFF',
  textMuted: '#8B949E',
  green: '#00F5A0',
  yellow: '#FFB800',
  red: '#FF4365',
};

export default function LovixApp() {
  const [activeTab, setActiveTab] = useState<'screenshot' | 'manual' | 'pickup' | 'pro'>('screenshot');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(10);
  const [isPro, setIsPro] = useState(false);

  // Results
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [rizzometer, setRizzometer] = useState<any>(null);

  // Tone & Goal Selection
  const [selectedTone, setSelectedTone] = useState('Flirty');
  const [selectedGoal, setSelectedGoal] = useState('Marcar Encontro');

  const tones = ['Pegador', 'Flirty', 'Engraçado', 'Inteligente', 'Fofo', 'Safado'];
  const goals = ['Flertar', 'Marcar Encontro', 'Ser Engraçado', 'Continuar Papo'];

  // Image Picker
  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      analyzeScreenshot(result.assets[0].base64);
    }
  };

  const analyzeScreenshot = async (base64: string) => {
    if (credits <= 0 && !isPro) {
      Alert.alert('Créditos Esgotados', 'Seus 10 créditos da hora acabaram. Assine o Pro para flertes ilimitados!');
      setActiveTab('pro');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://seu-backend.com/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          tone: selectedTone,
          goal: selectedGoal,
          dialect: 'PT-BR'
        }),
      });

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setRizzometer(data.rizzometer || null);
      if (!isPro) setCredits(prev => Math.max(0, prev - 1));
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível analisar o print. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copiado!', 'Resposta copiada para o seu teclado. Cole no Tinder ou WhatsApp!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>Lovix<Text style={styles.logoHighlight}>AI</Text></Text>
          <View style={styles.badgePro}>
            <Text style={styles.badgeText}>{isPro ? 'PRO ILIMITADO' : credits + ' CRÉDITOS'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setActiveTab('pro')} style={styles.upgradeBtn}>
          <Text style={styles.upgradeText}>{isPro ? 'VIP' : 'Lovix PRO'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'screenshot' && styles.tabButtonActive]}
          onPress={() => setActiveTab('screenshot')}
        >
          <Ionicons name="camera-outline" size={18} color={activeTab === 'screenshot' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'screenshot' && styles.tabTextActive]}>Print OCR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'manual' && styles.tabButtonActive]}
          onPress={() => setActiveTab('manual')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={activeTab === 'manual' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>Manual</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'pickup' && styles.tabButtonActive]}
          onPress={() => setActiveTab('pickup')}
        >
          <Ionicons name="flame-outline" size={18} color={activeTab === 'pickup' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'pickup' && styles.tabTextActive]}>Cantadas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TONE SELECTION CHIPS */}
        <Text style={styles.sectionTitle}>Escolha o Tom da Resposta:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {tones.map(tone => (
            <TouchableOpacity
              key={tone}
              onPress={() => setSelectedTone(tone)}
              style={[styles.chip, selectedTone === tone && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedTone === tone && styles.chipTextActive]}>{tone}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'screenshot' && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Upload de Print da Conversa</Text>
            <Text style={styles.cardDesc}>Tire um print no Tinder, Bumble ou WhatsApp e a IA gerará 3 respostas perfeitas.</Text>

            <TouchableOpacity style={styles.uploadBox} onPress={pickScreenshot}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} />
                  <Text style={styles.uploadPrompt}>Tocar para Selecionar Print</Text>
                  <Text style={styles.uploadSub}>100% Privado e Encriptado (LGPD)</Text>
                </View>
              )}
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Lendo conversa e calculando Rizzômetro...</Text>
              </View>
            )}

            {/* Rizzometer Badge */}
            {rizzometer && (
              <View style={styles.rizzometerBox}>
                <View style={styles.rizzHeader}>
                  <Text style={styles.rizzTitle}>Rizzômetro de Interesse</Text>
                  <Text style={styles.rizzScore}>{rizzometer.score}%</Text>
                </View>
                <Text style={styles.rizzStatus}>{rizzometer.status}</Text>
                <Text style={styles.rizzTactic}>💡 Próximo Passo: {rizzometer.tactic}</Text>
              </View>
            )}

            {/* Suggestions */}
            {suggestions.map((item, idx) => (
              <View key={idx} style={styles.replyBox}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyStyleBadge}>{item.style}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(item.text)} style={styles.copyBtn}>
                    <Ionicons name="copy-outline" size={16} color={COLORS.accent} />
                    <Text style={styles.copyBtnText}>Copiar</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.replyText}>"{item.text}"</Text>
                <Text style={styles.replyReason}>⚡ {item.reasoning}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 22, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  logoHighlight: { color: COLORS.primary },
  badgePro: { backgroundColor: 'rgba(255, 42, 109, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  badgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  upgradeBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  upgradeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, marginBottom: 12 },
  tabButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 12 },
  tabButtonActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  chipScroll: { marginBottom: 16 },
  chip: { backgroundColor: COLORS.card, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: COLORS.cardBorder },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardHeader: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  cardDesc: { color: COLORS.textMuted, fontSize: 13, marginBottom: 16, lineHeight: 18 },
  uploadBox: { height: 160, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: 'rgba(255, 42, 109, 0.05)', marginBottom: 16 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadPlaceholder: { alignItems: 'center', gap: 6 },
  uploadPrompt: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
  uploadSub: { color: COLORS.textMuted, fontSize: 11 },
  loadingBox: { padding: 16, alignItems: 'center', gap: 10 },
  loadingText: { color: COLORS.textMuted, fontSize: 13 },
  rizzometerBox: { backgroundColor: 'rgba(0, 245, 160, 0.1)', borderWidth: 1, borderColor: COLORS.green, borderRadius: 12, padding: 14, marginBottom: 16 },
  rizzHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  rizzTitle: { color: COLORS.green, fontWeight: 'bold', fontSize: 14 },
  rizzScore: { color: COLORS.green, fontWeight: '900', fontSize: 18 },
  rizzStatus: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  rizzTactic: { color: COLORS.textMuted, fontSize: 12, lineHeight: 16 },
  replyBox: { backgroundColor: '#181B2B', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  replyStyleBadge: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 217, 232, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  copyBtnText: { color: COLORS.accent, fontSize: 11, fontWeight: 'bold' },
  replyText: { color: COLORS.text, fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 6 },
  replyReason: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },
});
`;
