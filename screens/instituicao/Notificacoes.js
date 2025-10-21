// screens/instituicao/Notificacoes.js
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

export default function Notificacoes({ navigation }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // todas, nao-lidas, lidas

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Buscar doações recentes para criar notificações
      const doacoes = await projetosService.buscarDoacoesInstituicao(user.uid);
      
      // Criar notificações baseadas nas doações
      const notifs = doacoes.map((doacao) => ({
        id: doacao.id,
        tipo: 'doacao',
        titulo: 'Nova Doação Recebida! 🎁',
        mensagem: `${doacao.doadorNome} quer doar: ${doacao.items}`,
        data: doacao.dataDoacao?.toDate?.() || new Date(doacao.dataDoacao),
        lida: false,
        doacao,
      }));

      // Ordenar por data (mais recente primeiro)
      notifs.sort((a, b) => b.data - a.data);

      setNotificacoes(notifs);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarNotificacoes();
  };

  const handleMarcarComoLida = (notifId) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, lida: true } : n))
    );
  };

  const handleMarcarTodasComoLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const handleAbrirNotificacao = (notif) => {
    handleMarcarComoLida(notif.id);
    if (notif.tipo === 'doacao') {
      navigation.navigate('DoacoesRecebidas');
    }
  };

  const notificacoesFiltradas = notificacoes.filter((n) => {
    if (filtro === 'nao-lidas') return !n.lida;
    if (filtro === 'lidas') return n.lida;
    return true;
  });

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const getTempoDecorrido = (data) => {
    const agora = new Date();
    const diff = agora - data;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `${minutos}m atrás`;
    if (horas < 24) return `${horas}h atrás`;
    if (dias < 7) return `${dias}d atrás`;
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getIconeNotificacao = (tipo) => {
    const icones = {
      doacao: 'gift',
      projeto: 'folder',
      sistema: 'information-circle',
    };
    return icones[tipo] || 'notifications';
  };

  const getCorNotificacao = (tipo) => {
    const coresMap = {
      doacao: cores.laranjaEscuro,
      projeto: cores.verdeEscuro,
      sistema: '#1976D2',
    };
    return coresMap[tipo] || cores.verdeClaro;
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
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
          </TouchableOpacity>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Notificações</Text>
            {naoLidas > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{naoLidas}</Text>
              </View>
            )}
          </View>
        </View>
        {naoLidas > 0 && (
          <TouchableOpacity onPress={handleMarcarTodasComoLidas}>
            <Text style={styles.marcarTodasBtn}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'todas' && styles.filtroAtivo]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filtroText, filtro === 'todas' && styles.filtroTextoAtivo]}>
            Todas ({notificacoes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'nao-lidas' && styles.filtroAtivo]}
          onPress={() => setFiltro('nao-lidas')}
        >
          <Text style={[styles.filtroText, filtro === 'nao-lidas' && styles.filtroTextoAtivo]}>
            Não lidas ({naoLidas})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'lidas' && styles.filtroAtivo]}
          onPress={() => setFiltro('lidas')}
        >
          <Text style={[styles.filtroText, filtro === 'lidas' && styles.filtroTextoAtivo]}>
            Lidas ({notificacoes.length - naoLidas})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Notificações */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {notificacoesFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={80} color={cores.placeholder} />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyText}>
              {filtro === 'todas'
                ? 'Você não tem notificações'
                : filtro === 'nao-lidas'
                ? 'Todas as notificações foram lidas'
                : 'Nenhuma notificação lida'}
            </Text>
          </View>
        ) : (
          notificacoesFiltradas.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notifCard,
                !notif.lida && styles.notifCardNaoLida,
              ]}
              onPress={() => handleAbrirNotificacao(notif)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.notifIcon,
                  { backgroundColor: getCorNotificacao(notif.tipo) + '20' },
                ]}
              >
                <Ionicons
                  name={getIconeNotificacao(notif.tipo)}
                  size={24}
                  color={getCorNotificacao(notif.tipo)}
                />
              </View>

              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={styles.notifTitulo}>{notif.titulo}</Text>
                  {!notif.lida && <View style={styles.dotNaoLida} />}
                </View>
                <Text style={styles.notifMensagem} numberOfLines={2}>
                  {notif.mensagem}
                </Text>
                <Text style={styles.notifTempo}>{getTempoDecorrido(notif.data)}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTexts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
  },
  headerBadge: {
    backgroundColor: cores.laranjaEscuro,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerBadgeText: {
    ...fontes.montserratBold,
    fontSize: 10,
    color: '#fff',
  },
  marcarTodasBtn: {
    ...fontes.montserratMedium,
    fontSize: 12,
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
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.brancoTexto,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  notifCardNaoLida: {
    backgroundColor: cores.verdeClaro,
    borderLeftWidth: 4,
    borderLeftColor: cores.verdeEscuro,
  },
  notifIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitulo: {
    ...fontes.montserratBold,
    fontSize: 15,
    flex: 1,
  },
  dotNaoLida: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: cores.laranjaEscuro,
    marginLeft: 8,
  },
  notifMensagem: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTempo: {
    ...fontes.montserrat,
    fontSize: 11,
    color: '#999',
  },
});