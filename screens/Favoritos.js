// screens/Favoritos.js - SEM IMAGENS, SEM VALORES MONETÁRIOS
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { auth } from '../firebase/firebaseconfig';
import { buscarFavoritos, removerFavorito } from '../services/userService';

export default function Favoritos({ navigation }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Favoritos focado - recarregando...');
      carregarFavoritos();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  const carregarFavoritos = async () => {
    try {
      setRefreshing(true);
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      console.log('📥 Carregando favoritos para:', user.uid);
      const dados = await buscarFavoritos(user.uid);
      console.log(`✅ ${dados.length} favoritos carregados`);
      
      setFavoritos(dados);
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os favoritos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoverFavorito = (item) => {
    Alert.alert(
      'Remover favorito',
      `Deseja remover "${item.titulo || 'este item'}" dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert('Erro', 'Usuário não autenticado');
                return;
              }

              console.log('🗑️ Removendo favorito:', item.favoritoId);
              
              await removerFavorito(user.uid, item.favoritoId);
              
              setFavoritos(favoritos.filter(f => f.favoritoId !== item.favoritoId));
              
              Alert.alert('Sucesso', 'Item removido dos favoritos');
            } catch (error) {
              console.error('❌ Erro ao remover favorito:', error);
              Alert.alert('Erro', 'Não foi possível remover o favorito');
            }
          },
        },
      ]
    );
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      'roupas': 'shirt-outline',
      'moveis': 'bed-outline',
      'eletronicos': 'phone-portrait-outline',
      'livros': 'book-outline',
      'brinquedos': 'game-controller-outline',
      'alimentos': 'fast-food-outline',
      'outros': 'cube-outline'
    };
    return icons[categoria?.toLowerCase()] || 'cube-outline';
  };

  const getCategoriaColor = (categoria) => {
    const colors = {
      'roupas': '#E91E63',
      'moveis': '#795548',
      'eletronicos': '#2196F3',
      'livros': '#FF9800',
      'brinquedos': '#9C27B0',
      'alimentos': '#4CAF50',
      'outros': '#607D8B'
    };
    return colors[categoria?.toLowerCase()] || '#999';
  };

  const renderItem = ({ item }) => {
    if (!item) {
      console.warn('⚠️ Item de favorito vazio');
      return null;
    }

    const categoriaIcon = getCategoriaIcon(item.categoria);
    const categoriaColor = getCategoriaColor(item.categoria);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          const id = item.projetoId || item.id;
          if (id) {
            navigation.navigate('DetalhesProjeto', { projetoId: id });
          } else {
            Alert.alert('Erro', 'ID do projeto não encontrado');
          }
        }}
      >
        {/* Ícone da Categoria */}
        <View style={[styles.iconContainer, { backgroundColor: categoriaColor }]}>
          <Ionicons name={categoriaIcon} size={40} color="#FFF" />
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.categoria}>{item.categoria || 'Sem categoria'}</Text>
              <Text style={styles.titulo} numberOfLines={2}>
                {item.titulo || 'Sem título'}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => handleRemoverFavorito(item)}
              style={styles.favoriteButton}
            >
              <Ionicons name="heart" size={28} color={cores.laranjaEscuro} />
            </TouchableOpacity>
          </View>

          <Text style={styles.descricao} numberOfLines={3}>
            {item.descricao || 'Sem descrição'}
          </Text>

          <View style={styles.footer}>
            <View style={styles.infoChip}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{item.doador || 'Doador'}</Text>
            </View>
            
            {item.status && (
              <View style={[
                styles.statusChip,
                { 
                  backgroundColor: item.status === 'disponivel' 
                    ? cores.verdeClaro 
                    : item.status === 'doado' 
                    ? '#E3F2FD' 
                    : '#FFF3E0'
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { 
                    color: item.status === 'disponivel' 
                      ? cores.verdeEscuro 
                      : item.status === 'doado' 
                      ? '#1976D2' 
                      : '#F57C00'
                  }
                ]}>
                  {item.status === 'disponivel' ? 'Disponível' : 
                   item.status === 'doado' ? 'Doado' : 'Reservado'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#CCC" />
      <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
      <Text style={styles.emptyText}>
        Explore itens e adicione seus favoritos
      </Text>
      <TouchableOpacity
        style={styles.explorarButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="search" size={20} color={cores.brancoTexto} />
        <Text style={styles.explorarButtonText}>Explorar Itens</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favoritos</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.verdeEscuro} />
          <Text style={styles.loadingText}>Carregando favoritos...</Text>
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
        <Text style={styles.headerTitle}>Favoritos ({favoritos.length})</Text>
        <TouchableOpacity onPress={carregarFavoritos}>
          <Ionicons name="refresh" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={favoritos}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.favoritoId || `fav-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyList}
        onRefresh={carregarFavoritos}
        refreshing={refreshing}
      />
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
  loadingText: {
    ...fontes.montserrat,
    fontSize: 14,
    marginTop: 10,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  categoria: {
    ...fontes.montserratBold,
    fontSize: 11,
    color: cores.laranjaEscuro,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  titulo: {
    ...fontes.merriweatherBold,
    fontSize: 16,
    color: cores.verdeEscuro,
  },
  favoriteButton: {
    padding: 5,
  },
  descricao: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...fontes.montserratBold,
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...fontes.merriweatherBold,
    fontSize: 22,
    marginTop: 20,
    marginBottom: 10,
    color: cores.verdeEscuro,
  },
  emptyText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  explorarButton: {
    backgroundColor: cores.verdeEscuro,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },
  explorarButtonText: {
    ...fontes.montserratBold,
    color: cores.brancoTexto,
    fontSize: 16,
  },
});

