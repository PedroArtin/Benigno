// screens/instituicao/DoacoesRecebidas.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../../components/Global';
import { auth } from '../../firebase/firebaseconfig';
import * as projetosService from '../../services/projetosService';

export default function DoacoesRecebidas() {
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // todas, pendentes, confirmadas, entregues

  useEffect(() => {
    carregarDoacoes();
  }, []);

  const carregarDoacoes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const doacoesData = await projetosService.buscarDoacoesInstituicao(user.uid);
      setDoacoes(doacoesData);
    } catch (error) {
      console.error('Erro ao carregar doações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarDoacoes();
  };

  const handleConfirmar = async (doacaoId) => {
    Alert.alert('Confirmar Entrega', 'Marcar esta doação como entregue?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await projetosService.atualizarStatusDoacao(doacaoId, 'entregue');
            Alert.alert('Sucesso', 'Doação confirmada!');
            carregarDoacoes();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível confirmar');
          }
        },
      },
    ]);
  };

  const doacoesFiltradas = doacoes.filter((d) => {
    if (filtro === 'pendentes') return d.status === 'pendente';
    if (filtro === 'confirmadas') return d.status === 'confirmado';
    if (filtro === 'entregues') return d.status === 'entregue';
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      pendente: cores.laranjaEscuro,
      confirmado: '#1976D2',
      entregue: cores.verdeEscuro,
      cancelado: '#E53935',
    };
    return colors[status] || '#999';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pendente: 'time',
      confirmado: 'checkmark-circle',
      entregue: 'checkmark-done-circle',
      cancelado: 'close-circle',
    };
    return icons[status] || 'help-circle';
  };

  const getStatusText = (status) => {
    const texts = {
      pendente: 'Aguardando',
      confirmado: 'Confirmado',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Doações</Text>
          <Text style={styles.headerSubtitle}>{doacoesFiltradas.length} recebida(s)</Text>
        </View>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtrosContainer}
      >
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'todas' && styles.filtroAtivo]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filtroText, filtro === 'todas' && styles.filtroTextoAtivo]}>
            Todas ({doacoes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'pendentes' && styles.filtroAtivo]}
          onPress={() => setFiltro('pendentes')}
        >
          <Text style={[styles.filtroText, filtro === 'pendentes' && styles.filtroTextoAtivo]}>
            Pendentes ({doacoes.filter((d) => d.status === 'pendente').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'entregues' && styles.filtroAtivo]}
          onPress={() => setFiltro('entregues')}
        >
          <Text style={[styles.filtroText, filtro === 'entregues' && styles.filtroTextoAtivo]}>
            Entregues ({doacoes.filter((d) => d.status === 'entregue').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de Doações */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {doacoesFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={80} color={cores.placeholder} />
            <Text style={styles.emptyTitle}>Nenhuma doação encontrada</Text>
            <Text style={styles.emptyText}>
              {filtro === 'todas'
                ? 'Você ainda não recebeu doações'
                : `Não há doações ${filtro}`}
            </Text>
          </View>
        ) : (
          doacoesFiltradas.map((doacao) => (
            <View key={doacao.id} style={styles.doacaoCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.doadorInfo}>
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: getStatusColor(doacao.status) + '20' },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={24}
                      color={getStatusColor(doacao.status)}
                    />
                  </View>
                  <View style={styles.doadorTexts}>
                    <Text style={styles.doadorNome}>{doacao.doadorNome}</Text>
                    <Text style={styles.doadorContato}>{doacao.doadorTelefone}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(doacao.status) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(doacao.status)}
                    size={14}
                    color={getStatusColor(doacao.status)}
                  />
                  <Text
                    style={[styles.statusText, { color: getStatusColor(doacao.status) }]}
                  >
                    {getStatusText(doacao.status)}
                  </Text>
                </View>
              </View>

              {/* Itens */}
              <View style={styles.itemsContainer}>
                <Ionicons name="gift" size={18} color={cores.laranjaEscuro} />
                <Text style={styles.itemsText}>{doacao.items}</Text>
              </View>

              {/* Modalidade */}
              <View style={styles.modalidadeContainer}>
                <Ionicons
                  name={doacao.modalidade === 'retirar' ? 'home' : 'car'}
                  size={18}
                  color={cores.verdeEscuro}
                />
                <Text style={styles.modalidadeText}>
                  {doacao.modalidade === 'retirar'
                    ? 'Retirar no endereço do doador'
                    : 'Doador irá entregar'}
                </Text>
              </View>

              {/* Endereço (se disponível) */}
              {doacao.endereco && (
                <View style={styles.enderecoContainer}>
                  <Ionicons name="location" size={18} color={cores.placeholder} />
                  <Text style={styles.enderecoText} numberOfLines={2}>
                    {doacao.endereco}
                  </Text>
                </View>
              )}

              {/* Botão de Ação */}
              {doacao.status === 'pendente' && (
                <TouchableOpacity
                  style={styles.confirmarBtn}
                  onPress={() => handleConfirmar(doacao.id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.confirmarBtnText}>Confirmar Entrega</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...fontes.montserrat,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 28,
    color: cores.verdeEscuro,
  },
  headerSubtitle: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filtrosScroll: {
    maxHeight: 50,
  },
  filtrosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  filtroAtivo: {
    backgroundColor: cores.verdeEscuro,
  },
  filtroText: {
    ...fontes.montserratMedium,
    fontSize: 13,
    color: '#666',
  },
  filtroTextoAtivo: {
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: cores.placeholder,
    textAlign: 'center',
  },
  doacaoCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doadorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doadorTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  doadorNome: {
    ...fontes.montserratBold,
    fontSize: 16,
    marginBottom: 4,
  },
  doadorContato: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    ...fontes.montserratMedium,
    fontSize: 11,
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: cores.laranjaClaro,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemsText: {
    ...fontes.montserratMedium,
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    color: '#333',
  },
  modalidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalidadeText: {
    ...fontes.montserrat,
    fontSize: 13,
    marginLeft: 8,
    color: '#666',
  },
  enderecoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 4,
  },
  enderecoText: {
    ...fontes.montserrat,
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    color: '#666',
  },
  confirmarBtn: {
    flexDirection: 'row',
    backgroundColor: cores.verdeEscuro,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  confirmarBtnText: {
    ...fontes.montserratBold,
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
});