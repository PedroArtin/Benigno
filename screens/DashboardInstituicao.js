// screens/DashboardInstituicao.js - ATUALIZADO COM LISTA DE DOAÇÕES
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
import { fontes, cores } from '../components/Global';
import { auth, db } from '../firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import * as projetosService from '../services/projetosService';
import * as doacoesService from '../services/doacoesService';
import NavbarDashboard from '../components/navbarDashboard';
import ListaDoacoes from './ListaDoacoes';
import ListaProjetos from './ListaProjetos';

const { width } = Dimensions.get('window');

export default function DashboardInstituicao({ navigation }) {
  const [abaAtiva, setAbaAtiva] = useState('visao_geral'); // 'visao_geral', 'doacoes', 'projetos'
  const [instituicao, setInstituicao] = useState(null);
  const [stats, setStats] = useState({
    totalProjetos: 0,
    projetosAtivos: 0,
    totalDoacoes: 0,
    doacoesPendentes: 0,
    doacoesAguardando: 0,
    doacoesMes: 0,
  });
  const [projetosRecentes, setProjetosRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace('LoginInstituicao');
        return;
      }

      // Carregar dados da instituição
      const instRef = doc(db, 'instituicoes', user.uid);
      const instDoc = await getDoc(instRef);
      
      if (instDoc.exists()) {
        const instData = instDoc.data();
        setInstituicao(instData);
        console.log('✅ Dados da instituição carregados:', instData.nome);
      } else {
        console.log('⚠️ Documento da instituição não encontrado');
        setInstituicao({
          nome: 'Instituição',
          email: user.email,
        });
      }

      // Carregar projetos
      const projetos = await projetosService.buscarProjetosInstituicao(user.uid);
      const projetosAtivos = projetos.filter(p => p.ativo);
      setProjetosRecentes(projetos.slice(0, 3));

      // Carregar estatísticas de doações
      const statsDoacao = await doacoesService.buscarEstatisticasDoacoes(user.uid);

      setStats({
        totalProjetos: projetos.length,
        projetosAtivos: projetosAtivos.length,
        totalDoacoes: statsDoacao.total,
        doacoesPendentes: statsDoacao.pendentes,
        doacoesAguardando: statsDoacao.aguardando,
        doacoesMes: statsDoacao.mesAtual,
      });

      console.log('📊 Estatísticas carregadas:', stats);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
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
      {/* Navbar Superior */}
      <NavbarDashboard navigation={navigation} instituicao={instituicao} />
      
      {/* Abas */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'visao_geral' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('visao_geral')}
        >
          <Ionicons 
            name="grid" 
            size={20} 
            color={abaAtiva === 'visao_geral' ? cores.verdeEscuro : '#666'} 
          />
          <Text style={[
            styles.tabText,
            abaAtiva === 'visao_geral' && styles.tabTextAtiva
          ]}>
            Visão Geral
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'doacoes' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('doacoes')}
        >
          <Ionicons 
            name="gift" 
            size={20} 
            color={abaAtiva === 'doacoes' ? cores.verdeEscuro : '#666'} 
          />
          <Text style={[
            styles.tabText,
            abaAtiva === 'doacoes' && styles.tabTextAtiva
          ]}>
            Doações
          </Text>
          {(stats.doacoesPendentes + stats.doacoesAguardando) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {stats.doacoesPendentes + stats.doacoesAguardando}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'projetos' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('projetos')}
        >
          <Ionicons 
            name="folder" 
            size={20} 
            color={abaAtiva === 'projetos' ? cores.verdeEscuro : '#666'} 
          />
          <Text style={[
            styles.tabText,
            abaAtiva === 'projetos' && styles.tabTextAtiva
          ]}>
            Projetos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo baseado na aba ativa */}
      {abaAtiva === 'visao_geral' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Saudação */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>Olá! 👋</Text>
            <Text style={styles.institutionName}>{instituicao?.nome || 'Instituição'}</Text>
            <Text style={styles.greetingSubtext}>
              Aqui está um resumo da sua instituição
            </Text>
          </View>

          {/* Cards de Estatísticas Principais */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardLarge]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIcon, { backgroundColor: cores.verdeClaro }]}>
                  <Ionicons name="folder" size={28} color={cores.verdeEscuro} />
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
                onPress={() => setAbaAtiva('projetos')}
              >
                <View style={[styles.actionIcon, { backgroundColor: cores.laranjaClaro }]}>
                  <Ionicons name="folder-open" size={32} color={cores.laranjaEscuro} />
                </View>
                <Text style={styles.actionText}>Meus Projetos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setAbaAtiva('doacoes')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="gift" size={32} color="#1976D2" />
                </View>
                <Text style={styles.actionText}>Ver Doações</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {/* TODO: Tela de relatórios */}}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="bar-chart" size={32} color="#7B1FA2" />
                </View>
                <Text style={styles.actionText}>Relatórios</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Alerta de Doações Pendentes */}
          {(stats.doacoesPendentes + stats.doacoesAguardando) > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⚠️ Atenção</Text>
              </View>
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => setAbaAtiva('doacoes')}
              >
                <Ionicons name="time" size={40} color={cores.laranjaEscuro} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>
                    {stats.doacoesPendentes + stats.doacoesAguardando} doação(ões) precisam de atenção
                  </Text>
                  <Text style={styles.alertText}>
                    {stats.doacoesPendentes > 0 && `${stats.doacoesPendentes} para coletar • `}
                    {stats.doacoesAguardando > 0 && `${stats.doacoesAguardando} para confirmar`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={cores.laranjaEscuro} />
              </TouchableOpacity>
            </View>
          )}

          {/* Projetos Recentes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Projetos Recentes</Text>
              <TouchableOpacity onPress={() => setAbaAtiva('projetos')}>
                <Text style={styles.seeAllBtn}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {projetosRecentes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={60} color={cores.placeholder} />
                <Text style={styles.emptyText}>Nenhum projeto criado</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('CriarProjeto')}
                >
                  <Text style={styles.emptyButtonText}>Criar Primeiro Projeto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              projetosRecentes.map((projeto) => (
                <TouchableOpacity
                  key={projeto.id}
                  style={styles.projetoMini}
                  onPress={() => {/* TODO: Navegar para editar projeto */}}
                >
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
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* Aba de Doações */}
      {abaAtiva === 'doacoes' && auth.currentUser && (
        <ListaDoacoes instituicaoId={auth.currentUser.uid} />
      )}

      {/* Aba de Projetos */}
      {abaAtiva === 'projetos' && (
        <ListaProjetos instituicaoId={auth.currentUser.uid} />
      )}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: cores.brancoTexto,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    position: 'relative',
  },
  tabAtiva: {
    borderBottomColor: cores.verdeEscuro,
  },
  tabText: {
    ...fontes.montserratMedium,
    fontSize: 13,
    color: '#666',
  },
  tabTextAtiva: {
    ...fontes.montserratBold,
    color: cores.verdeEscuro,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: cores.laranjaEscuro,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...fontes.montserratBold,
    fontSize: 10,
    color: '#fff',
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
  },
  greeting: {
    ...fontes.montserrat,
    fontSize: 16,
    color: '#666',
  },
  institutionName: {
    ...fontes.merriweatherBold,
    fontSize: 28,
    color: cores.verdeEscuro,
    marginTop: 4,
    marginBottom: 8,
  },
  greetingSubtext: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: cores.verdeEscuro,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 14,
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
  content: {
    flex: 1,
    padding: 20,
  },
  placeholderText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});