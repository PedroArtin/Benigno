// screens/Enderecos.js - VERSÃO CORRETA
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { auth } from '../firebase/firebaseconfig';
import {
  buscarEnderecos,
  adicionarEndereco,
  atualizarEndereco,
  deletarEndereco,
} from '../services/userService';

export default function Enderecos({ navigation }) {
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    tipo: 'casa',
    apelido: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    principal: false,
  });

  useEffect(() => {
    carregarEnderecos();
  }, []);

  const carregarEnderecos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado ao carregar endereços');
        Alert.alert(
          'Sessão expirada',
          'Faça login novamente para gerenciar seus endereços',
          [
            { text: 'OK', onPress: () => navigation.replace('Login') },
          ]
        );
        setEnderecos([]);
        return;
      }

      const dados = await buscarEnderecos(user.uid);
      setEnderecos(dados);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      Alert.alert('Erro', 'Não foi possível carregar os endereços');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (endereco = null) => {
    if (endereco) {
      setEditando(endereco);
      setNovoEndereco(endereco);
    } else {
      setEditando(null);
      setNovoEndereco({
        tipo: 'casa',
        apelido: '',
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        pais: 'Brasil',
        principal: false,
      });
    }
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setEditando(null);
  };

  const handleSalvar = async () => {
    if (!novoEndereco.cep || !novoEndereco.rua || !novoEndereco.numero) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;

      if (!user) {
        console.warn('Usuário não autenticado ao salvar endereço');
        Alert.alert('Sessão expirada', 'Faça login novamente para salvar endereços', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
        return;
      }

      if (editando) {
        await atualizarEndereco(editando.id, novoEndereco);
        Alert.alert('Sucesso', 'Endereço atualizado com sucesso');
      } else {
        await adicionarEndereco(user.uid, novoEndereco);
        Alert.alert('Sucesso', 'Endereço adicionado com sucesso');
      }

      await carregarEnderecos();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      Alert.alert('Erro', 'Não foi possível salvar o endereço');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = (endereco) => {
    Alert.alert(
      'Excluir endereço',
      `Deseja realmente excluir "${endereco.apelido}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarEndereco(endereco.id);
              setEnderecos(enderecos.filter((e) => e.id !== endereco.id));
              Alert.alert('Sucesso', 'Endereço excluído com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o endereço');
            }
          },
        },
      ]
    );
  };

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setNovoEndereco({
            ...novoEndereco,
            cep: cep,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const renderEndereco = ({ item }) => (
    <View style={styles.enderecoCard}>
      <View style={styles.enderecoHeader}>
        <View style={styles.enderecoTipo}>
          <Ionicons
            name={
              item.tipo === 'casa'
                ? 'home'
                : item.tipo === 'trabalho'
                ? 'business'
                : 'location'
            }
            size={24}
            color={cores.verdeEscuro}
          />
          <Text style={styles.enderecoApelido}>{item.apelido}</Text>
        </View>
        {item.principal && (
          <View style={styles.principalBadge}>
            <Text style={styles.principalText}>Principal</Text>
          </View>
        )}
      </View>

      <Text style={styles.enderecoTexto}>
        {item.rua}, {item.numero}
        {item.complemento ? `, ${item.complemento}` : ''}
      </Text>
      <Text style={styles.enderecoTexto}>
        {item.bairro} - {item.cidade}/{item.estado}
      </Text>
      <Text style={styles.enderecoTexto}>CEP: {item.cep}</Text>

      <View style={styles.enderecoActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => abrirModal(item)}
        >
          <Ionicons name="create-outline" size={20} color={cores.verdeEscuro} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleExcluir(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#E53935" />
          <Text style={[styles.actionButtonText, { color: '#E53935' }]}>
            Excluir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Endereços</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.verdeEscuro} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Endereços</Text>
        <TouchableOpacity onPress={() => abrirModal()}>
          <Ionicons name="add-circle" size={28} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={enderecos}
        renderItem={renderEndereco}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color="#CCC" />
            <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
            <Text style={styles.emptyText}>
              Adicione um endereço para facilitar suas doações
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={fecharModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={fecharModal}>
              <Ionicons name="close" size={28} color={cores.verdeEscuro} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editando ? 'Editar Endereço' : 'Novo Endereço'}
            </Text>
            <TouchableOpacity onPress={handleSalvar} disabled={salvando}>
              <Text style={styles.salvarText}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de endereço</Text>
                <View style={styles.tipoButtons}>
                  {['casa', 'trabalho', 'outro'].map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      style={[
                        styles.tipoButton,
                        novoEndereco.tipo === tipo && styles.tipoButtonActive,
                      ]}
                      onPress={() =>
                        setNovoEndereco({ ...novoEndereco, tipo })
                      }
                    >
                      <Text
                        style={[
                          styles.tipoButtonText,
                          novoEndereco.tipo === tipo &&
                            styles.tipoButtonTextActive,
                        ]}
                      >
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apelido *</Text>
                <TextInput
                  style={styles.input}
                  value={novoEndereco.apelido}
                  onChangeText={(text) =>
                    setNovoEndereco({ ...novoEndereco, apelido: text })
                  }
                  placeholder="Ex: Minha casa, Escritório..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CEP *</Text>
                <TextInput
                  style={styles.input}
                  value={novoEndereco.cep}
                  onChangeText={(text) => {
                    setNovoEndereco({ ...novoEndereco, cep: text });
                    buscarCEP(text);
                  }}
                  placeholder="00000-000"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={9}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rua *</Text>
                <TextInput
                  style={styles.input}
                  value={novoEndereco.rua}
                  onChangeText={(text) =>
                    setNovoEndereco({ ...novoEndereco, rua: text })
                  }
                  placeholder="Nome da rua"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Número *</Text>
                  <TextInput
                    style={styles.input}
                    value={novoEndereco.numero}
                    onChangeText={(text) =>
                      setNovoEndereco({ ...novoEndereco, numero: text })
                    }
                    placeholder="123"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    value={novoEndereco.complemento}
                    onChangeText={(text) =>
                      setNovoEndereco({ ...novoEndereco, complemento: text })
                    }
                    placeholder="Apto, Bloco..."
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  value={novoEndereco.bairro}
                  onChangeText={(text) =>
                    setNovoEndereco({ ...novoEndereco, bairro: text })
                  }
                  placeholder="Bairro"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
                  <Text style={styles.label}>Cidade</Text>
                  <TextInput
                    style={styles.input}
                    value={novoEndereco.cidade}
                    onChangeText={(text) =>
                      setNovoEndereco({ ...novoEndereco, cidade: text })
                    }
                    placeholder="Cidade"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Estado</Text>
                  <TextInput
                    style={styles.input}
                    value={novoEndereco.estado}
                    onChangeText={(text) =>
                      setNovoEndereco({ ...novoEndereco, estado: text })
                    }
                    placeholder="SP"
                    placeholderTextColor="#999"
                    maxLength={2}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.principalCheckbox}
                onPress={() =>
                  setNovoEndereco({
                    ...novoEndereco,
                    principal: !novoEndereco.principal,
                  })
                }
              >
                <Ionicons
                  name={
                    novoEndereco.principal
                      ? 'checkbox'
                      : 'square-outline'
                  }
                  size={24}
                  color={cores.verdeEscuro}
                />
                <Text style={styles.checkboxText}>
                  Definir como endereço principal
                </Text>
              </TouchableOpacity>
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
  listContainer: {
    padding: 20,
  },
  enderecoCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enderecoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  enderecoTipo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enderecoApelido: {
    ...fontes.merriweatherBold,
    fontSize: 16,
    marginLeft: 10,
  },
  principalBadge: {
    backgroundColor: cores.verdeClaro,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  principalText: {
    ...fontes.montserratBold,
    fontSize: 11,
    color: cores.verdeEscuro,
  },
  enderecoTexto: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  enderecoActions: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionButtonText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: cores.verdeEscuro,
    marginLeft: 5,
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
  modalContainer: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: cores.brancoTexto,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
  },
  salvarText: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.verdeEscuro,
  },
  modalContent: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...fontes.montserratBold,
    fontSize: 14,
    marginBottom: 8,
    color: cores.verdeEscuro,
  },
  input: {
    ...fontes.montserrat,
    backgroundColor: cores.brancoTexto,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
  },
  tipoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: cores.brancoTexto,
  },
  tipoButtonActive: {
    backgroundColor: cores.verdeEscuro,
    borderColor: cores.verdeEscuro,
  },
  tipoButtonText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#666',
  },
  tipoButtonTextActive: {
    color: cores.brancoTexto,
  },
  principalCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxText: {
    ...fontes.montserrat,
    fontSize: 14,
    marginLeft: 10,
  },
});