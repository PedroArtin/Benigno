// screens/instituicao/EstatisticasInstituicao.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../../components/Global';
import NavbarDashboard from '../../components/navbarDashboard';
import { auth, db } from '../../firebase/firebaseconfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function EstatisticasInstituicao({ navigation }) {
  const [stats, setStats] = useState({
    totalProjetos: 0,
    projetosAtivos: 0,
    totalDoacoes: 0,
    doacoesPorMes: {},
    doacoesPorStatus: { pendente: 0, confirmada: 0, entregue: 0 },
    totalArrecadado: 0,
    mediaDocoesProj: 0,
    pontuacao: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [graficoSelecionado, setGraficoSelecionado] = useState('doacoes');

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado em EstatisticasInstituicao');
        Alert.alert('Erro', 'Faça login para ver as estatísticas', [
          { text: 'OK', onPress: () => navigation.replace('LoginInstituicao') },
        ]);
        setLoading(false);
        return;
      }

      // Carregar dados da instituição (pontuação)
      const instRef = doc(db, 'instituicoes', user.uid);
      const instSnap = await getDoc(instRef);
      let pontuacao = 0;
      
      if (instSnap.exists()) {
        const instData = instSnap.data();
        pontuacao = instData.pontos || instData.pontuacao || 0;
      }

      // Carregar projetos
      const projetosRef = collection(db, 'projetos');
      const projetosQuery = query(projetosRef, where('instituicaoId', '==', user.uid));
      const projetosSnap = await getDocs(projetosQuery);
      const projetos = projetosSnap.docs.map((d) => d.data());
      const projetosAtivos = projetos.filter((p) => p.ativo).length;

      // Carregar doações
      const doacoesRef = collection(db, 'doacoes');
      const doacoesQuery = query(doacoesRef, where('instituicaoId', '==', user.uid));
      const doacoesSnap = await getDocs(doacoesQuery);
      const doacoes = doacoesSnap.docs.map((d) => d.data());

      // Processar estatísticas
      const doacoesPorStatus = { pendente: 0, confirmada: 0, entregue: 0, recebida: 0, cancelada: 0 };
      const doacoesPorMes = {};

      doacoes.forEach((d) => {
        // Proteger contra status inválido
        if (d.status && doacoesPorStatus.hasOwnProperty(d.status)) {
          doacoesPorStatus[d.status] = (doacoesPorStatus[d.status] || 0) + 1;
        }

        if (d.dataDoacao) {
          try {
            const data = d.dataDoacao.toDate ? d.dataDoacao.toDate() : new Date(d.dataDoacao);
            // Validar se data é válida
            if (!isNaN(data.getTime())) {
              const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
              doacoesPorMes[mes] = (doacoesPorMes[mes] || 0) + 1;
            }
          } catch (e) {
            console.warn('Erro ao parsear data de doação:', d.dataDoacao, e);
          }
        }
      });

      // Calcular média com proteção contra divisão por zero
      const mediaDocoesProj = projetos.length > 0 
        ? Math.round(doacoes.length / projetos.length * 100) / 100
        : 0;

      setStats({
        totalProjetos: projetos.length || 0,
        projetosAtivos: projetosAtivos || 0,
        totalDoacoes: doacoes.length || 0,
        doacoesPorMes,
        doacoesPorStatus,
        mediaDocoesProj,
        pontuacao: pontuacao || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarEstatisticas();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarDashboard navigation={navigation} instituicao={null} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando estatísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavbarDashboard navigation={navigation} instituicao={null} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Estatísticas</Text>
          <Text style={styles.headerSubtitle}>Acompanhe seu desempenho</Text>
        </View>

        {/* Cards de Resumo */}
        <View style={styles.resumoGrid}>
          <View style={styles.resumoCard}>
            <View style={[styles.resumoIcon, { backgroundColor: cores.verdeClaro }]}>
              <Ionicons name="folder" size={28} color={cores.verdeEscuro} />
            </View>
            <Text style={styles.resumoValue}>{stats.totalProjetos}</Text>
            <Text style={styles.resumoLabel}>Total de Projetos</Text>
          </View>

          <View style={styles.resumoCard}>
            <View style={[styles.resumoIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={28} color={cores.verdeEscuro} />
            </View>
            <Text style={styles.resumoValue}>{stats.projetosAtivos}</Text>
            <Text style={styles.resumoLabel}>Projetos Ativos</Text>
          </View>

          <View style={styles.resumoCard}>
            <View style={[styles.resumoIcon, { backgroundColor: cores.laranjaClaro }]}>
              <Ionicons name="gift" size={28} color={cores.laranjaEscuro} />
            </View>
            <Text style={styles.resumoValue}>{stats.totalDoacoes}</Text>
            <Text style={styles.resumoLabel}>Total de Doações</Text>
          </View>

          <View style={styles.resumoCard}>
            <View style={[styles.resumoIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="stats-chart" size={28} color="#7B1FA2" />
            </View>
            <Text style={styles.resumoValue}>{stats.mediaDocoesProj}</Text>
            <Text style={styles.resumoLabel}>Doações/Projeto</Text>
          </View>

          <View style={styles.resumoCard}>
            <View style={[styles.resumoIcon, { backgroundColor: '#FFF9C4' }]}>
              <Ionicons name="star" size={28} color="#F9A825" />
            </View>
            <Text style={styles.resumoValue}>{stats.pontuacao}</Text>
            <Text style={styles.resumoLabel}>Pontuação</Text>
          </View>
        </View>

        {/* Menu de Gráficos */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuGraficosContainer}
          style={styles.menuGraficosScroll}
        >
          <TouchableOpacity
            style={[styles.btnGrafico, graficoSelecionado === 'doacoes' && styles.btnAtivo]}
            onPress={() => setGraficoSelecionado('doacoes')}
          >
            <Ionicons
              name="bar-chart"
              size={20}
              color={graficoSelecionado === 'doacoes' ? '#fff' : cores.verdeEscuro}
            />
            <Text
              style={[
                styles.btnGraficoText,
                graficoSelecionado === 'doacoes' && styles.btnGraficoTextAtivo,
              ]}
            >
              Doações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnGrafico, graficoSelecionado === 'status' && styles.btnAtivo]}
            onPress={() => setGraficoSelecionado('status')}
          >
            <Ionicons
              name="pie-chart"
              size={20}
              color={graficoSelecionado === 'status' ? '#fff' : cores.verdeEscuro}
            />
            <Text
              style={[
                styles.btnGraficoText,
                graficoSelecionado === 'status' && styles.btnGraficoTextAtivo,
              ]}
            >
              Status
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnGrafico, graficoSelecionado === 'projetos' && styles.btnAtivo]}
            onPress={() => setGraficoSelecionado('projetos')}
          >
            <Ionicons
              name="folder-open"
              size={20}
              color={graficoSelecionado === 'projetos' ? '#fff' : cores.verdeEscuro}
            />
            <Text
              style={[
                styles.btnGraficoText,
                graficoSelecionado === 'projetos' && styles.btnGraficoTextAtivo,
              ]}
            >
              Projetos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnGrafico, graficoSelecionado === 'pontuacao' && styles.btnAtivo]}
            onPress={() => setGraficoSelecionado('pontuacao')}
          >
            <Ionicons
              name="star"
              size={20}
              color={graficoSelecionado === 'pontuacao' ? '#fff' : cores.verdeEscuro}
            />
            <Text
              style={[
                styles.btnGraficoText,
                graficoSelecionado === 'pontuacao' && styles.btnGraficoTextAtivo,
              ]}
            >
              Pontuação
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Gráfico de Doações por Mês */}
        {graficoSelecionado === 'doacoes' && (
          <View style={styles.graficoContainer}>
            <Text style={styles.graficoTitle}>Doações por Mês</Text>
            <View style={styles.graficoContent}>
              {Object.entries(stats.doacoesPorMes)
                .sort()
                .reverse()
                .slice(0, 6)
                .map(([mes, count]) => (
                  <View key={mes} style={styles.barraItem}>
                    <View style={styles.barraLabel}>
                      <Text style={styles.barraLabelText}>{mes}</Text>
                    </View>
                    <View style={styles.barraContainer}>
                      <View
                        style={[
                          styles.barra,
                          {
                            width: `${(count / Math.max(...Object.values(stats.doacoesPorMes), 1)) * 100}%`,
                            backgroundColor: cores.verdeEscuro,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barraValue}>{count}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Gráfico de Status */}
        {graficoSelecionado === 'status' && (
          <View style={styles.graficoContainer}>
            <Text style={styles.graficoTitle}>Doações por Status</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.statusCircle,
                    { backgroundColor: cores.laranjaEscuro },
                  ]}
                >
                  <Text style={styles.statusNumber}>
                    {stats.doacoesPorStatus.pendente}
                  </Text>
                </View>
                <Text style={styles.statusName}>Pendente</Text>
              </View>

              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.statusCircle,
                    { backgroundColor: '#1976D2' },
                  ]}
                >
                  <Text style={styles.statusNumber}>
                    {stats.doacoesPorStatus.confirmada}
                  </Text>
                </View>
                <Text style={styles.statusName}>Confirmada</Text>
              </View>

              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.statusCircle,
                    { backgroundColor: cores.verdeEscuro },
                  ]}
                >
                  <Text style={styles.statusNumber}>
                    {stats.doacoesPorStatus.entregue}
                  </Text>
                </View>
                <Text style={styles.statusName}>Entregue</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gráfico de Projetos */}
        {graficoSelecionado === 'projetos' && (
          <View style={styles.graficoContainer}>
            <Text style={styles.graficoTitle}>Desempenho de Projetos</Text>
            <View style={styles.projetosStats}>
              <View style={styles.projetoItem}>
                <View style={styles.projetoCircle}>
                  <Text style={styles.projetoPercent}>
                    {stats.totalProjetos > 0
                      ? Math.round((stats.projetosAtivos / stats.totalProjetos) * 100)
                      : 0}
                    %
                  </Text>
                </View>
                <Text style={styles.projetoLabel}>Taxa de Atividade</Text>
                <Text style={styles.projetoDesc}>
                  {stats.projetosAtivos} de {stats.totalProjetos} projetos
                </Text>
              </View>

              <View style={styles.projetoItem}>
                <View style={[styles.projetoCircle, { backgroundColor: cores.laranjaClaro }]}>
                  <Text style={[styles.projetoPercent, { color: cores.laranjaEscuro }]}>
                    {stats.mediaDocoesProj}
                  </Text>
                </View>
                <Text style={styles.projetoLabel}>Média de Doações</Text>
                <Text style={styles.projetoDesc}>Por projeto</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gráfico de Pontuação */}
        {graficoSelecionado === 'pontuacao' && (
          <View style={styles.graficoContainer}>
            <Text style={styles.graficoTitle}>Pontuação da ONG</Text>
            <View style={styles.pontuacaoContent}>
              <View style={styles.pontuacaoCircle}>
                <Text style={styles.pontuacaoValue}>{stats.pontuacao}</Text>
                <Text style={styles.pontuacaoLabel}>Pontos Totais</Text>
              </View>
              <View style={styles.pontuacaoInfo}>
                <View style={styles.infoBadge}>
                  <Ionicons name="star" size={24} color="#F9A825" />
                  <View>
                    <Text style={styles.infoLabel}>Ranking de Confiabilidade</Text>
                    <Text style={styles.infoValue}>
                      {stats.pontuacao > 500 ? 'Ouro' : stats.pontuacao > 250 ? 'Prata' : 'Bronze'}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoBadge}>
                  <Ionicons name="gift" size={24} color={cores.laranjaEscuro} />
                  <View>
                    <Text style={styles.infoLabel}>Doações Confirmadas</Text>
                    <Text style={styles.infoValue}>{stats.doacoesPorStatus.entregue}</Text>
                  </View>
                </View>
                <View style={styles.infoBadge}>
                  <Ionicons name="folder" size={24} color={cores.verdeEscuro} />
                  <View>
                    <Text style={styles.infoLabel}>Projetos Ativos</Text>
                    <Text style={styles.infoValue}>{stats.projetosAtivos}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
  },
  scrollContent: {
    paddingBottom: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 28,
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#999',
  },
  resumoGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  resumoCard: {
    width: '48%',
    backgroundColor: cores.brancoTexto,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  resumoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumoValue: {
    ...fontes.merriweatherBold,
    fontSize: 24,
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
  resumoLabel: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  menuGraficos: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  btnGrafico: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cores.verdeEscuro,
    gap: 8,
  },
  btnAtivo: {
    backgroundColor: cores.verdeEscuro,
    borderColor: cores.verdeEscuro,
  },
  btnGraficoText: {
    ...fontes.montserratBold,
    fontSize: 13,
    color: cores.verdeEscuro,
  },
  btnGraficoTextAtivo: {
    color: '#fff',
  },
  graficoContainer: {
    marginHorizontal: 20,
    backgroundColor: cores.brancoTexto,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  graficoTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    color: cores.verdeEscuro,
    marginBottom: 16,
  },
  graficoContent: {
    gap: 14,
  },
  barraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barraLabel: {
    width: 60,
  },
  barraLabelText: {
    ...fontes.montserratMedium,
    fontSize: 12,
    color: '#666',
  },
  barraContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barra: {
    height: '100%',
  },
  barraValue: {
    ...fontes.montserratBold,
    fontSize: 13,
    color: cores.verdeEscuro,
    minWidth: 30,
    textAlign: 'right',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    gap: 12,
  },
  statusCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusNumber: {
    ...fontes.merriweatherBold,
    fontSize: 32,
    color: '#fff',
  },
  statusName: {
    ...fontes.montserratMedium,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  projetosStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  projetoItem: {
    flex: 1,
    alignItems: 'center',
  },
  projetoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: cores.verdeClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  projetoPercent: {
    ...fontes.merriweatherBold,
    fontSize: 32,
    color: cores.verdeEscuro,
  },
  projetoLabel: {
    ...fontes.montserratBold,
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  projetoDesc: {
    ...fontes.montserrat,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  menuGraficosScroll: {
    maxHeight: 60,
  },
  menuGraficosContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  pontuacaoContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pontuacaoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF9C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  pontuacaoValue: {
    ...fontes.merriweatherBold,
    fontSize: 48,
    color: '#F9A825',
  },
  pontuacaoLabel: {
    ...fontes.montserratMedium,
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  pontuacaoInfo: {
    width: '100%',
    gap: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  infoLabel: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    ...fontes.montserratBold,
    fontSize: 18,
    color: '#333',
    marginTop: 4,
  },
});
