// screens/DetalhesProjeto.js - TOTALMENTE CORRIGIDO
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import BotaoFavoritar from '../components/BotaoFavoritar';
import FormularioDoacao from '../screens/FormularioDoacao';
import { useFavoritos } from '../hooks/useFavoritos';

export default function DetalhesProjeto({ route, navigation }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [projeto, setProjeto] = useState(null);
  
  const { isFavorito, toggleFavorito } = useFavoritos();

  useEffect(() => {
    console.log('🔵 DetalhesProjeto montado');
    console.log('🔵 route.params:', route.params);
    
    if (route.params?.projeto) {
      const projetoRecebido = route.params.projeto;
      console.log('🔵 Projeto recebido:', projetoRecebido);
      console.log('🔵 Projeto ID:', projetoRecebido.id);
      console.log('🔵 Projeto titulo:', projetoRecebido.titulo);
      setProjeto(projetoRecebido);
    } else {
      console.error('❌ Nenhum projeto recebido nos params!');
    }
  }, [route.params]);

  const handleQueroAjudar = () => {
    console.log('🔵 Botão Quero Ajudar clicado!');
    console.log('🔵 Projeto atual:', projeto);
    
    if (!projeto) {
      console.error('❌ Projeto está undefined!');
      return;
    }
    
    if (!projeto.id) {
      console.error('❌ Projeto sem ID!');
      return;
    }
    
    console.log('🟢 Abrindo formulário de doação...');
    setMostrarFormulario(true);
  };

  const handleDoacaoSucesso = () => {
    console.log('✅ Doação realizada com sucesso!');
    setMostrarFormulario(false);
    navigation.goBack();
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      'direitos-humanos': 'people',
      'combate-a-fome': 'restaurant',
      'educacao': 'school',
      'saude': 'medical',
      'crianca-e-adolescentes': 'happy',
      'defesa-dos-animais': 'paw',
      'meio-ambiente': 'leaf',
      'melhor-idade': 'heart',
    };
    return icons[categoria] || 'heart-outline';
  };

  const getCategoriaColor = (categoria) => {
    const cores_categorias = {
      'direitos-humanos': cores.direitosh || '#E91E63',
      'combate-a-fome': cores.fome || '#FF5722',
      'educacao': cores.educacao || '#2196F3',
      'saude': cores.saude || '#4CAF50',
      'crianca-e-adolescentes': cores.criancasAdolescentes || '#9C27B0',
      'defesa-dos-animais': cores.animais || '#795548',
      'meio-ambiente': cores.meioAmbiente || '#8BC34A',
      'melhor-idade': cores.melhorIdade || '#FF9800',
    };
    return cores_categorias[categoria] || cores.verdeEscuro;
  };

  if (!projeto) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.verdeEscuro} />
          <Text style={styles.loadingText}>Carregando projeto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoriaIcon = getCategoriaIcon(projeto.categoria);
  const categoriaColor = getCategoriaColor(projeto.categoria);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalhes do Projeto</Text>

        {/* CRÍTICO: Passar projeto completo */}
        <BotaoFavoritar
          projetoId={projeto.id}
          isFavorito={isFavorito(projeto.id)}
          onToggle={toggleFavorito}
          projeto={projeto}
          size={24}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ícone da Categoria */}
        <View style={[styles.categoryBanner, { backgroundColor: categoriaColor }]}>
          <Ionicons name={categoriaIcon} size={80} color="#FFF" />
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          {/* Categoria Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {projeto.categoria?.toUpperCase() || 'OUTROS'}
            </Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>{projeto.titulo}</Text>

          {/* Instituição */}
          <View style={styles.institutionCard}>
            <View style={styles.institutionIcon}>
              <Ionicons name="business" size={24} color={cores.verdeEscuro} />
            </View>
            <View style={styles.institutionInfo}>
              <Text style={styles.institutionLabel}>Instituição</Text>
              <Text style={styles.institutionName}>
                {projeto.instituicaoNome || 'Instituição'}
              </Text>
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={cores.verdeEscuro} />
              <Text style={styles.sectionTitle}>Sobre o Projeto</Text>
            </View>
            <Text style={styles.description}>
              {projeto.descricao || 'Sem descrição disponível.'}
            </Text>
          </View>

          {/* Necessidades */}
          {projeto.necessidade && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={20} color={cores.verdeEscuro} />
                <Text style={styles.sectionTitle}>O que Precisamos</Text>
              </View>
              <Text style={styles.description}>{projeto.necessidade}</Text>
            </View>
          )}

          {/* Contato */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color={cores.verdeEscuro} />
              <Text style={styles.sectionTitle}>Contato</Text>
            </View>

            {projeto.telefone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{projeto.telefone}</Text>
              </View>
            )}

            {projeto.email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{projeto.email}</Text>
              </View>
            )}

            {projeto.endereco && (
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{projeto.endereco}</Text>
              </View>
            )}
          </View>

          {/* Estatísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="gift" size={24} color={cores.laranjaEscuro} />
              <Text style={styles.statNumber}>
                {projeto.doacoesRecebidas || 0}
              </Text>
              <Text style={styles.statLabel}>Doações</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={cores.verdeEscuro} />
              <Text style={styles.statNumber}>Ativo</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botão Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={handleQueroAjudar}
        >
          <Ionicons name="heart" size={24} color="#fff" />
          <Text style={styles.helpButtonText}>Quero Ajudar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Doação */}
      <Modal
        visible={mostrarFormulario}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setMostrarFormulario(false)}>
              <Ionicons name="close" size={28} color={cores.verdeEscuro} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Fazer Doação</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* CRÍTICO: Passar projeto completo */}
          <FormularioDoacao
            projeto={projeto}
            onSuccess={handleDoacaoSucesso}
            onCancel={() => setMostrarFormulario(false)}
          />
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
    backgroundColor: cores.brancoTexto,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    ...fontes.montserratBold,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  categoryBanner: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: cores.laranjaClaro,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  categoryBadgeText: {
    ...fontes.montserratBold,
    fontSize: 12,
    color: cores.laranjaEscuro,
  },
  title: {
    ...fontes.merriweatherBold,
    fontSize: 28,
    color: cores.verdeEscuro,
    marginBottom: 20,
    lineHeight: 36,
  },
  institutionCard: {
    flexDirection: 'row',
    backgroundColor: cores.verdeClaro,
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
  },
  institutionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: cores.brancoTexto,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  institutionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  institutionLabel: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  institutionName: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.verdeEscuro,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.verdeEscuro,
  },
  description: {
    ...fontes.montserrat,
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
  },
  contactText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    ...fontes.merriweatherBold,
    fontSize: 24,
    marginVertical: 8,
  },
  statLabel: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  footer: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: cores.brancoTexto,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  helpButton: {
    backgroundColor: cores.verdeEscuro,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  helpButtonText: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: '#fff',
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
    ...fontes.montserratBold,
    fontSize: 18,
    color: cores.verdeEscuro,
  },
});