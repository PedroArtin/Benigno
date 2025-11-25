// screens/CriarProjeto.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { TextInputMask } from 'react-native-masked-text';
import { fontes, cores } from '../components/Global';
import { auth, db } from '../firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { criarProjeto } from '../services/projetosService';

export default function CriarProjeto({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [instituicao, setInstituicao] = useState(null);
  
  // Dados do Projeto
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [necessidade, setNecessidade] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [meta, setMeta] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const categorias = [
    { label: "Direitos Humanos", value: "direitos-humanos" },
    { label: "Combate à fome", value: "combate-a-fome" },
    { label: "Educação", value: "educacao" },
    { label: "Saúde", value: "saude" },
    { label: "Crianças e Adolescentes", value: "crianca-e-adolescentes" },
    { label: "Defesa dos Animais", value: "defesa-dos-animais" },
    { label: "Meio Ambiente", value: "meio-ambiente" },
    { label: "Apoio à Melhor Idade", value: "melhor-idade" },
  ];

  useEffect(() => {
    carregarDadosInstituicao();
  }, []);

  const carregarDadosInstituicao = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const instRef = doc(db, 'instituicoes', user.uid);
      const instDoc = await getDoc(instRef);

      if (instDoc.exists()) {
        const data = instDoc.data();
        setInstituicao(data);
        setTelefone(data.responsavel?.telefone || '');
        setEmail(data.email || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const validarCampos = () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Digite o título do projeto');
      return false;
    }
    if (!descricao.trim()) {
      Alert.alert('Erro', 'Digite a descrição do projeto');
      return false;
    }
    if (!necessidade.trim()) {
      Alert.alert('Erro', 'Digite o que você precisa receber');
      return false;
    }
    if (!categoria) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return false;
    }
    if (!endereco.trim()) {
      Alert.alert('Erro', 'Digite o endereço para retirada/entrega');
      return false;
    }
    if (!telefone || telefone.length < 14) {
      Alert.alert('Erro', 'Digite um telefone válido');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite um e-mail para contato');
      return false;
    }
    return true;
  };

  const handleCriarProjeto = async () => {
    if (!validarCampos()) return;

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado ao criar projeto');
        Alert.alert('Erro', 'Você precisa estar logado para criar um projeto');
        setLoading(false);
        return;
      }

      const projetoData = {
        instituicaoId: user.uid,
        instituicaoNome: instituicao?.nome || 'Instituição',
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        necessidade: necessidade.trim(),
        categoria,
        meta: meta ? parseInt(meta) : 0,
        endereco: endereco.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
      };

      await criarProjeto(projetoData);

      Alert.alert(
        'Projeto Criado! 🎉',
        'Seu projeto foi publicado e já está visível para doadores.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      Alert.alert('Erro', 'Não foi possível criar o projeto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color={cores.verdeEscuro} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Criar Projeto</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.form}>
            {/* Título */}
            <Text style={styles.label}>Título do Projeto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Arrecadação de Roupas de Inverno"
              placeholderTextColor={cores.placeholder}
              value={titulo}
              onChangeText={setTitulo}
            />

            {/* Categoria */}
            <Text style={styles.label}>Categoria *</Text>
            <Dropdown
              style={styles.input}
              placeholder="Escolha uma categoria"
              placeholderStyle={{ color: cores.placeholder, ...fontes.montserrat }}
              selectedTextStyle={{ color: '#000', ...fontes.montserrat, fontSize: 14 }}
              itemTextStyle={{ color: cores.verdeEscuro, ...fontes.montserrat }}
              data={categorias}
              labelField="label"
              valueField="value"
              value={categoria}
              onChange={(item) => setCategoria(item.value)}
            />

            {/* Necessidade */}
            <Text style={styles.label}>O que você precisa? *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Roupas, Cobertores, Alimentos..."
              placeholderTextColor={cores.placeholder}
              value={necessidade}
              onChangeText={setNecessidade}
            />

            {/* Meta */}
            <Text style={styles.label}>Meta (quantidade estimada)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              placeholderTextColor={cores.placeholder}
              value={meta}
              onChangeText={setMeta}
              keyboardType="numeric"
            />

            {/* Descrição */}
            <Text style={styles.label}>Descrição do Projeto *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Conte mais sobre o projeto, quem será beneficiado e como as doações serão utilizadas..."
              placeholderTextColor={cores.placeholder}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
            />

            {/* Separador */}
            <View style={styles.divider}>
              <Text style={styles.dividerText}>Informações de Contato</Text>
            </View>

            {/* Endereço */}
            <Text style={styles.label}>Endereço (para retirada/entrega) *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Rua, número, bairro, cidade..."
              placeholderTextColor={cores.placeholder}
              value={endereco}
              onChangeText={setEndereco}
              multiline
              numberOfLines={3}
            />

            {/* Telefone */}
            <Text style={styles.label}>Telefone para Contato *</Text>
            <TextInputMask
              type={'cel-phone'}
              options={{
                maskType: 'BRL',
                withDDD: true,
                dddMask: '(99) ',
              }}
              value={telefone}
              onChangeText={setTelefone}
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={cores.placeholder}
              keyboardType="phone-pad"
            />

            {/* Email */}
            <Text style={styles.label}>E-mail para Contato *</Text>
            <TextInput
              style={styles.input}
              placeholder="contato@instituicao.org"
              placeholderTextColor={cores.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Botão Criar */}
            <TouchableOpacity
              style={[styles.botao, loading && { opacity: 0.6 }]}
              onPress={handleCriarProjeto}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.botaoText}>
                {loading ? 'Criando...' : 'Criar Projeto'}
              </Text>
            </TouchableOpacity>

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
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    ...fontes.montserratBold,
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    ...fontes.montserrat,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    marginBottom: 20,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  divider: {
    marginVertical: 25,
    alignItems: 'center',
  },
  dividerText: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.laranjaEscuro,
  },
  botao: {
    flexDirection: 'row',
    backgroundColor: cores.verdeEscuro,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  botaoText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});