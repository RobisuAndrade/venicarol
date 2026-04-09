import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

// --- CONFIGURAÇÃO DO FIREBASE ---
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDxLT8VCsa5pnKgs757iOIN1d7HHlQW2uk",
  authDomain: "listacasamento-63a14.firebaseapp.com",
  databaseURL: "https://listacasamento-63a14-default-rtdb.firebaseio.com",
  projectId: "listacasamento-63a14",
  storageBucket: "listacasamento-63a14.firebasestorage.app",
  messagingSenderId: "582595868872",
  appId: "1:582595868872:web:459956d421d8c303a38dfd",
  measurementId: "G-6TW5MB2294"
};

// Inicializa o Firebase e o Banco de Dados
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Import das imagens
import fotoCasal from '../../assets/foto-casal.jpg';
import rest1 from '../../assets/resturante_1.jpg';
import rest2 from '../../assets/resturante_2.jpg';
import rest3 from '../../assets/resturante_3.jpg';
import rest4 from '../../assets/resturante_4.jpg';

export default function HomeScreen() {
  const dataEvento = new Date('2026-05-23T20:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState(dataEvento - Date.now());
  
  // Estados para o Formulário
  const [nome, setNome] = useState('');
  const [acompanhantes, setAcompanhantes] = useState(1);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(dataEvento - Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calc = (ms: number) => ({
    d: Math.max(0, Math.floor(ms / 86400000)),
    h: Math.max(0, Math.floor((ms / 3600000) % 24)),
    m: Math.max(0, Math.floor((ms / 60000) % 60)),
    s: Math.max(0, Math.floor((ms / 1000) % 60))
  });
  const t = calc(timeLeft);

  const fotosRestaurante = [rest1, rest2, rest3, rest4];

  // FUNÇÃO PARA SALVAR NO BANCO DE DADOS
  const confirmarPresenca = async () => {
    if (nome.trim().length < 3) {
      alert("Por favor, digite seu nome completo para a reserva.");
      return;
    }

    setEnviando(true);
    try {
      const listaRef = ref(db, 'confirmacoes');
      const novaReservaRef = push(listaRef);
      
      await set(novaReservaRef, {
        nomeCompleto: nome,
        quantidadePessoas: acompanhantes,
        dataRegistro: new Date().toLocaleString('pt-BR')
      });

      alert(`Sucesso! Reserva confirmada para ${nome}.`);
      setNome(''); // Limpa o campo após sucesso
      setAcompanhantes(1);
    } catch (error) {
      alert("Erro ao salvar. Verifique se as regras do Firebase estão em 'Modo de Teste'.");
    } finally {
      setEnviando(false);
    }
  };

  const abrirMapa = () => {
    Linking.openURL("https://www.google.com/maps/search/?api=1&query=Churrascaria+Prato+Cheio+Embu+das+Artes");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <ImageBackground source={fotoCasal} style={styles.header} resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.nomes}>Veni & Carol</Text>
          <Text style={styles.subtitulo}>Nossa Celebração</Text>
        </View>
      </ImageBackground>

      {/* Cronômetro */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quanto tempo falta?</Text>
        <View style={styles.timerRow}>
          {[ ['Dias', t.d], ['Horas', t.h], ['Min', t.m], ['Seg', t.s] ].map(([label, value]) => (
            <View key={label as string} style={[styles.timeBox, styles.timeBoxHighlight]}>
              <Text style={[styles.timeNum, styles.timeNumHighlight]}>
                {Number(value) < 10 ? `0${value}` : value}
              </Text>
              <Text style={styles.timeLabel}>{label as string}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Confirmação de Reserva */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reserva de Mesa</Text>
        <View style={styles.deadlineBadge}>
          <Text style={styles.deadlineText}>⚠️ Confirmar até 10/05</Text>
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="Seu nome completo" 
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
        />
        
        <Text style={styles.labelSelect}>Quantas pessoas (incluindo você)?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => ( 
            <TouchableOpacity 
              key={num} 
              style={[styles.numCircle, acompanhantes === num && styles.numCircleActive]}
              onPress={() => setAcompanhantes(num)}
            >
              <Text style={[styles.numText, acompanhantes === num && styles.numTextActive]}>{num}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={[styles.button, enviando && { opacity: 0.7 }]} 
          onPress={confirmarPresenca}
          disabled={enviando}
        >
          <Text style={styles.buttonText}>{enviando ? "Salvando..." : "Confirmar Presença"}</Text>
        </TouchableOpacity>
      </View>

      {/* Localização */}
      <View style={styles.locationSection}>
        <View style={styles.divider} />
        <Text style={styles.locationTitle}>📍 Onde vamos comemorar?</Text>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>Churrascaria Prato Cheio</Text>
          <Text style={styles.restaurantAddress}>R. dos Bancários, 699 — Embu das Artes</Text>
        </View>
        <View style={styles.galeriaContainer}>
          {fotosRestaurante.map((foto, index) => (
            <Image key={index} source={foto} style={styles.fotoQuadrinho} resizeMode="cover" />
          ))}
        </View>
        <TouchableOpacity style={styles.gpsButton} onPress={abrirMapa}>
          <Text style={styles.gpsButtonText}>Ver rota no Google Maps</Text>
        </TouchableOpacity>
        <View style={[styles.divider, { marginTop: 40 }]} />
        <Text style={styles.footerText}>Esperamos por vocês! ❤️</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { height: 500, width: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  nomes: { fontSize: 50, color: '#FFF', fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 10 },
  subtitulo: { fontSize: 20, color: '#FFF', letterSpacing: 3, textTransform: 'uppercase', marginTop: 5 },
  card: { 
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: -30, marginBottom: 20, 
    padding: 25, borderRadius: 25, elevation: 8, alignItems: 'center' 
  },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#444' },
  deadlineBadge: { backgroundColor: '#FFF4E5', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#FFE0B2' },
  deadlineText: { color: '#E65100', fontWeight: 'bold', fontSize: 13 },
  infoText: { textAlign: 'center', color: '#777', marginBottom: 20, lineHeight: 20 },
  timerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' },
  timeBox: { alignItems: 'center', backgroundColor: '#F9F9F9', padding: 10, borderRadius: 15, minWidth: 65, borderWidth: 1, borderColor: '#EEE', marginHorizontal: 6 },
  timeBoxHighlight: { backgroundColor: '#FFF', borderColor: '#C5A059', borderWidth: 1.5, elevation: 3 },
  timeNum: { fontSize: 22, fontWeight: 'bold', color: '#444' },
  timeNumHighlight: { color: '#C5A059', fontSize: 24 },
  timeLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', marginTop: 2 },
  input: { width: '100%', height: 50, backgroundColor: '#F5F5F5', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  button: { backgroundColor: '#C5A059', padding: 18, borderRadius: 15, width: '100%', alignItems: 'center', elevation: 2 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  labelSelect: { alignSelf: 'flex-start', color: '#666', marginBottom: 12, fontSize: 14, fontWeight: '500' },
  selectorScroll: { flexDirection: 'row', marginBottom: 25, width: '100%' },
  numCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1.5, borderColor: '#EEE' },
  numCircleActive: { backgroundColor: '#C5A059', borderColor: '#C5A059' },
  numText: { color: '#555', fontWeight: '700' },
  numTextActive: { color: '#FFF' },
  galeriaContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10, marginBottom: 15 },
  fotoQuadrinho: { width: '23%', aspectRatio: 1, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  locationSection: { paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center', backgroundColor: '#FAF9F6' },
  divider: { width: '50%', height: 1, backgroundColor: '#E0D5C0', marginBottom: 30 },
  locationTitle: { fontSize: 22, fontWeight: '300', color: '#888', letterSpacing: 1, marginBottom: 15 },
  restaurantInfo: { alignItems: 'center', marginBottom: 20 },
  restaurantName: { fontSize: 26, fontWeight: 'bold', color: '#C5A059', textAlign: 'center' },
  restaurantAddress: { fontSize: 15, color: '#999', marginTop: 5, fontStyle: 'italic' },
  gpsButton: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, borderWidth: 1, borderColor: '#C5A059', backgroundColor: 'transparent' },
  gpsButtonText: { color: '#C5A059', fontWeight: '600', fontSize: 14, textTransform: 'uppercase' },
  footerText: { fontSize: 18, color: '#C5A059', marginBottom: 60 },
});