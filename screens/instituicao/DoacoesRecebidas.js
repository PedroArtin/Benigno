// screens/instituicao/DoacoesRecebidas.js - VERSÃO SIMPLIFICADA
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../../components/Global';
import { auth } from '../../firebase/firebaseconfig';
import * as doacoesService from '../../services/doacoesService';

export default function DoacoesRecebidas({ navigation }) {
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas');

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

      console.log('📥 Carregando doações para instituição:', user.uid);
      const doacoesData = await doacoesService.buscarDoacoesPorInstituicao(user.uid);
      
      setDoacoes(doacoesData);
      console.log(`✅ ${doacoesData.length} doações carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar doações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as doações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ FUNÇÃO SIMPLIFICADA - Marca direto como recebida
  const marcarComoEntregue = async (doacao) => {
    Alert.alert(
      'Confirmar Entrega',
      `Marcar doação de ${doacao.doadorNome || 'este doador'} como entregue?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, confirmar',
          style: 'default',
          onPress: async () => {
            try {
              console.log('✅ Marcando doação como recebida:', doacao.id);
              
              // ✅ USAR confirmarRecebimento - muda direto para "recebida"
              const resultado = await doacoesService.confirmarRecebimento(doacao.id);

              if (resultado.success) {
                Alert.alert(
                  'Sucesso! 🎉',
                  'Doação marcada como entregue!',
                  [{ text: 'OK' }]
                );
                carregarDoacoes(); // Recarregar lista
              } else {
                Alert.alert('Erro', resultado.error || 'Não foi possível confirmar');
              }
            } catch (error) {
              console.error('❌ Erro ao confirmar:', error);
              Alert.alert('Erro', 'Não foi possível confirmar a entrega');
            }
          },
        },
      ]
    );
  };

  const doacoesFiltradas = doacoes.filter((d) => {
    if (filtro === 'pendentes') return d.status === 'pendente';
    if (filtro === 'recebidas') return d.status === 'recebida';
    return true;
  });

  const getStatusInfo = (status) => {
    const statusMap = {
      pendente: {
        label: 'Pendente',
        color: cores.laranjaEscuro,
        bg: cores.laranjaClaro,
        icon: 'time',
        descricao: 'Aguardando confirmação de entrega',
      },
      recebida: {
        label: 'Entregue ✓',
        color: '#388E3C',
        bg: cores.verdeClaro,
        icon: 'checkmark-circle',
        descricao: 'Doação recebida com sucesso',
      },
      cancelada: {
        label: 'Cancelada',
        color: '#D32F2F',
        bg: '#FFEBEE',
        icon: 'close-circle',
        descricao: 'Doação cancelada',
      },
    };
    return statusMap[status] || statusMap.pendente;
  };

  const totalPendentes = doacoes.filter(d => d.status === 'pendente').length;
  const totalRecebidas = doacoes.filter(d => d.status === 'recebida').length;

  const renderDoacao = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <View style={styles.doacaoCard}>
        {/* Header com Avatar e Status */}
        <View style={styles.cardHeader}>
          <View style={styles.doadorInfo}>
            <View style={[styles.avatarCircle, { backgroundColor: statusInfo.color + '20' }]}>
              <Ionicons name="person" size={24} color={statusInfo.color} />
            </View>
            <View style={styles.doadorTexts}>
              <Text style={styles.doadorNome}>
                {item.doadorNome || 'Doador Anônimo'}
              </Text>
              <Text style={styles.doadorContato}>
                {item.doadorTelefone || item.doadorEmail || 'Sem contato'}
              </Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Projeto */}
        <View style={styles.infoRow}>
          <Ionicons name="folder" size={16} color={cores.verdeEscuro} />
          <Text style={styles.infoText}>
            {item.projetoTitulo || 'Projeto sem título'}
          </Text>
        </View>

        {/* Tipo de Entrega */}
        <View style={styles.infoRow}>
          <Ionicons
            name={item.tipoEntrega === 'entrega' ? 'home' : 'car'}
            size={16}
            color={cores.laranjaEscuro}
          />
          <Text style={styles.infoText}>
            {item.tipoEntrega === 'entrega'
              ? 'Doador vai entregar'
              : 'Você deve coletar'}
          </Text>
        </View>

        {/* Itens Doados */}
        {item.itens && item.itens.length > 0 && (
          <View style={styles.itensContainer}>
            <Text style={styles.itensTitle}>
              <Ionicons name="cube" size={14} color="#666" /> Itens doados:
            </Text>
            {item.itens.map((itemDoado, index) => (
              <Text key={index} style={styles.itemText}>
                • {itemDoado.quantidade}x {itemDoado.categoria}
                {itemDoado.descricao ? ` - ${itemDoado.descricao}` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Data */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={14} color="#999" />
          <Text style={styles.dataText}>
            {item.dataCriacao?.toDate?.().toLocaleDateString('pt-BR') || 'Data não disponível'}
          </Text>
        </View>

        {/* BOTÃO - Só aparece se estiver pendente */}
        {item.status === 'pendente' && (
          <TouchableOpacity
            style={styles.confirmarBtn}
            onPress={() => marcarComoEntregue(item)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.confirmarBtnText}>Marcar como Entregue</Text>
          </TouchableOpacity>
        )}

        {/* Badge de Sucesso */}
        {item.status === 'recebida' && (
          <View style={styles.sucessoBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#388E3C" />
            <Text style={styles.sucessoText}>Doação concluída com sucesso!</Text>
          </View>
        )}
      </View>
    );
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Doações</Text>
          {totalPendentes > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalPendentes}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={carregarDoacoes}>
          <Ionicons name="refresh" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </View>

      {/* Alerta de Pendentes */}
      {totalPendentes > 0 && (
        <View style={styles.alertaBanner}>
          <Ionicons name="alert-circle" size={24} color={cores.laranjaEscuro} />
          <View style={styles.alertaContent}>
            <Text style={styles.alertaTitulo}>
              {totalPendentes} doação(ões) pendente(s)
            </Text>
            <Text style={styles.alertaSubtitulo}>
              Confirme as entregas recebidas
            </Text>
          </View>
        </View>
      )}

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
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
            Pendentes ({totalPendentes})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'recebidas' && styles.filtroAtivo]}
          onPress={() => setFiltro('recebidas')}
        >
          <Text style={[styles.filtroText, filtro === 'recebidas' && styles.filtroTextoAtivo]}>
            Entregues ({totalRecebidas})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Doações */}
      <FlatList
        data={doacoesFiltradas}
        renderItem={renderDoacao}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={carregarDoacoes} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={80} color={cores.placeholder} />
            <Text style={styles.emptyTitle}>Nenhuma doação encontrada</Text>
            <Text style={styles.emptyText}>
              {filtro === 'todas'
                ? 'Você ainda não recebeu doações'
                : `Não há doações ${filtro}`}
            </Text>
          </View>
        )}
      />
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
    color: '#666',
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
    backgroundColor: cores.laranjaClaro,
    padding: 15,
    gap: 12,
  },
  alertaContent: {
    flex: 1,
  },
  alertaTitulo: {
    ...fontes.montserratBold,
    fontSize: 15,
    color: cores.laranjaEscuro,
    marginBottom: 2,
  },
  alertaSubtitulo: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: cores.brancoTexto,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtroBtn: {
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
  filtroTextoAtivo: {
    color: '#fff',
  },
  lista: {
    padding: 20,
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
    marginBottom: 12,
  },
  doadorInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  dataText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
  },
  itensContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  itensTitle: {
    ...fontes.montserratBold,
    fontSize: 13,
    marginBottom: 8,
    color: '#333',
  },
  itemText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
  confirmarBtn: {
    flexDirection: 'row',
    backgroundColor: cores.verdeEscuro,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  confirmarBtnText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 14,
  },
  sucessoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.verdeClaro,
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 10,
  },
  sucessoText: {
    ...fontes.montserratMedium,
    fontSize: 13,
    color: '#388E3C',
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
});