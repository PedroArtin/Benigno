// screens/Notificacoes.js - INTEGRADO COM SEU SISTEMA
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { auth } from '../firebase/firebaseconfig';
import {
  buscarNotificacoesUsuario,
  marcarNotificacaoComoLida,
  responderNotificacaoConfirmacao, // 🆕 NOVA FUNÇÃO
} from '../services/notificacoesService';
import { salvarAvaliacao } from '../services/avaliacoesService';

export default function Notificacoes({ navigation }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalAvaliacao, setModalAvaliacao] = useState(false);
  const [notificacaoParaAvaliar, setNotificacaoParaAvaliar] = useState(null);
  const [estrelasSelecionadas, setEstrelasSelecionadas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado');
        return;
      }

      const notifs = await buscarNotificacoesUsuario(user.uid);
      setNotificacoes(notifs);
      console.log(`✅ ${notifs.length} notificações carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as notificações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarNotificacoes();
  };

  const marcarComoLida = async (notificacaoId) => {
    try {
      await marcarNotificacaoComoLida(notificacaoId);
      // Atualizar localmente
      setNotificacoes(prev =>
        prev.map(n => n.id === notificacaoId ? { ...n, lida: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // 🆕 NOVA FUNÇÃO: Usuário responde se ONG coletou ou não
  const handleResponderConfirmacao = async (notificacao, confirmou) => {
    try {
      if (confirmou) {
        // Se confirmou, abrir modal de avaliação
        setNotificacaoParaAvaliar(notificacao);
        setModalAvaliacao(true);
      } else {
        // Se negou, confirmar ação
        Alert.alert(
          'Negar Coleta',
          'Deseja realmente informar que a coleta NÃO foi realizada?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Confirmar',
              style: 'destructive',
              onPress: async () => {
                const resultado = await responderNotificacaoConfirmacao(
                  notificacao.id,
                  notificacao.doacaoId,
                  false // negou
                );

                if (resultado.success) {
                  Alert.alert(
                    'Resposta Enviada',
                    'A instituição foi notificada que a coleta não foi realizada.'
                  );
                  carregarNotificacoes(); // Recarregar
                } else {
                  Alert.alert('Erro', 'Não foi possível enviar a resposta');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao responder confirmação:', error);
      Alert.alert('Erro', 'Não foi possível processar sua resposta');
    }
  };

  // 🆕 NOVA FUNÇÃO: Salvar avaliação e confirmar coleta
  const handleSalvarAvaliacao = async () => {
    if (estrelasSelecionadas === 0) {
      Alert.alert('Avaliação', 'Por favor, selecione uma classificação');
      return;
    }

    try {
      setSalvando(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Você precisa estar logado');
        return;
      }

      // 1. Salvar avaliação
      await salvarAvaliacao({
        doacaoId: notificacaoParaAvaliar.doacaoId,
        doadorId: user.uid,
        instituicaoId: notificacaoParaAvaliar.instituicaoId,
        projetoId: notificacaoParaAvaliar.projetoId,
        estrelas: estrelasSelecionadas,
        comentario: comentario.trim(),
      });

      // 2. Confirmar coleta
      await responderNotificacaoConfirmacao(
        notificacaoParaAvaliar.id,
        notificacaoParaAvaliar.doacaoId,
        true // confirmou
      );

      setModalAvaliacao(false);
      Alert.alert(
        'Sucesso! 🎉',
        'Sua avaliação foi salva e a doação foi confirmada!',
        [
          {
            text: 'OK',
            onPress: () => {
              setEstrelasSelecionadas(0);
              setComentario('');
              setNotificacaoParaAvaliar(null);
              carregarNotificacoes(); // Recarregar
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a avaliação');
    } finally {
      setSalvando(false);
    }
  };

  const getNotificacaoIcon = (tipo) => {
    const icons = {
      ong_busca: 'car',
      ong_buscou_confirmacao: 'checkmark-circle',
      confirmacao_coleta_usuario: 'help-circle', // 🆕 NOVO TIPO
    };
    return icons[tipo] || 'notifications';
  };

  const getNotificacaoColor = (tipo) => {
    const colors = {
      ong_busca: cores.laranjaEscuro,
      ong_buscou_confirmacao: '#4CAF50',
      confirmacao_coleta_usuario: '#F57C00', // 🆕 NOVO TIPO
    };
    return colors[tipo] || cores.verdeEscuro;
  };

  const renderNotificacao = ({ item }) => {
    const icon = getNotificacaoIcon(item.tipoNotificacao);
    const color = getNotificacaoColor(item.tipoNotificacao);
    const isConfirmacao = item.tipoNotificacao === 'confirmacao_coleta_usuario';

    return (
      <View style={[styles.notifCard, !item.lida && styles.notifCardNaoLida]}>
        <View style={styles.notifHeader}>
          <View style={[styles.notifIconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View style={styles.notifContent}>
            <Text style={styles.notifTitulo}>{item.titulo}</Text>
            <Text style={styles.notifDescricao}>{item.descricao}</Text>
            <Text style={styles.notifData}>
              {item.dataCriacao?.toDate?.().toLocaleDateString('pt-BR')} às{' '}
              {item.dataCriacao?.toDate?.().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          {!item.lida && (
            <View style={styles.notifBadge} />
          )}
        </View>

        {/* 🆕 NOVO: Botões de confirmação para notificação de coleta */}
        {isConfirmacao && !item.respondida && (
          <View style={styles.notifActions}>
            <TouchableOpacity
              style={[styles.notifBtn, styles.notifBtnNao]}
              onPress={() => handleResponderConfirmacao(item, false)}
            >
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.notifBtnText}>Não</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.notifBtn, styles.notifBtnSim]}
              onPress={() => handleResponderConfirmacao(item, true)}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.notifBtnText}>Sim, confirmar</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.respondida && (
          <View style={styles.notifRespondida}>
            <Ionicons
              name={item.respostaUsuario === 'confirmado' ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={item.respostaUsuario === 'confirmado' ? '#4CAF50' : '#F44336'}
            />
            <Text style={styles.notifRespondidaText}>
              {item.respostaUsuario === 'confirmado'
                ? 'Você confirmou a coleta'
                : 'Você informou que não houve coleta'}
            </Text>
          </View>
        )}

        {!item.lida && !item.respondida && (
          <TouchableOpacity
            style={styles.marcarLidaBtn}
            onPress={() => marcarComoLida(item.id)}
          >
            <Text style={styles.marcarLidaText}>Marcar como lida</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={80} color={cores.placeholder} />
      <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
      <Text style={styles.emptyText}>
        Suas notificações aparecerão aqui
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificações</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal de Avaliação */}
      <Modal
        visible={modalAvaliacao}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAvaliacao(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Avalie a Instituição</Text>
              <TouchableOpacity onPress={() => setModalAvaliacao(false)}>
                <Ionicons name="close" size={28} color={cores.verdeEscuro} />
              </TouchableOpacity>
            </View>

            <View style={modalStyles.modalBody}>
              <View style={modalStyles.avaliacaoContainer}>
                <Text style={modalStyles.avaliacaoLabel}>
                  Como foi sua experiência com {notificacaoParaAvaliar?.instituicaoNome}?
                </Text>

                <View style={modalStyles.estrelasContainer}>
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <TouchableOpacity
                      key={estrela}
                      onPress={() => setEstrelasSelecionadas(estrela)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={estrela <= estrelasSelecionadas ? 'star' : 'star-outline'}
                        size={46}
                        color={estrela <= estrelasSelecionadas ? '#F9A825' : '#E0E0E0'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={modalStyles.estrelaTexto}>
                  {estrelasSelecionadas === 0
                    ? 'Selecione uma classificação'
                    : `${estrelasSelecionadas} estrela${estrelasSelecionadas !== 1 ? 's' : ''}`}
                </Text>

                <Text style={modalStyles.comentarioLabel}>Deixe um comentário (opcional)</Text>
                <TextInput
                  style={modalStyles.comentarioInput}
                  placeholder="Conte-nos sua experiência..."
                  placeholderTextColor="#AAA"
                  value={comentario}
                  onChangeText={setComentario}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={modalStyles.modalFooter}>
              <TouchableOpacity
                style={[modalStyles.btnSalvar, salvando && modalStyles.btnDisabled]}
                onPress={handleSalvarAvaliacao}
                disabled={salvando}
                activeOpacity={0.9}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={modalStyles.btnSalvarText}>
                  {salvando ? 'Salvando...' : 'Enviar Avaliação'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notificacoes}
        renderItem={renderNotificacao}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoBranco },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: cores.brancoTexto,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { ...fontes.merriweatherBold, fontSize: 18 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...fontes.montserrat, fontSize: 14, color: '#999' },
  lista: { padding: 20 },
  notifCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notifCardNaoLida: { borderLeftWidth: 4, borderLeftColor: cores.verdeEscuro },
  notifHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  notifIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: { flex: 1 },
  notifTitulo: { ...fontes.montserratBold, fontSize: 15, marginBottom: 4 },
  notifDescricao: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notifData: { ...fontes.montserrat, fontSize: 12, color: '#999' },
  notifBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: cores.laranjaEscuro,
  },
  notifActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  notifBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  notifBtnNao: { backgroundColor: '#F44336' },
  notifBtnSim: { backgroundColor: cores.verdeEscuro },
  notifBtnText: { ...fontes.montserratBold, fontSize: 13, color: '#fff' },
  notifRespondida: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  notifRespondidaText: { ...fontes.montserrat, fontSize: 13, color: '#666', flex: 1 },
  marcarLidaBtn: { marginTop: 8, alignSelf: 'flex-end' },
  marcarLidaText: {
    ...fontes.montserratMedium,
    fontSize: 12,
    color: cores.verdeEscuro,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: cores.brancoTexto,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { ...fontes.merriweatherBold, fontSize: 20, color: cores.verdeEscuro },
  modalBody: { paddingHorizontal: 20, paddingVertical: 24 },
  avaliacaoContainer: { alignItems: 'center' },
  avaliacaoLabel: {
    ...fontes.merriweatherBold,
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  estrelasContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  estrelaTexto: { ...fontes.montserrat, fontSize: 14, color: '#999', marginBottom: 24 },
  comentarioLabel: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  comentarioInput: {
    ...fontes.montserrat,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  btnSalvar: {
    paddingVertical: 14,
    backgroundColor: cores.verdeEscuro,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSalvarText: { ...fontes.montserratBold, fontSize: 14, color: '#fff' },
  btnDisabled: { opacity: 0.7 },
});