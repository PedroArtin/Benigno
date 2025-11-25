// screens/instituicao/DashboardInstituicao.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../../components/Global';
import NavbarDashboard from '../../components/navbarDashboard';
import { auth, db } from '../../firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import * as projetosService from '../../services/projetosService';

const { width } = Dimensions.get('window');

export default function DashboardInstituicao({ navigation }) {
  const [instituicao, setInstituicao] = useState(null);
  const [stats, setStats] = useState({
    totalProjetos: 0,
    projetosAtivos: 0,
    totalDoacoes: 0,
    doacoesPendentes: 0,
    doacoesMes: 0,
  });
  const [projetosRecentes, setProjetosRecentes] = useState([]);
  const [doacoesRecentes, setDoacoesRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado em DashboardInstituicao');
        Alert.alert('Sessão expirada', 'Faça login novamente para acessar o dashboard', [
          { text: 'OK', onPress: () => navigation.replace('LoginInstituicao') },
        ]);
        return;
      }

      // Carregar instituição
      const instRef = doc(db, 'instituicoes', user.uid);
      const instDoc = await getDoc(instRef);
      if (instDoc.exists()) {
        setInstituicao(instDoc.data());
      }

      // Carregar projetos
      const projetos = await projetosService.buscarProjetosInstituicao(user.uid);
      const projetosAtivos = projetos.filter(p => p.ativo);
      setProjetosRecentes(projetos.slice(0, 3)); // Últimos 3

      // Carregar doações
      const doacoes = await projetosService.buscarDoacoesInstituicao(user.uid);
      const doacoesPendentes = doacoes.filter(d => d.status === 'pendente');
      
      // Doações deste mês
      const mesAtual = new Date().getMonth();
      const doacoesMes = doacoes.filter(d => {
        const dataDoa = d.dataDoacao?.toDate?.() || new Date(d.dataDoacao);
        return dataDoa.getMonth() === mesAtual;
      });

      setDoacoesRecentes(doacoes.slice(0, 5)); // Últimas 5

      setStats({
        totalProjetos: projetos.length,
        projetosAtivos: projetosAtivos.length,
        totalDoacoes: doacoes.length,
        doacoesPendentes: doacoesPendentes.length,
        doacoesMes: doacoesMes.length,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarDashboard navigation={navigation} instituicao={instituicao} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavbarDashboard navigation={navigation} instituicao={instituicao} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá! 👋</Text>
            <Text style={styles.institutionName}>{instituicao?.nome}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => {/* Notificações */}}
          >
            <Ionicons name="notifications-outline" size={26} color={cores.verdeEscuro} />
            {stats.doacoesPendentes > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.doacoesPendentes}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Cards de Estatísticas Principais */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardLarge]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIcon, { backgroundColor: cores.verdeClaro }]}>
                <Ionicons name="folder" size={28} color={cores.verdeEscuro} />
              </View>
              <View style={styles.statTrend}>
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
                <Text style={styles.trendText}>+12%</Text>
              </View>
            </View>
            <Text style={styles.statNumber}>{stats.projetosAtivos}</Text>
            <Text style={styles.statLabel}>Projetos Ativos</Text>
            <Text style={styles.statSubtext}>
              {stats.totalProjetos} total
            </Text>
          </View>

          <View style={[styles.statCard, styles.statCardLarge]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIcon, { backgroundColor: cores.laranjaClaro }]}>
                <Ionicons name="gift" size={28} color={cores.laranjaEscuro} />
              </View>
              <View style={styles.statTrend}>
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
                <Text style={styles.trendText}>+8%</Text>
              </View>
            </View>
            <Text style={styles.statNumber}>{stats.totalDoacoes}</Text>
            <Text style={styles.statLabel}>Doações Recebidas</Text>
            <Text style={styles.statSubtext}>
              {stats.doacoesMes} este mês
            </Text>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CriarProjeto')}
            >
              <View style={[styles.actionIcon, { backgroundColor: cores.verdeClaro }]}>
                <Ionicons name="add-circle" size={32} color={cores.verdeEscuro} />
              </View>
              <Text style={styles.actionText}>Novo Projeto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MeusProjetos')}
            >
              <View style={[styles.actionIcon, { backgroundColor: cores.laranjaClaro }]}>
                <Ionicons name="folder-open" size={32} color={cores.laranjaEscuro} />
              </View>
              <Text style={styles.actionText}>Meus Projetos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('DoacoesRecebidas')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="gift" size={32} color="#1976D2" />
              </View>
              <Text style={styles.actionText}>Ver Doações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('EstatisticasInstituicao')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="bar-chart" size={32} color="#7B1FA2" />
              </View>
              <Text style={styles.actionText}>Relatórios</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Doações Pendentes */}
        {stats.doacoesPendentes > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚠️ Doações Pendentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('DoacoesRecebidas')}>
                <Text style={styles.seeAllBtn}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.alertCard}>
              <Ionicons name="time" size={40} color={cores.laranjaEscuro} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {stats.doacoesPendentes} doação(ões) aguardando confirmação
                </Text>
                <Text style={styles.alertText}>
                  Confira e confirme as entregas recebidas
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Projetos Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projetos Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MeusProjetos')}>
              <Text style={styles.seeAllBtn}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {projetosRecentes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={60} color={cores.placeholder} />
              <Text style={styles.emptyText}>Nenhum projeto criado</Text>
            </View>
          ) : (
            projetosRecentes.map((projeto) => (
              <View key={projeto.id} style={styles.projetoMini}>
                <View style={styles.projetoMiniLeft}>
                  <View style={[styles.projetoIcon, { backgroundColor: cores.verdeClaro }]}>
                    <Ionicons name="folder" size={24} color={cores.verdeEscuro} />
                  </View>
                  <View style={styles.projetoInfo}>
                    <Text style={styles.projetoTitulo} numberOfLines={1}>
                      {projeto.titulo}
                    </Text>
                    <Text style={styles.projetoMeta}>
                      {projeto.doacoesRecebidas || 0} doações recebidas
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: projeto.ativo ? cores.verdeClaro : '#E0E0E0' }]}>
                  <Text style={[styles.statusText, { color: projeto.ativo ? cores.verdeEscuro : '#999' }]}>
                    {projeto.ativo ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

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
    paddingVertical: 20,
  },
  greeting: {
    ...fontes.montserrat,
    fontSize: 16,
    color: '#666',
  },
  institutionName: {
    ...fontes.merriweatherBold,
    fontSize: 24,
    color: cores.verdeEscuro,
    marginTop: 4,
  },
  notificationBtn: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: cores.laranjaEscuro,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...fontes.montserratBold,
    fontSize: 10,
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardLarge: {
    flex: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
  },
  trendText: {
    ...fontes.montserratBold,
    fontSize: 11,
    color: '#4CAF50',
    marginLeft: 2,
  },
  statNumber: {
    ...fontes.merriweatherBold,
    fontSize: 32,
    marginBottom: 4,
  },
  statLabel: {
    ...fontes.montserratMedium,
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statSubtext: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    ...fontes.montserratBold,
    fontSize: 18,
    color: cores.verdeEscuro,
  },
  seeAllBtn: {
    ...fontes.montserratMedium,
    fontSize: 14,
    color: cores.laranjaEscuro,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: cores.brancoTexto,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    ...fontes.montserratMedium,
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: cores.laranjaClaro,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  alertContent: {
    marginLeft: 15,
    flex: 1,
  },
  alertTitle: {
    ...fontes.montserratBold,
    fontSize: 15,
    color: cores.laranjaEscuro,
    marginBottom: 4,
  },
  alertText: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...fontes.montserratMedium,
    fontSize: 16,
    color: cores.placeholder,
    marginTop: 15,
  },
  projetoMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: cores.brancoTexto,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  projetoMiniLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projetoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projetoInfo: {
    flex: 1,
  },
  projetoTitulo: {
    ...fontes.montserratBold,
    fontSize: 14,
    marginBottom: 4,
  },
  projetoMeta: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...fontes.montserratMedium,
    fontSize: 11,
  },
});