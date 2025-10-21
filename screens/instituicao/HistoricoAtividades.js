// screens/instituicao/HistoricoAtividades.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../../components/Global';
import { auth } from '../../firebase/firebaseconfig';
import * as projetosService from '../../services/projetosService';

export default function HistoricoAtividades({ navigation }) {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // todas, projetos, doacoes

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const projetos = await projetosService.buscarProjetosInstituicao(user.uid);
      const doacoes = await projetosService.buscarDoacoesInstituicao(user.uid);

      // Criar atividades dos projetos
      const atividadesProjetos = projetos.map((p) => ({
        id: `projeto-${p.id}`,
        tipo: 'projeto',
        acao: 'criou',
        titulo: `Projeto "${p.titulo}" criado`,
        descricao: p.necessidade,
        data: p.dataCriacao?.toDate?.() || new Date(p.dataCriacao),
        icone: 'folder-open',
        cor: cores.verdeEscuro,
        projeto: p,
      }));

      // Criar atividades das doações
      const atividadesDoacoes = doacoes.map((d) => ({
        id: `doacao-${d.id}`,
        tipo: 'doacao',
        acao: 'recebeu',
        titulo: `Doação de ${d.doadorNome}`,
        descricao: d.items,
        data: d.dataDoacao?.toDate?.() || new Date(d.dataDoacao),
        icone: 'gift',
        cor: cores.laranjaEscuro,
        doacao: d,
      }));

      // Combinar e ordenar por data
      const todasAtividades = [...atividadesProjetos, ...atividadesDoacoes];
      todasAtividades.sort((a, b) => b.data - a.data);

      setAtividades(todasAtividades);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarHistorico();
  };

  const atividadesFiltradas = atividades.filter((a) => {
    if (filtro === 'projetos') return a.tipo === 'projeto';
    if (filtro === 'doacoes') return a.tipo === 'doacao';
    return true;
  });

  const formatarData = (data) => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (data.toDateString() === ontem.toDateString()) {
      return `Ontem às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const agruparPorData = (atividades) => {
    const grupos = {};
    
    atividades.forEach((atividade) => {
      const dataStr = atividade.data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      
      if (!grupos[dataStr]) {
        grupos[dataStr] = [];
      }
      grupos[dataStr].push(atividade);
    });

    return grupos;
  };

  const grupos = agruparPorData(atividadesFiltradas);

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
        <Text style={styles.headerTitle}>Histórico</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'todas' && styles.filtroAtivo]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filtroText, filtro === 'todas' && styles.filtroTextoAtivo]}>
            Todas ({atividades.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'projetos' && styles.filtroAtivo]}
          onPress={() => setFiltro('projetos')}
        >
          <Text style={[styles.filtroText, filtro === 'projetos' && styles.filtroTextoAtivo]}>
            Projetos ({atividades.filter((a) => a.tipo === 'projeto').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'doacoes' && styles.filtroAtivo]}
          onPress={() => setFiltro('doacoes')}
        >
          <Text style={[styles.filtroText, filtro === 'doacoes' && styles.filtroTextoAtivo]}>
            Doações ({atividades.filter((a) => a.tipo === 'doacao').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timeline de Atividades */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.keys(grupos).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={80} color={cores.placeholder} />
            <Text style={styles.emptyTitle}>Nenhuma atividade</Text>
            <Text style={styles.emptyText}>
              {filtro === 'todas'
                ? 'Seu histórico de atividades aparecerá aqui'
                : `Nenhuma atividade de ${filtro}`}
            </Text>
          </View>
        ) : (
          Object.entries(grupos).map(([data, atividadesDoGrupo]) => (
            <View key={data} style={styles.grupoData}>
              <Text style={styles.grupoDataTitulo}>{data}</Text>
              
              {atividadesDoGrupo.map((atividade, index) => (
                <View key={atividade.id} style={styles.atividadeContainer}>
                  {/* Timeline Line */}
                  {index < atividadesDoGrupo.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                  
                  {/* Atividade Card */}
                  <View style={styles.atividadeCard}>
                    <View
                      style={[
                        styles.atividadeIcon,
                        { backgroundColor: atividade.cor + '20' },
                      ]}
                    >
                      <Ionicons
                        name={atividade.icone}
                        size={24}
                        color={atividade.cor}
                      />
                    </View>
                    
                    <View style={styles.atividadeContent}>
                      <Text style={styles.atividadeTitulo}>{atividade.titulo}</Text>
                      <Text style={styles.atividadeDescricao} numberOfLines={2}>
                        {atividade.descricao}
                      </Text>
                      <Text style={styles.atividadeHora}>
                        {formatarData(atividade.data)}
                      </Text>
                    </View>
                    
                    <View
                      style={[
                        styles.atividadeBadge,
                        { backgroundColor: atividade.cor + '20' },
                      ]}
                    >
                      <Text style={[styles.atividadeBadgeText, { color: atividade.cor }]}>
                        {atividade.tipo}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
  grupoData: {
    marginBottom: 30,
  },
  grupoDataTitulo: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.verdeEscuro,
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  atividadeContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 24,
    top: 60,
    width: 2,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  atividadeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: cores.brancoTexto,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  atividadeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  atividadeContent: {
    flex: 1,
  },
  atividadeTitulo: {
    ...fontes.montserratBold,
    fontSize: 14,
    marginBottom: 4,
  },
  atividadeDescricao: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  atividadeHora: {
    ...fontes.montserrat,
    fontSize: 11,
    color: '#999',
  },
  atividadeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  atividadeBadgeText: {
    ...fontes.montserratMedium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
});