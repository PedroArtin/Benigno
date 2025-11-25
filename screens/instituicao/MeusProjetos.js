// screens/instituicao/MeusProjetos.js - TELA COM OPERAÇÕES CRUD
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
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../../components/Global';
import NavbarDashboard from '../../components/navbarDashboard';
import { auth } from '../../firebase/firebaseconfig';
import * as projetosService from '../../services/projetosService';

export default function MeusProjetos({ navigation }) {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [modalEditando, setModalEditando] = useState(false);
  const [dadosEdicao, setDadosEdicao] = useState({
    titulo: '',
    descricao: '',
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarProjetos();
    
    const unsubscribe = navigation.addListener('focus', () => {
      carregarProjetos();
    });
    
    return unsubscribe;
  }, [navigation]);

  const carregarProjetos = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado em MeusProjetos');
        Alert.alert('Sessão expirada', 'Faça login novamente para ver seus projetos', [
          { text: 'OK', onPress: () => navigation.replace('LoginInstituicao') },
        ]);
        setLoading(false);
        return;
      }

      const projetosData = await projetosService.buscarProjetosInstituicao(user.uid);
      setProjetos(projetosData);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus projetos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarProjetos();
  };

  const abrirModalEdicao = (projeto) => {
    setProjetoSelecionado(projeto);
    setDadosEdicao({
      titulo: projeto.titulo,
      descricao: projeto.descricao,
    });
    setModalEditando(true);
  };

  const salvarEdicao = async () => {
    if (!dadosEdicao.titulo.trim()) {
      Alert.alert('Erro', 'O título do projeto é obrigatório');
      return;
    }

    setSalvando(true);
    try {
      await projetosService.atualizarProjeto(projetoSelecionado.id, {
        titulo: dadosEdicao.titulo,
        descricao: dadosEdicao.descricao,
      });

      Alert.alert('Sucesso! 🎉', 'Projeto atualizado com sucesso');
      setModalEditando(false);
      carregarProjetos();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o projeto');
    } finally {
      setSalvando(false);
    }
  };

  const alternarStatus = async (projeto) => {
    Alert.alert(
      projeto.ativo ? 'Desativar Projeto?' : 'Ativar Projeto?',
      `Tem certeza que deseja ${projeto.ativo ? 'desativar' : 'ativar'} "${projeto.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              await projetosService.atualizarProjeto(projeto.id, {
                ativo: !projeto.ativo,
              });

              Alert.alert(
                'Sucesso! 🎉',
                `Projeto ${!projeto.ativo ? 'ativado' : 'desativado'} com sucesso`
              );
              carregarProjetos();
            } catch (error) {
              console.error('Erro ao alterar status:', error);
              Alert.alert('Erro', 'Não foi possível alterar o status');
            }
          },
        },
      ]
    );
  };

  const deletarProjeto = async (projeto) => {
    Alert.alert(
      '⚠️ Deletar Projeto?',
      `Esta ação é irreversível! Você realmente quer deletar "${projeto.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await projetosService.deletarProjeto(projeto.id);

              Alert.alert('Sucesso! 🎉', 'Projeto deletado com sucesso');
              carregarProjetos();
            } catch (error) {
              console.error('Erro ao deletar:', error);
              Alert.alert('Erro', 'Não foi possível deletar o projeto');
            }
          },
        },
      ]
    );
  };

  const renderProjeto = ({ item }) => (
    <View style={styles.projetoCard}>
      {/* Header com Status */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={item.ativo ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={item.ativo ? cores.verdeEscuro : '#999'}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.projetoTitulo} numberOfLines={2}>
              {item.titulo}
            </Text>
            <Text style={styles.projetoCategoria}>
              {item.categoria || 'Sem categoria'}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.ativo ? cores.verdeClaro : '#F5F5F5',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: item.ativo ? cores.verdeEscuro : '#999',
              },
            ]}
          >
            {item.ativo ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="gift" size={16} color={cores.laranjaEscuro} />
          <Text style={styles.statText}>
            {item.doacoesRecebidas || 0} doações
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color={cores.verdeEscuro} />
          <Text style={styles.statText}>
            {item.contribuicoes || 0} contribuintes
          </Text>
        </View>
      </View>

      {/* Descrição */}
      {item.descricao && (
        <Text style={styles.projetoDescricao} numberOfLines={2}>
          {item.descricao}
        </Text>
      )}

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => abrirModalEdicao(item)}
        >
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.actionBtnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            item.ativo ? styles.desativarBtn : styles.ativarBtn,
          ]}
          onPress={() => alternarStatus(item)}
        >
          <Ionicons
            name={item.ativo ? 'close-circle' : 'checkmark-circle'}
            size={16}
            color="#fff"
          />
          <Text style={styles.actionBtnText}>
            {item.ativo ? 'Desativar' : 'Ativar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => deletarProjeto(item)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.actionBtnText}>Deletar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={80} color={cores.placeholder} />
      <Text style={styles.emptyTitle}>Nenhum Projeto Criado</Text>
      <Text style={styles.emptyText}>
        Comece criando seu primeiro projeto
      </Text>
      <TouchableOpacity
        style={styles.criarBtn}
        onPress={() => navigation.navigate('CriarProjeto')}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.criarBtnText}>Criar Projeto</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.verdeEscuro} />
          <Text style={styles.loadingText}>Carregando projetos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavbarDashboard navigation={navigation} instituicao={null} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Projetos</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CriarProjeto')}
          style={styles.addBtn}
        >
          <Ionicons name="add-circle" size={28} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </View>

      {/* Lista de Projetos */}
      <FlatList
        data={projetos}
        renderItem={renderProjeto}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal de Edição */}
      <Modal
        visible={modalEditando}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEditando(false)}
      >
        <SafeAreaView style={styles.modal}>
          <ScrollView style={styles.modalContent}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalEditando(false)}
              >
                <Ionicons name="close" size={28} color={cores.verdeEscuro} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Editar Projeto</Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Formulário */}
            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Título do Projeto *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Projeto de Educação"
                  value={dadosEdicao.titulo}
                  onChangeText={(text) =>
                    setDadosEdicao({ ...dadosEdicao, titulo: text })
                  }
                  editable={!salvando}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Descreva seu projeto..."
                  value={dadosEdicao.descricao}
                  onChangeText={(text) =>
                    setDadosEdicao({ ...dadosEdicao, descricao: text })
                  }
                  multiline
                  numberOfLines={4}
                  editable={!salvando}
                />
              </View>

              {/* Botões */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalEditando(false)}
                  disabled={salvando}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.salvarBtn]}
                  onPress={salvarEdicao}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.salvarBtnText}>Salvar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    marginTop: 10,
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
    fontSize: 20,
    color: cores.verdeEscuro,
  },
  addBtn: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  projetoCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
  },
  projetoTitulo: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
  projetoCategoria: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...fontes.montserratBold,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  projetoDescricao: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    minWidth: '30%',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: cores.verdeEscuro,
  },
  ativarBtn: {
    backgroundColor: '#4CAF50',
  },
  desativarBtn: {
    backgroundColor: '#FF9800',
  },
  deleteBtn: {
    backgroundColor: '#D32F2F',
  },
  actionBtnText: {
    ...fontes.montserratBold,
    fontSize: 12,
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    color: cores.verdeEscuro,
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  criarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.verdeEscuro,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  criarBtnText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#fff',
  },
  modal: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    color: cores.verdeEscuro,
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: cores.verdeEscuro,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fontes.montserrat.fontFamily,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  cancelBtn: {
    backgroundColor: '#E0E0E0',
  },
  cancelBtnText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#666',
  },
  salvarBtn: {
    backgroundColor: cores.verdeEscuro,
  },
  salvarBtnText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#fff',
  },
});
