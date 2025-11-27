// components/NotificacoesBadge.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from './Global';
import { auth } from '../firebase/firebaseconfig';
import {
  buscarNotificacoesUsuario,
  marcarNotificacaoComoLida,
  deletarNotificacao,
  contarNotificacoesNaoLidas,
} from '../services/notificacoesService';

export default function NotificacoesBadge({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarNotificacoes();
    });

    // Atualizar notificações a cada 5 segundos
    const interval = setInterval(carregarNotificacoes, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigation]);

  const carregarNotificacoes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const notifs = await buscarNotificacoesUsuario(user.uid);
      setNotificacoes(notifs);

      const totalNaoLidas = await contarNotificacoesNaoLidas(user.uid);
      setNaoLidas(totalNaoLidas);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const handleMarcarComoLida = async (notificacaoId) => {
    try {
      await marcarNotificacaoComoLida(notificacaoId);
      carregarNotificacoes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar como lida');
    }
  };

  const handleDeletar = async (notificacaoId) => {
    try {
      await deletarNotificacao(notificacaoId);
      carregarNotificacoes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível deletar a notificação');
    }
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate?.() || new Date(timestamp);
    const agora = new Date();
    const diff = Math.floor((agora - date) / 1000);

    if (diff < 60) return 'Agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  const renderNotificacao = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificacaoCard,
        !item.lida && styles.notificacaoNaoLida,
      ]}
      onPress={() => handleMarcarComoLida(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificacaoHeader}>
        <Ionicons
          name={
            item.tipoNotificacao === 'ong_buscou_confirmacao'
              ? 'checkmark-circle'
              : 'gift'
          }
          size={24}
          color={cores.verdeEscuro}
        />
        <View style={styles.notificacaoTexto}>
          <Text style={styles.notificacaoTitulo} numberOfLines={2}>
            {item.titulo}
          </Text>
          <Text style={styles.notificacaoDescricao} numberOfLines={2}>
            {item.descricao}
          </Text>
          <Text style={styles.notificacaoData}>
            {formatarData(item.dataCriacao)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeletar(item.id)}
          style={styles.deleteBtn}
        >
          <Ionicons name="close-circle" size={20} color={cores.cinzaClaro} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Botão de notificações */}
      <TouchableOpacity
        style={styles.badge}
        onPress={() => {
          setModalVisible(true);
          carregarNotificacoes();
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications" size={24} color={cores.brancoTexto} />
        {naoLidas > 0 && (
          <View style={styles.badgeNumber}>
            <Text style={styles.badgeNumberText}>
              {naoLidas > 9 ? '9+' : naoLidas}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal de notificações */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header do modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notificações</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={28} color={cores.verdeEscuro} />
            </TouchableOpacity>
          </View>

          {/* Lista de notificações */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={cores.verdeEscuro} />
            </View>
          ) : notificacoes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off"
                size={64}
                color={cores.cinzaClaro}
              />
              <Text style={styles.emptyText}>Nenhuma notificação</Text>
            </View>
          ) : (
            <FlatList
              data={notificacoes}
              renderItem={renderNotificacao}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'relative',
    padding: 10,
  },
  badgeNumber: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: cores.vermelho,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: cores.cinzaClaro,
  },
  modalTitle: {
    ...fontes.merriweatherBold,
    fontSize: 24,
    color: cores.preto,
  },
  closeBtn: {
    padding: 5,
  },
  listContainer: {
    padding: 15,
  },
  notificacaoCard: {
    backgroundColor: cores.fundoBranco,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: cores.cinzaClaro,
    elevation: 2,
  },
  notificacaoNaoLida: {
    backgroundColor: cores.verdeClaro,
    borderLeftColor: cores.verdeEscuro,
  },
  notificacaoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificacaoTexto: {
    flex: 1,
    marginLeft: 12,
  },
  notificacaoTitulo: {
    ...fontes.montserrat,
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.preto,
    marginBottom: 4,
  },
  notificacaoDescricao: {
    ...fontes.montserrat,
    fontSize: 12,
    color: cores.cinzaMedio,
    marginBottom: 4,
  },
  notificacaoData: {
    ...fontes.montserrat,
    fontSize: 11,
    color: cores.cinzaClaro,
  },
  deleteBtn: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...fontes.montserrat,
    fontSize: 16,
    color: cores.cinzaMedio,
    marginTop: 10,
  },
});
