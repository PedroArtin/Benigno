// screens/EditarPerfil.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { auth } from '../firebase/firebaseconfig';
import { updateProfile } from 'firebase/auth';
import { buscarPerfilUsuario, atualizarPerfil } from '../services/userService';

export default function EditarPerfil({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    telefone: '',
    bio: '',
    dataNascimento: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfil = await buscarPerfilUsuario(user.uid);
        setDados({
          nome: perfil?.nome || user.displayName || '',
          email: user.email || '',
          telefone: perfil?.telefone || '',
          bio: perfil?.bio || '',
          dataNascimento: perfil?.dataNascimento || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const formatarTelefone = (text) => {
    // Remove tudo que não é número
    const numeros = text.replace(/\D/g, '');
    
    // Formata conforme o tamanho
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
  };

  const formatarData = (text) => {
    // Remove tudo que não é número
    const numeros = text.replace(/\D/g, '');
    
    // Formata conforme o tamanho
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    } else {
      return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
    }
  };

  const validarDados = () => {
    if (!dados.nome.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório');
      return false;
    }

    if (dados.nome.trim().length < 3) {
      Alert.alert('Atenção', 'O nome deve ter pelo menos 3 caracteres');
      return false;
    }

    if (dados.telefone && dados.telefone.replace(/\D/g, '').length < 10) {
      Alert.alert('Atenção', 'Telefone inválido');
      return false;
    }

    if (dados.dataNascimento) {
      const numerosData = dados.dataNascimento.replace(/\D/g, '');
      if (numerosData.length > 0 && numerosData.length !== 8) {
        Alert.alert('Atenção', 'Data de nascimento inválida');
        return false;
      }
    }

    return true;
  };

  const handleSalvar = async () => {
    if (!validarDados()) return;

    setSalvando(true);
    try {
      const user = auth.currentUser;
      
      // Atualizar no Firebase Auth
      await updateProfile(user, {
        displayName: dados.nome,
      });

      // Atualizar no Firestore
      await atualizarPerfil(user.uid, {
        nome: dados.nome,
        telefone: dados.telefone,
        bio: dados.bio,
        dataNascimento: dados.dataNascimento,
      });

      Alert.alert(
        'Sucesso',
        'Perfil atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarFoto = () => {
    Alert.alert(
      'Alterar Foto',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: () => Alert.alert('Em breve', 'Funcionalidade de câmera em desenvolvimento'),
        },
        {
          text: 'Galeria',
          onPress: () => Alert.alert('Em breve', 'Funcionalidade de galeria em desenvolvimento'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleSalvar} disabled={salvando}>
          {salvando ? (
            <ActivityIndicator size="small" color={cores.verdeEscuro} />
          ) : (
            <Text style={styles.salvarText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Foto do perfil */}
          <View style={styles.fotoContainer}>
            <View style={styles.fotoWrapper}>
              {auth.currentUser?.photoURL ? (
                <Image 
                  source={{ uri: auth.currentUser.photoURL }} 
                  style={styles.foto} 
                />
              ) : (
                <View style={styles.fotoPlaceholder}>
                  <Ionicons name="person" size={50} color={cores.verdeEscuro} />
                </View>
              )}
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={handleAlterarFoto}
              >
                <Ionicons name="camera" size={20} color={cores.brancoTexto} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.alterarFotoButton}
              onPress={handleAlterarFoto}
            >
              <Text style={styles.alterarFotoText}>Alterar foto</Text>
            </TouchableOpacity>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome completo *</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color="#999" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={dados.nome}
                  onChangeText={(text) => setDados({...dados, nome: text})}
                  placeholder="Digite seu nome"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* E-mail (desabilitado) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color="#999" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: '#999' }]}
                  value={dados.email}
                  editable={false}
                />
                <Ionicons 
                  name="lock-closed-outline" 
                  size={18} 
                  color="#999" 
                />
              </View>
              <Text style={styles.helperText}>
                O e-mail não pode ser alterado
              </Text>
            </View>

            {/* Telefone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="call-outline" 
                  size={20} 
                  color="#999" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={dados.telefone}
                  onChangeText={(text) => {
                    const formatado = formatarTelefone(text);
                    setDados({...dados, telefone: formatado});
                  }}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            {/* Data de nascimento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de nascimento</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color="#999" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={dados.dataNascimento}
                  onChangeText={(text) => {
                    const formatado = formatarData(text);
                    setDados({...dados, dataNascimento: formatado});
                  }}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sobre você</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons 
                  name="create-outline" 
                  size={20} 
                  color="#999" 
                  style={[styles.inputIcon, styles.textAreaIcon]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dados.bio}
                  onChangeText={(text) => setDados({...dados, bio: text})}
                  placeholder="Conte um pouco sobre você..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={200}
                />
              </View>
              <Text style={styles.helperText}>
                {dados.bio.length}/200 caracteres
              </Text>
            </View>
          </View>

          {/* Informações adicionais */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={cores.verdeEscuro} />
            <Text style={styles.infoText}>
              Seus dados estão seguros e protegidos. Eles só serão compartilhados 
              de acordo com suas configurações de privacidade.
            </Text>
          </View>

          {/* Botão de excluir conta */}
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Excluir Conta',
                'Esta ação é irreversível. Deseja realmente excluir sua conta?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Em breve', 'Funcionalidade em desenvolvimento');
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#E53935" />
            <Text style={styles.deleteButtonText}>Excluir minha conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  salvarText: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.verdeEscuro,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  fotoWrapper: {
    marginBottom: 15,
    position: 'relative',
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: cores.verdeEscuro,
  },
  fotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: cores.verdeClaro,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: cores.verdeEscuro,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: cores.laranjaEscuro,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: cores.brancoTexto,
  },
  alterarFotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  alterarFotoText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: cores.laranjaEscuro,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 5,
  },
  label: {
    ...fontes.montserratBold,
    fontSize: 14,
    marginBottom: 8,
    color: cores.verdeEscuro,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.brancoTexto,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textAreaIcon: {
    marginTop: 5,
  },
  input: {
    ...fontes.montserrat,
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
    color: '#000',
  },
  textArea: {
    height: 100,
    paddingTop: 0,
  },
  helperText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: cores.verdeClaro,
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    ...fontes.montserrat,
    fontSize: 13,
    color: cores.verdeEscuro,
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 30,
    marginBottom: 20,
  },
  deleteButtonText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#E53935',
    marginLeft: 8,
  },
});