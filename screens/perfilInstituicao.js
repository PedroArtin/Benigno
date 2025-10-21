// screens/instituicao/PerfilInstituicao.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TextInputMask } from 'react-native-masked-text';
import { fontes, cores } from '../../components/Global';
import { auth, db } from '../../firebase/firebaseconfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function PerfilInstituicao({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Dados da Instituição
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [site, setSite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  // Dados do Responsável
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelCpf, setResponsavelCpf] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');

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

      const instRef = doc(db, 'instituicoes', user.uid);
      const instDoc = await getDoc(instRef);

      if (instDoc.exists()) {
        const data = instDoc.data();
        setNome(data.nome || '');
        setCnpj(data.cnpj || '');
        setEmail(data.email || user.email);
        setTelefone(data.telefone || '');
        setEndereco(data.endereco || '');
        setDescricao(data.descricao || '');
        setSite(data.site || '');
        setInstagram(data.redesSociais?.instagram || '');
        setFacebook(data.redesSociais?.facebook || '');
        setResponsavelNome(data.responsavel?.nome || '');
        setResponsavelCpf(data.responsavel?.cpf || '');
        setResponsavelTelefone(data.responsavel?.telefone || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Digite o nome da instituição');
      return;
    }

    if (!cnpj || cnpj.length < 18) {
      Alert.alert('Erro', 'Digite um CNPJ válido');
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;

      const dadosAtualizados = {
        nome: nome.trim(),
        cnpj,
        email,
        telefone,
        endereco: endereco.trim(),
        descricao: descricao.trim(),
        site: site.trim(),
        redesSociais: {
          instagram: instagram.trim(),
          facebook: facebook.trim(),
        },
        responsavel: {
          nome: responsavelNome.trim(),
          cpf: responsavelCpf,
          telefone: responsavelTelefone,
        },
        ultimaAtualizacao: new Date().toISOString(),
      };

      const instRef = doc(db, 'instituicoes', user.uid);
      await updateDoc(instRef, dadosAtualizados);

      Alert.alert('Sucesso! ✅', 'Perfil atualizado com sucesso');
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      'Descartar Alterações',
      'As alterações não salvas serão perdidas. Deseja continuar?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: () => {
            setEditMode(false);
            carregarDados();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.verdeEscuro} />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil da Instituição</Text>
          <TouchableOpacity
            onPress={() => setEditMode(!editMode)}
            disabled={saving}
          >
            <Ionicons
              name={editMode ? 'close' : 'create'}
              size={24}
              color={editMode ? cores.laranjaEscuro : cores.verdeEscuro}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Ionicons name="business" size={48} color={cores.verdeEscuro} />
              </View>
              <Text style={styles.avatarName}>{nome || 'Instituição'}</Text>
              <Text style={styles.avatarEmail}>{email}</Text>
            </View>

            {/* Dados da Instituição */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados da Instituição</Text>

              <Text style={styles.label}>Nome da Instituição *</Text>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome da instituição"
                editable={editMode}
                placeholderTextColor={cores.placeholder}
              />

              <Text style={styles.label}>CNPJ *</Text>
              <TextInputMask
                type={'cnpj'}
                value={cnpj}
                onChangeText={setCnpj}
                style={[styles.input, !editMode && styles.inputDisabled]}
                placeholder="00.000.000/0000-00"
                editable={editMode}
                placeholderTextColor={cores.placeholder}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Email de Contato</Text>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                placeholder="contato@instituicao.org"
                editable={editMode}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={cores.placeholder}
              />

              <Text style={styles.label}>Telefone</Text>
              <TextInputMask
                type={'cel-phone'}
                options={{
                  maskType: 'BRL',
                  withDDD: true,
                  dddMask: '(99) ',
                }}
                value={telefone}
                onChangeText={setTelefone}
                style={[styles.input, !editMode && styles.inputDisabled]}
                placeholder="(00) 00000-0000"
                editable={editMode}
                placeholderTextColor={cores.placeholder}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Endereço Completo</Text>
              <TextInput
                style={[styles.input, styles.textArea, !editMode && styles.inputDisabled]}
                value={endereco}
                onChangeText={setEndereco}
                placeholder="Rua, número, bairro, cidade, estado..."
                editable={editMode}
                multiline
                numberOfLines={3}
                placeholderTextColor={cores.placeholder}
              />

              <Text style={styles.label}>Descrição da Instituição</Text>
              <TextInput
                style={[styles.input, styles.textArea, !editMode && styles.inputDisabled]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Conte sobre a missão e objetivos da instituição..."
                editable={editMode}
                multiline
                numberOfLines={4}
                placeholderTextColor={cores.placeholder}
              />
            </View>

            {/* Redes Sociais e Site */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Site e Redes Sociais</Text>

              <Text style={styles.label}>Site</Text>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={site}
                onChangeText={setSite}
                placeholder="https://www.instituicao.org"
                editable={editMode}
                autoCapitalize="none"
                placeholderTextColor={cores.placeholder}
              />

              <Text style={styles.label}>Instagram</Text>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={instagram}
                onChangeText={setInstagram}
                placeholder="@instituicao"
                editable={editMode}
                autoCapitalize="none"
                placeholderTextColor={cores.placeholder}
              />

              <Text style={styles.label}>Facebook</Text>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={facebook}
                onChangeText={setFacebook}
                placeholder="facebook.com/instituicao"
                editable={editMode}
                autoCapitalize="none"
                placeholderTextColor={cores.placeholder}
              />
            </View>

            {/* Dados do Responsável */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Responsável Legal</Text>

              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={responsavelNome}
                onChangeText={setResponsavelNome}
                placeholder="Nome do responsável"
                editable={editMode}
                placeholderTextColor={cores.placeholder}
              />

              <Text style={styles.label}>CPF</Text>
              <TextInputMask
                type={'cpf'}
                value={responsavelCpf}
                onChangeText={setResponsavelCpf}
                style={[styles.input, !editMode && styles.inputDisabled]}
                placeholder="000.000.000-00"
                editable={editMode}
                placeholderTextColor={cores.placeholder}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Telefone</Text>
              <TextInputMask
                type={'cel-phone'}
                options={{
                  maskType: 'BRL',
                  withDDD: true,
                  dddMask: '(99) ',
                }}
                value={responsavelTelefone}
                onChangeText={setResponsavelTelefone}
                style={[styles.input, !editMode && styles.inputDisabled]}
                placeholder="(00) 00000-0000"
                editable={editMode}
                placeholderTextColor={cores.placeholder}
                keyboardType="phone-pad"
              />
            </View>

            {/* Botões de Ação */}
            {editMode && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel]}
                  onPress={handleCancelar}
                  disabled={saving}
                >
                  <Ionicons name="close-circle" size={20} color={cores.laranjaEscuro} />
                  <Text style={[styles.buttonText, { color: cores.laranjaEscuro }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonSave, saving && { opacity: 0.6 }]}
                  onPress={handleSalvar}
                  disabled={saving}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 30 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 14,
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: cores.brancoTexto,
  },
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    color: cores.verdeEscuro,
  },
  content: {
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: cores.verdeClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarName: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
  avatarEmail: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.laranjaEscuro,
    marginBottom: 15,
  },
  label: {
    ...fontes.montserratBold,
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    ...fontes.montserrat,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    marginBottom: 15,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: cores.laranjaClaro,
    borderWidth: 2,
    borderColor: cores.laranjaEscuro,
  },
  buttonSave: {
    backgroundColor: cores.verdeEscuro,
  },
  buttonText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
  },
});