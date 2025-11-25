import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../../components/Global';
import { auth } from '../../firebase/firebaseconfig';
import * as projetosService from '../../services/projetosService';

export default function CriarProjeto({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [itensNecessarios, setItensNecessarios] = useState('');
  const [loading, setLoading] = useState(false);

  const categorias = [
    { id: 'alimentos', label: 'Alimentos', icon: 'fast-food' },
    { id: 'roupas', label: 'Roupas', icon: 'shirt' },
    { id: 'brinquedos', label: 'Brinquedos', icon: 'game-controller' },
    { id: 'higiene', label: 'Higiene', icon: 'water' },
    { id: 'educacao', label: 'Educação', icon: 'book' },
    { id: 'outros', label: 'Outros', icon: 'apps' },
  ];

  const handleCriarProjeto = async () => {
    if (!titulo.trim() || !descricao.trim() || !categoria) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado em CriarProjeto instituição');
        Alert.alert('Erro', 'Faça login para criar um projeto');
        setLoading(false);
        return;
      }

      await projetosService.criarProjeto({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        itensNecessarios: itensNecessarios.trim(),
        instituicaoId: user.uid,
      });

      Alert.alert(
        'Sucesso!',
        'Projeto criado com sucesso',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o projeto');
      console.error(error);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={cores.verdeEscuro} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Projeto</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título do Projeto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Campanha de Natal 2025"
                value={titulo}
                onChangeText={setTitulo}
                maxLength={100}
              />
            </View>

            {/* Descrição */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva o objetivo do projeto e como as doações serão utilizadas"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria *</Text>
              <View style={styles.categoriesGrid}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      categoria === cat.id && styles.categoryCardSelected,
                    ]}
                    onPress={() => setCategoria(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={28}
                      color={categoria === cat.id ? cores.verdeEscuro : '#666'}
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        categoria === cat.id && styles.categoryLabelSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Itens Necessários */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Itens Necessários (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Liste os itens específicos que você precisa receber"
                value={itensNecessarios}
                onChangeText={setItensNecessarios}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Botão Criar */}
            <TouchableOpacity
              style={[styles.createBtn, loading && styles.createBtnDisabled]}
              onPress={handleCriarProjeto}
              disabled={loading}
            >
              <Text style={styles.createBtnText}>
                {loading ? 'Criando...' : 'Criar Projeto'}
              </Text>
            </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    ...fontes.montserratBold,
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
  },
  input: {
    ...fontes.montserrat,
    backgroundColor: cores.brancoTexto,
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: cores.brancoTexto,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  categoryCardSelected: {
    borderColor: cores.verdeEscuro,
    backgroundColor: cores.verdeClaro,
  },
  categoryLabel: {
    ...fontes.montserratMedium,
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: cores.verdeEscuro,
    ...fontes.montserratBold,
  },
  createBtn: {
    backgroundColor: cores.verdeEscuro,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: '#fff',
  },
});