import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- CONFIGURAÇÃO DO FIREBASE ---
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function PagConfirmacao() {
  const router = useRouter();
  
  // Controle de Acesso
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState('');
  
  // Dados do Firebase
  const [listaConfirmados, setListaConfirmados] = useState<any[]>([]);

  // Estados para Edição
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [itemEditando, setItemEditando] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editAcompanhantes, setEditAcompanhantes] = useState(0);

  // Busca os dados do Firebase (somente se logado)
  useEffect(() => {
    if (logado) {
      const listaRef = ref(db, 'confirmacoes');
      const unsubscribe = onValue(listaRef, (snapshot) => {
        const dados = snapshot.val();
        if (dados) {
          const itens = Object.keys(dados).map(key => ({
            id: key,
            ...dados[key]
          }));
          setListaConfirmados(itens);
        } else {
          setListaConfirmados([]);
        }
      });
      return () => unsubscribe();
    }
  }, [logado]);

  const fazerLogin = () => {
    if (senha === 'ventilador') {
      setLogado(true);
      setSenha(''); 
    } else {
      Alert.alert("Erro", "Senha incorreta!");
    }
  };

  // --- FUNÇÕES DE ADMINISTRAÇÃO (EDITAR E APAGAR) ---
  const confirmarExclusao = (id: string, nome: string) => {
    Alert.alert(
      "Excluir Confirmação",
      `Tem certeza que deseja apagar a presença de "${nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              await remove(ref(db, `confirmacoes/${id}`));
            } catch (e) {
              Alert.alert("Erro", "Não foi possível excluir o convidado.");
            }
          }
        }
      ]
    );
  };

  const abrirEdicao = (item: any) => {
    setItemEditando(item.id);
    setEditNome(item.NOMCRE);
    setEditAcompanhantes(item.QTDACO);
    setModalEditVisible(true);
  };

  const salvarEdicao = async () => {
    if (!editNome.trim()) {
      Alert.alert("Atenção", "O nome do convidado não pode ficar vazio.");
      return;
    }
    try {
      const SUMQTD = 1 + editAcompanhantes; // Recalcula o total (O próprio convidado + acompanhantes)
      
      await update(ref(db, `confirmacoes/${itemEditando}`), {
        NOMCRE: editNome.toUpperCase(),
        QTDACO: editAcompanhantes,
        SUMQTD: SUMQTD
      });

      setModalEditVisible(false);
      setItemEditando(null);
    } catch(e) {
      Alert.alert("Erro", "Falha ao atualizar os dados do convidado.");
    }
  };

  // -----------------------------------------
  // TELA 1: SE NÃO ESTIVER LOGADO (TELA DE SENHA)
  // -----------------------------------------
  if (!logado) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonMini}>
            <Feather name="arrow-left" size={24} color="#C5A059" />
          </TouchableOpacity>

          <Feather name="lock" size={40} color="#C5A059" style={{ alignSelf: 'center', marginBottom: 15 }} />
          <Text style={styles.loginTitle}>Acesso Restrito</Text>
          <Text style={styles.loginSubtitle}>Área exclusiva dos noivos.</Text>
          
          <TextInput 
            style={styles.inputSenha}
            placeholder="Digite a senha..."
            placeholderTextColor="#999"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            onSubmitEditing={fazerLogin}
          />
          
          <TouchableOpacity style={styles.btnLogin} onPress={fazerLogin}>
            <Text style={styles.btnLoginText}>Entrar no Painel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -----------------------------------------
  // TELA 2: SE ESTIVER LOGADO (PAINEL COMPLETO)
  // -----------------------------------------
  const totalConvidados = listaConfirmados.length;
  const totalPessoasGeral = listaConfirmados.reduce((acc, item) => acc + item.SUMQTD, 0);

  return (
    <SafeAreaView style={styles.adminContainer}>
      
      <View style={styles.adminHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#C5A059" />
          </TouchableOpacity>
          <View>
            <Text style={styles.adminTitle}>Painel dos Noivos</Text>
            <Text style={styles.adminSubtitle}>Lista de Confirmações</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setLogado(false)} style={styles.btnLogout}>
          <Feather name="log-out" size={20} color="#C5A059" />
        </TouchableOpacity>
      </View>

      <View style={styles.dashboardCards}>
        <View style={styles.dashCard}>
          <Feather name="users" size={24} color="#C5A059" />
          <Text style={styles.dashCardTitle}>Convites Recebidos</Text>
          <Text style={styles.dashCardValue}>{totalConvidados}</Text>
        </View>
        <View style={styles.dashCard}>
          <Feather name="user-check" size={24} color="#C5A059" />
          <Text style={styles.dashCardTitle}>Total de Pessoas</Text>
          <Text style={styles.dashCardValue}>{totalPessoasGeral}</Text>
        </View>
      </View>

      <FlatList
        data={listaConfirmados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        renderItem={({ item }) => (
          <View style={styles.guestCard}>
            
            {/* INFORMAÇÕES DO CONVIDADO */}
            <View style={styles.guestCardHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.guestName}>{item.NOMCRE}</Text>
                <Text style={styles.guestInfo}>Confirmado em: {item.DATCRE} às {item.HMSCRE}</Text>
              </View>
              <View style={styles.guestBadge}>
                <Text style={styles.guestBadgeNum}>{item.SUMQTD}</Text>
                <Text style={styles.guestBadgeText}>{item.SUMQTD === 1 ? 'Pessoa' : 'Pessoas'}</Text>
              </View>
            </View>

            {/* AÇÕES DE EDITAR E EXCLUIR */}
            <View style={styles.guestActions}>
              <TouchableOpacity style={styles.actionBtnEdit} onPress={() => abrirEdicao(item)}>
                <Feather name="edit-2" size={14} color="#C5A059" />
                <Text style={styles.actionTextEdit}>Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtnDelete} onPress={() => confirmarExclusao(item.id, item.NOMCRE)}>
                <Feather name="trash-2" size={14} color="#FF4D4D" />
                <Text style={styles.actionTextDelete}>Apagar</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }}>Ninguém confirmou ainda.</Text>
        )}
      />

      {/* MODAL DE EDIÇÃO DE CONVIDADOS */}
      <Modal visible={modalEditVisible} transparent={true} animationType="fade" onRequestClose={() => setModalEditVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Editar Convidado</Text>
              <TouchableOpacity onPress={() => setModalEditVisible(false)}>
                <Feather name="x" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.labelInput}>Nome Completo</Text>
            <TextInput
              style={styles.inputEdit}
              value={editNome}
              onChangeText={setEditNome}
              autoCapitalize="characters"
            />

            <Text style={styles.labelInput}>Quantos Acompanhantes?</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setEditAcompanhantes(Math.max(0, editAcompanhantes - 1))}>
                <Feather name="minus" size={24} color="#C5A059" />
              </TouchableOpacity>
              
              <Text style={styles.counterValue}>{editAcompanhantes}</Text>
              
              <TouchableOpacity style={styles.counterBtn} onPress={() => setEditAcompanhantes(editAcompanhantes + 1)}>
                <Feather name="plus" size={24} color="#C5A059" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Lembre-se: O total será calculado somando os acompanhantes + o dono do convite.</Text>

            <View style={styles.modalRowButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalEditVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={salvarEdicao}>
                <Text style={styles.modalBtnSaveText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- ESTILOS DA TELA DE LOGIN ---
  loginContainer: { flex: 1, backgroundColor: '#FAF9F6', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginCard: { backgroundColor: '#FFF', width: '100%', maxWidth: 400, padding: 30, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  backButtonMini: { position: 'absolute', top: 20, left: 20, padding: 5 },
  loginTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 5 },
  loginSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
  inputSenha: { height: 50, backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, fontSize: 18, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 20, textAlign: 'center', letterSpacing: 5 },
  btnLogin: { backgroundColor: '#C5A059', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  btnLoginText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // --- ESTILOS DO PAINEL ADMIN ---
  adminContainer: { flex: 1, backgroundColor: '#FAF9F6' },
  adminHeader: { backgroundColor: '#FFF', padding: 20, paddingTop: 40, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { marginRight: 15, padding: 5 },
  adminTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  adminSubtitle: { fontSize: 14, color: '#999' },
  btnLogout: { backgroundColor: '#FFF4E5', padding: 10, borderRadius: 12 },
  
  dashboardCards: { flexDirection: 'row', padding: 20, gap: 15 },
  dashCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 5, borderWidth: 1, borderColor: '#F0F0F0', alignItems: 'center' },
  dashCardTitle: { color: '#888', fontSize: 11, textTransform: 'uppercase', marginTop: 10, marginBottom: 5, fontWeight: '600', textAlign: 'center' },
  dashCardValue: { color: '#333', fontSize: 32, fontWeight: 'bold' },

  // --- ESTILOS DO CARD DE CONVIDADO ---
  guestCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0', elevation: 1 },
  guestCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  guestName: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 4 },
  guestInfo: { fontSize: 12, color: '#888' },
  guestBadge: { backgroundColor: '#FFF4E5', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, alignItems: 'center', minWidth: 70, borderWidth: 1, borderColor: '#FFE0B2' },
  guestBadgeNum: { fontSize: 20, fontWeight: 'bold', color: '#C5A059' },
  guestBadgeText: { fontSize: 9, color: '#C5A059', textTransform: 'uppercase', fontWeight: 'bold', marginTop: 2 },
  
  // Ações do Card
  guestActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  actionBtnEdit: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4E5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionTextEdit: { color: '#C5A059', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  actionBtnDelete: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionTextDelete: { color: '#FF4D4D', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },

  // --- ESTILOS DO MODAL DE EDIÇÃO ---
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF', width: '100%', maxWidth: 400, padding: 25, borderRadius: 20 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  labelInput: { color: '#888', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 },
  inputEdit: { height: 50, backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 20 },
  
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 5, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 10 },
  counterBtn: { padding: 12, backgroundColor: '#FFF', borderRadius: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  counterValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  
  helperText: { fontSize: 11, color: '#999', fontStyle: 'italic', marginBottom: 25, textAlign: 'center' },

  modalRowButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtnCancel: { paddingVertical: 12, paddingHorizontal: 20 },
  modalBtnCancelText: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  modalBtnSave: { backgroundColor: '#C5A059', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  modalBtnSaveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});