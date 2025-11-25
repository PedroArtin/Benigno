// screens/HistoricoAtividades.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView, // ← IMPORTANTE: ScrollView importado aqui
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { auth } from '../firebase/firebaseconfig';
import { buscarEstatisticas } from '../services/userService';

export default function HistoricoAtividades({ navigation }) {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado ao carregar histórico');
        Alert.alert('Erro', 'Faça login para ver seu histórico', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
        setLoading(false);
        return;
      }

      const estatisticas = await buscarEstatisticas(user.uid);
        
        const atividadesDoacoes = estatisticas.listaDoacoes?.map(doacao => ({
          id: doacao.id,
          tipo: 'doacao',
          titulo: `Doação para ${doacao.projetoTitulo}`,
          descricao: `R$ ${doacao.valor?.toLocaleString('pt-BR') || '0'}`,
          data: doacao.data?.toDate ? doacao.data.toDate() : new Date(doacao.data),
          status: doacao.status,
          icone: 'gift',
          cor: cores.verdeEscuro,
        })) || [];

        const outrasAtividades = [
          {
            id: 'fav-1',
            tipo: 'favorito',
            titulo: 'Adicionou projeto aos favoritos',
            descricao: 'Construção de Escola Comunitária',
            data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            icone: 'heart',
            cor: cores.laranjaEscuro,
          },
          {
            id: 'conquista-1',
            tipo: 'conquista',
            titulo: 'Nova conquista desbloqueada',
            descricao: 'Doador Iniciante - 1ª doação',
            data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            icone: 'trophy',
            cor: '#FFB800',
          },
          {
            id: 'perfil-1',
            tipo: 'perfil',
            titulo: 'Perfil atualizado',
            descricao: 'Informações pessoais atualizadas',
            data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            icone: 'person',
            cor: '#666',
          },
        ];

        const todasAtividades = [...atividadesDoacoes, ...outrasAtividades].sort(
          (a, b) => b.data - a.data
        );

        setAtividades(todasAtividades);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarAtividades = () => {
    if (filtro === 'todas') return atividades;
    return atividades.filter(ativ => ativ.tipo === filtro);
  };

  const formatarData = (data) => {
    const hoje = new Date();
    const diff = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    if (diff < 7) return `${diff} dias atrás`;
    if (diff < 30) return `${Math.floor(diff / 7)} semanas atrás`;
    if (diff < 365) return `${Math.floor(diff / 30)} meses atrás`;
    return data.toLocaleDateString('pt-BR');
  };

  const renderAtividade = ({ item }) => (
    <TouchableOpacity style={styles.atividadeCard}>
      <View style={[styles.atividadeIcon, { backgroundColor: item.cor + '20' }]}>
        <Ionicons name={item.icone} size={24} color={item.cor} />
      </View>
      
      <View style={styles.atividadeContent}>
        <Text style={styles.atividadeTitulo}>{item.titulo}</Text>
        <Text style={styles.atividadeDescricao}>{item.descricao}</Text>
        <View style={styles.atividadeFooter}>
          <Text style={styles.atividadeData}>{formatarData(item.data)}</Text>
          {item.status && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'confirmada' ? cores.verdeClaro : '#FFF3E0' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.status === 'confirmada' ? cores.verdeEscuro : '#F57C00' }
              ]}>
                {item.status === 'confirmada' ? 'Confirmada' : 'Pendente'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFiltros = () => (
    <View style={styles.filtrosContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { id: 'todas', label: 'Todas', icon: 'apps' },
          { id: 'doacao', label: 'Doações', icon: 'gift' },
          { id: 'favorito', label: 'Favoritos', icon: 'heart' },
          { id: 'conquista', label: 'Conquistas', icon: 'trophy' },
        ].map((filtroItem) => (
          <TouchableOpacity
            key={filtroItem.id}
            style={[
              styles.filtroButton,
              filtro === filtroItem.id && styles.filtroButtonActive,
            ]}
            onPress={() => setFiltro(filtroItem.id)}
          >
            <Ionicons
              name={filtroItem.icon}
              size={18}
              color={filtro === filtroItem.id ? cores.brancoTexto : cores.verdeEscuro}
            />
            <Text
              style={[
                styles.filtroText,
                filtro === filtroItem.id && styles.filtroTextActive,
              ]}
            >
              {filtroItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.verdeEscuro} />
        </View>
      </SafeAreaView>
    );
  }

  const atividadesFiltradas = filtrarAtividades();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico</Text>
        <TouchableOpacity onPress={carregarHistorico}>
          <Ionicons name="refresh" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </View>

      {renderFiltros()}

      <View style={styles.resumoContainer}>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoNumero}>{atividades.length}</Text>
          <Text style={styles.resumoLabel}>Total de atividades</Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoNumero}>
            {atividades.filter(a => a.tipo === 'doacao').length}
          </Text>
          <Text style={styles.resumoLabel}>Doações</Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoNumero}>
            {atividades.filter(a => a.tipo === 'conquista').length}
          </Text>
          <Text style={styles.resumoLabel}>Conquistas</Text>
        </View>
      </View>

      <FlatList
        data={atividadesFiltradas}
        renderItem={renderAtividade}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={80} color="#CCC" />
            <Text style={styles.emptyTitle}>Nenhuma atividade</Text>
            <Text style={styles.emptyText}>
              Suas atividades aparecerão aqui
            </Text>
          </View>
        }
      />
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
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtrosContainer: {
    backgroundColor: cores.brancoTexto,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: cores.verdeClaro,
  },
  filtroButtonActive: {
    backgroundColor: cores.verdeEscuro,
  },
  filtroText: {
    ...fontes.montserratBold,
    fontSize: 13,
    marginLeft: 6,
    color: cores.verdeEscuro,
  },
  filtroTextActive: {
    color: cores.brancoTexto,
  },
  resumoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  resumoCard: {
    alignItems: 'center',
  },
  resumoNumero: {
    ...fontes.merriweatherBold,
    fontSize: 28,
    color: cores.verdeEscuro,
  },
  resumoLabel: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  atividadeCard: {
    flexDirection: 'row',
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  atividadeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  atividadeContent: {
    flex: 1,
  },
  atividadeTitulo: {
    ...fontes.merriweatherBold,
    fontSize: 15,
    marginBottom: 4,
  },
  atividadeDescricao: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  atividadeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  atividadeData: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...fontes.montserratBold,
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});