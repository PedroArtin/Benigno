// screens/MinhasDoacoes.js - TELA DE DOAÇÕES DO USUÁRIO
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { auth } from '../firebase/firebaseconfig';
import * as doacoesService from '../services/doacoesService';

export default function MinhasDoacoes({ navigation }) {
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // todas, pendentes, aguardando, recebidas
  const [modalDetalhes, setModalDetalhes] = useState(null);

  useEffect(() => {
    carregarDoacoes();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDoacoes();
    });
    return unsubscribe;
  }, [navigation]);

  const carregarDoacoes = async () => {
    try {
      setRefreshing(true);
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Erro', 'Você precisa estar logado');
        return;
      }

      const dados = await doacoesService.buscarDoacoesPorDoador(user.uid);
      setDoacoes(dados);
      
      console.log(`✅ ${dados.length} doações do usuário carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar doações:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas doações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const confirmarColeta = async (doacaoId) => {
    Alert.alert(
      'Confirmar Coleta',
      'A instituição realmente coletou esta doação?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, confirmar',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              const resultado = await doacoesService.confirmarColetaPeloUsuario(
                doacaoId,
                user.uid
              );
              
              if (resultado.success) {
                Alert.alert('Sucesso! 🎉', 'Doação confirmada como recebida!');
                carregarDoacoes();
                setModalDetalhes(null);
              } else {
                Alert.alert('Erro', resultado.error || 'Não foi possível confirmar');
              }
            } catch (error) {
              console.error('❌ Erro ao confirmar:', error);
              Alert.alert('Erro', 'Não foi possível confirmar a coleta');
            }
          },
        },
      ]
    );
  };

  const getStatusInfo = (status, tipoEntrega) => {
    const statusMap = {
      pendente: {
        label: 'Aguardando Coleta',
        color: cores.laranjaEscuro,
        bg: cores.laranjaClaro,
        icon: 'time',
        descricao: 'A instituição ainda não coletou',
      },
      aguardando_confirmacao: {
        label: 'Aguardando Entrega',
        color: '#1976D2',
        bg: '#E3F2FD',
        icon: 'home',
        descricao: 'Leve os itens até a instituição',
      },
      aguardando_confirmacao_usuario: {
        label: '⚠️ Confirme a Coleta',
        color: '#F57C00',
        bg: '#FFF3E0',
        icon: 'alert-circle',
        descricao: 'A ONG diz que coletou. Confirme se receberam!',
        acao: true,
      },
      recebida: {
        label: 'Recebida ✓',
        color: '#388E3C',
        bg: cores.verdeClaro,
        icon: 'checkmark-circle',
        descricao: 'Doação concluída com sucesso!',
      },
      cancelada: {
        label: 'Cancelada',
        color: '#D32F2F',
        bg: '#FFEBEE',
        icon: 'close-circle',
        descricao: 'Esta doação foi cancelada',
      },
    };
    return statusMap[status] || statusMap.pendente;
  };

  const doacoesFiltradas = doacoes.filter(doacao => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendentes') return doacao.status === 'pendente';
    if (filtro === 'aguardando') return doacao.status === 'aguardando_confirmacao' || doacao.status === 'aguardando_confirmacao_usuario';
    if (filtro === 'recebidas') return doacao.status === 'recebida';
    return true;
  });

  const totalPendentesConfirmacao = doacoes.filter(
    d => d.status === 'aguardando_confirmacao_usuario'
  ).length;

  const renderDoacao = ({ item }) => {
    const statusInfo = getStatusInfo(item.status, item.tipoEntrega);

    return (
      <TouchableOpacity
        style={[
          styles.doacaoCard,
          statusInfo.acao && styles.doacaoCardDestaque
        ]}
        onPress={() => setModalDetalhes(item)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons
              name={item.tipoEntrega === 'entrega' ? 'home' : 'car'}
              size={20}
              color={cores.verdeEscuro}
            />
            <Text style={styles.projetoTitulo} numberOfLines={1}>
              {item.projetoTitulo}
            </Text>
          </View>
        </View>

        {/* Status */}
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>

        {/* Descrição */}
        <Text style={styles.statusDescricao}>{statusInfo.descricao}</Text>

        {/* Itens */}
        {item.itens && item.itens.length > 0 && (
          <View style={styles.itensInfo}>
            <Ionicons name="cube-outline" size={14} color="#666" />
            <Text style={styles.itensText}>
              {item.itens.length} item(ns) doado(s)
            </Text>
          </View>
        )}

        {/* Botão de Ação */}
        {statusInfo.acao && (
          <TouchableOpacity
            style={styles.confirmarBtn}
            onPress={() => confirmarColeta(item.id)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.confirmarBtnText}>Confirmar Coleta</Text>
          </TouchableOpacity>
        )}

        {/* Ver Detalhes */}
        <TouchableOpacity style={styles.verDetalhesBtn}>
          <Text style={styles.verDetalhesBtnText}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={16} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="gift-outline" size={80} color={cores.placeholder} />
      <Text style={styles.emptyTitle}>Nenhuma doação ainda</Text>
      <Text style={styles.emptyText}>
        Suas doações aparecerão aqui
      </Text>
      <TouchableOpacity
        style={styles.doarButton}
        onPress={() => navigation.navigate('Doar')}
      >
        <Ionicons name="heart" size={20} color="#fff" />
        <Text style={styles.doarButtonText}>Fazer Doação</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Minhas Doações</Text>
          {totalPendentesConfirmacao > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalPendentesConfirmacao}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={carregarDoacoes}>
          <Ionicons name="refresh" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </View>

      {/* Alerta */}
      {totalPendentesConfirmacao > 0 && (
        <View style={styles.alertaBanner}>
          <Ionicons name="alert-circle" size={24} color="#F57C00" />
          <Text style={styles.alertaTexto}>
            {totalPendentesConfirmacao} doação(ões) precisam de confirmação
          </Text>
        </View>
      )}

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroChip, filtro === 'todas' && styles.filtroAtivo]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filtroText, filtro === 'todas' && styles.filtroTextAtivo]}>
            Todas ({doacoes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroChip, filtro === 'aguardando' && styles.filtroAtivo]}
          onPress={() => setFiltro('aguardando')}
        >
          <Text style={[styles.filtroText, filtro === 'aguardando' && styles.filtroTextAtivo]}>
            Aguardando
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroChip, filtro === 'recebidas' && styles.filtroAtivo]}
          onPress={() => setFiltro('recebidas')}
        >
          <Text style={[styles.filtroText, filtro === 'recebidas' && styles.filtroTextAtivo]}>
            Recebidas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={doacoesFiltradas}
        renderItem={renderDoacao}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={carregarDoacoes} />
        }
      />

      {/* Modal de Detalhes */}
      {modalDetalhes && (
        <Modal
          visible={!!modalDetalhes}
          transparent
          animationType="slide"
          onRequestClose={() => setModalDetalhes(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detalhes da Doação</Text>
                <TouchableOpacity onPress={() => setModalDetalhes(null)}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {/* Status */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusInfo(modalDetalhes.status).bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusInfo(modalDetalhes.status).color },
                      ]}
                    >
                      {getStatusInfo(modalDetalhes.status).label}
                    </Text>
                  </View>
                </View>

                {/* Projeto */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Projeto:</Text>
                  <Text style={styles.detailValue}>
                    {modalDetalhes.projetoTitulo}
                  </Text>
                </View>

                {/* Tipo de Entrega */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo:</Text>
                  <Text style={styles.detailValue}>
                    {modalDetalhes.tipoEntrega === 'entrega'
                      ? 'Entrega na ONG'
                      : 'Coleta pela ONG'}
                  </Text>
                </View>

                {/* Itens */}
                {modalDetalhes.itens && modalDetalhes.itens.length > 0 && (
                  <View style={styles.itensSection}>
                    <Text style={styles.detailLabel}>Itens Doados:</Text>
                    {modalDetalhes.itens.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Ionicons name="cube" size={16} color={cores.verdeEscuro} />
                        <Text style={styles.itemText}>
                          {item.quantidade}x {item.categoria}
                          {item.descricao ? ` - ${item.descricao}` : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Observações */}
                {modalDetalhes.observacoes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Observações:</Text>
                    <Text style={styles.detailValue}>
                      {modalDetalhes.observacoes}
                    </Text>
                  </View>
                )}
              </View>

              {/* Botão Confirmar no Modal */}
              {modalDetalhes.status === 'aguardando_confirmacao_usuario' && (
                <TouchableOpacity
                  style={[styles.confirmarBtn, { marginTop: 15 }]}
                  onPress={() => confirmarColeta(modalDetalhes.id)}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.confirmarBtnText}>Confirmar Coleta</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
  },
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
  },
  headerBadge: {
    backgroundColor: cores.laranjaEscuro,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    ...fontes.montserratBold,
    fontSize: 11,
    color: '#fff',
  },
  alertaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 15,
    gap: 12,
  },
  alertaTexto: {
    ...fontes.montserratMedium,
    fontSize: 14,
    color: '#F57C00',
    flex: 1,
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: cores.brancoTexto,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtroChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filtroAtivo: {
    backgroundColor: cores.verdeEscuro,
  },
  filtroText: {
    ...fontes.montserratMedium,
    fontSize: 13,
    color: '#666',
  },
  filtroTextAtivo: {
    color: '#fff',
  },
  lista: {
    padding: 15,
  },
  doacaoCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doacaoCardDestaque: {
    borderWidth: 2,
    borderColor: '#F57C00',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  projetoTitulo: {
    ...fontes.montserratBold,
    fontSize: 15,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...fontes.montserratBold,
    fontSize: 12,
  },
  statusDescricao: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  itensInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  itensText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  confirmarBtn: {
    flexDirection: 'row',
    backgroundColor: '#F57C00',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  confirmarBtnText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#fff',
  },
  verDetalhesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  verDetalhesBtnText: {
    ...fontes.montserratMedium,
    fontSize: 13,
    color: cores.verdeEscuro,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
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
    marginBottom: 25,
  },
  doarButton: {
    flexDirection: 'row',
    backgroundColor: cores.verdeEscuro,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  doarButtonText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: cores.brancoTexto,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
  },
  modalBody: {
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#666',
    minWidth: 100,
  },
  detailValue: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itensSection: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  itemText: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
});