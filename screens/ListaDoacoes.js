// screens/ListaDoacoes.js - COMPLETA COM CONFIRMAÇÃO
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
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import * as doacoesService from '../services/doacoesService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';

export default function ListaDoacoes({ instituicaoId }) {
  const [doacoes, setDoacoes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState(null); // null = todas
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(null);

  useEffect(() => {
    carregarDoacoes();
  }, [filtroStatus]);

  const carregarDoacoes = async () => {
    try {
      setRefreshing(true);
      console.log('📥 Carregando doações para instituição:', instituicaoId);
      
      const dados = await doacoesService.buscarDoacoesInstituicao(
        instituicaoId,
        filtroStatus
      );
      
      // Enriquecer dados com informações do doador
      const doacoesEnriquecidas = await Promise.all(
        dados.map(async (doacao) => {
          try {
            if (doacao.doadorId) {
              const doadorRef = doc(db, 'usuarios', doacao.doadorId);
              const doadorDoc = await getDoc(doadorRef);
              
              if (doadorDoc.exists()) {
                const doadorData = doadorDoc.data();
                return {
                  ...doacao,
                  doadorNome: doadorData.nome || 'Usuário',
                  doadorTelefone: doadorData.telefone || '',
                  doadorEmail: doadorData.email || '',
                };
              }
            }
            return doacao;
          } catch (error) {
            console.error('Erro ao buscar dados do doador:', error);
            return doacao;
          }
        })
      );
      
      setDoacoes(doacoesEnriquecidas);
      console.log(`✅ ${doacoesEnriquecidas.length} doações carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar doações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as doações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const confirmarRecebimento = async (doacaoId) => {
    Alert.alert(
      'Confirmar Recebimento',
      'Confirma que esta doação foi recebida pela instituição?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const resultado = await doacoesService.confirmarRecebimento(doacaoId);
              
              if (resultado.success) {
                Alert.alert('Sucesso', 'Doação confirmada como recebida!');
                carregarDoacoes(); // Recarregar lista
              } else {
                Alert.alert('Erro', 'Não foi possível confirmar o recebimento');
              }
            } catch (error) {
              console.error('❌ Erro ao confirmar:', error);
              Alert.alert('Erro', 'Não foi possível confirmar o recebimento');
            }
          },
        },
      ]
    );
  };

  const marcarComoColetado = async (doacaoId) => {
    Alert.alert(
      'Marcar como Coletado',
      'Confirma que esta doação foi coletada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const resultado = await doacoesService.marcarComoColetado(
                doacaoId,
                instituicaoId
              );
              
              if (resultado.success) {
                Alert.alert('Sucesso', 'Doação marcada como coletada!');
                carregarDoacoes();
              } else {
                Alert.alert('Erro', 'Não foi possível marcar como coletado');
              }
            } catch (error) {
              console.error('❌ Erro ao marcar:', error);
              Alert.alert('Erro', 'Não foi possível marcar como coletado');
            }
          },
        },
      ]
    );
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pendente: {
        label: 'Pendente',
        color: cores.laranjaEscuro,
        bg: cores.laranjaClaro,
        icon: 'time',
      },
      aguardando_confirmacao: {
        label: 'Aguardando Confirmação',
        color: '#1976D2',
        bg: '#E3F2FD',
        icon: 'hourglass',
      },
      aguardando_confirmacao_usuario: {
        label: '⏳ Aguardando Usuário',
        color: '#F57C00',
        bg: '#FFF3E0',
        icon: 'alert-circle',
      },
      recebida: {
        label: 'Recebida',
        color: '#388E3C',
        bg: cores.verdeClaro,
        icon: 'checkmark-circle',
      },
      cancelada: {
        label: 'Cancelada',
        color: '#D32F2F',
        bg: '#FFEBEE',
        icon: 'close-circle',
      },
    };
    return statusMap[status] || statusMap.pendente;
  };

  const getTipoEntregaIcon = (tipo) => {
    return tipo === 'entrega' ? 'home' : 'car';
  };

  const renderDoacao = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const tipoIcon = getTipoEntregaIcon(item.tipoEntrega);

    return (
      <TouchableOpacity
        style={styles.doacaoCard}
        onPress={() => setModalDetalhes(item)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name={tipoIcon} size={20} color={cores.verdeEscuro} />
            <Text style={styles.tipoEntrega}>
              {item.tipoEntrega === 'entrega' ? 'Entrega na ONG' : 'Coleta'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Dados do Doador */}
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.infoLabel}>Doador:</Text>
            <Text style={styles.infoValue}>
              {item.doadorNome || 'Não informado'}
            </Text>
          </View>

          {item.doadorTelefone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.infoLabel}>Telefone:</Text>
              <Text style={styles.infoValue}>{item.doadorTelefone}</Text>
            </View>
          )}

          {item.itens && item.itens.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="cube" size={16} color="#666" />
              <Text style={styles.infoLabel}>Itens:</Text>
              <Text style={styles.infoValue}>
                {item.itens.length} item(ns)
              </Text>
            </View>
          )}

          {item.observacoes && (
            <View style={styles.observacoesBox}>
              <Text style={styles.observacoesLabel}>Observações:</Text>
              <Text style={styles.observacoesText} numberOfLines={2}>
                {item.observacoes}
              </Text>
            </View>
          )}
        </View>

        {/* Ações */}
        <View style={styles.cardActions}>
          {item.status === 'aguardando_confirmacao' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.confirmBtn]}
              onPress={() => confirmarRecebimento(item.id)}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Confirmar Recebimento</Text>
            </TouchableOpacity>
          )}

          {item.status === 'pendente' && item.tipoEntrega === 'coleta' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.coletarBtn]}
              onPress={() => marcarComoColetado(item.id)}
            >
              <Ionicons name="car" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Marcar como Coletado</Text>
            </TouchableOpacity>
          )}
          
          {item.status === 'aguardando_confirmacao_usuario' && (
            <View style={styles.avisoBox}>
              <Ionicons name="information-circle" size={20} color="#F57C00" />
              <Text style={styles.avisoText}>
                Aguardando o usuário confirmar que você coletou
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.detailsBtn]}
            onPress={() => setModalDetalhes(item)}
          >
            <Ionicons name="eye" size={18} color={cores.verdeEscuro} />
            <Text style={[styles.actionBtnText, { color: cores.verdeEscuro }]}>
              Ver Detalhes
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="gift-outline" size={80} color={cores.placeholder} />
      <Text style={styles.emptyTitle}>Nenhuma doação</Text>
      <Text style={styles.emptyText}>
        {filtroStatus
          ? `Nenhuma doação com status "${getStatusInfo(filtroStatus).label}"`
          : 'Ainda não há doações para esta instituição'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroChip, !filtroStatus && styles.filtroAtivo]}
          onPress={() => setFiltroStatus(null)}
        >
          <Text style={[styles.filtroText, !filtroStatus && styles.filtroTextAtivo]}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroChip,
            filtroStatus === 'pendente' && styles.filtroAtivo,
          ]}
          onPress={() => setFiltroStatus('pendente')}
        >
          <Text
            style={[
              styles.filtroText,
              filtroStatus === 'pendente' && styles.filtroTextAtivo,
            ]}
          >
            Pendentes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroChip,
            filtroStatus === 'aguardando_confirmacao' && styles.filtroAtivo,
          ]}
          onPress={() => setFiltroStatus('aguardando_confirmacao')}
        >
          <Text
            style={[
              styles.filtroText,
              filtroStatus === 'aguardando_confirmacao' && styles.filtroTextAtivo,
            ]}
          >
            Aguardando
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroChip,
            filtroStatus === 'recebida' && styles.filtroAtivo,
          ]}
          onPress={() => setFiltroStatus('recebida')}
        >
          <Text
            style={[
              styles.filtroText,
              filtroStatus === 'recebida' && styles.filtroTextAtivo,
            ]}
          >
            Recebidas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={doacoes}
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

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Doador:</Text>
                  <Text style={styles.detailValue}>
                    {modalDetalhes.doadorNome || 'Não informado'}
                  </Text>
                </View>

                {modalDetalhes.doadorTelefone && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Telefone:</Text>
                    <Text style={styles.detailValue}>
                      {modalDetalhes.doadorTelefone}
                    </Text>
                  </View>
                )}

                {modalDetalhes.doadorEmail && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>E-mail:</Text>
                    <Text style={styles.detailValue}>
                      {modalDetalhes.doadorEmail}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo de Entrega:</Text>
                  <Text style={styles.detailValue}>
                    {modalDetalhes.tipoEntrega === 'entrega'
                      ? 'Entrega na ONG'
                      : 'Coleta pela ONG'}
                  </Text>
                </View>

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

                {modalDetalhes.observacoes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Observações:</Text>
                    <Text style={styles.detailValue}>
                      {modalDetalhes.observacoes}
                    </Text>
                  </View>
                )}
              </View>

              {modalDetalhes.status === 'aguardando_confirmacao' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.confirmBtn, { marginTop: 15 }]}
                  onPress={() => {
                    setModalDetalhes(null);
                    confirmarRecebimento(modalDetalhes.id);
                  }}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Confirmar Recebimento</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipoEntrega: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: cores.verdeEscuro,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    ...fontes.montserratBold,
    fontSize: 11,
  },
  cardContent: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    ...fontes.montserratMedium,
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  observacoesBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  observacoesLabel: {
    ...fontes.montserratBold,
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  observacoesText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  cardActions: {
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    gap: 8,
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
  },
  coletarBtn: {
    backgroundColor: cores.laranjaEscuro,
  },
  detailsBtn: {
    backgroundColor: cores.verdeClaro,
  },
  actionBtnText: {
    ...fontes.montserratBold,
    fontSize: 13,
    color: '#fff',
  },
  avisoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  avisoText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#F57C00',
    flex: 1,
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
    textAlign: 'center',
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