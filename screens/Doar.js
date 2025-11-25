// screens/Doar.js - VERSÃO COM DEBUG
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { fontes, cores } from '../components/Global';
import { buscarProjetosAtivos } from '../services/projetosService';
import { useFavoritos } from '../hooks/useFavoritos';
import BotaoFavoritar from '../components/BotaoFavoritar';
import FilterModal from '../components/FilterModal';

let MapView, Marker, Callout;
if (Platform.OS !== 'web') {
  ({ default: MapView, Marker, Callout } = require('react-native-maps'));
} else {
  MapView = ({ style }) => <View style={style}><Text>Mapas não disponíveis na web</Text></View>;
  Marker = Callout = () => null;
}

export default function Doar({ navigation }) {
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [projetos, setProjetos] = useState([]);
  const [loadingProjetos, setLoadingProjetos] = useState(true);
  const [viewMode, setViewMode] = useState('lista');
  const [searchText, setSearchText] = useState('');
  const [filteredProjetos, setFilteredProjetos] = useState([]);
  
  const { isFavorito, toggleFavorito, totalFavoritos } = useFavoritos();

  useEffect(() => {
    obterLocalizacao();
    carregarProjetos();
  }, []);

  useEffect(() => {
    filtrarProjetos();
  }, [searchText, projetos]);

  const obterLocalizacao = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada');
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const carregarProjetos = async () => {
    try {
      const projetosData = await buscarProjetosAtivos();
      
      console.log('📦 Projetos carregados:', projetosData.length);
      projetosData.forEach((p, index) => {
        console.log(`  ${index + 1}. ID: ${p.id}, Título: ${p.titulo}`);
      });
      
      const projetosComCoordenadas = projetosData.map(projeto => ({
        ...projeto,
        latitude: -23.55052 + (Math.random() - 0.5) * 0.1,
        longitude: -46.633308 + (Math.random() - 0.5) * 0.1,
      }));

      setProjetos(projetosComCoordenadas);
      setFilteredProjetos(projetosComCoordenadas);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoadingProjetos(false);
    }
  };

  const filtrarProjetos = () => {
    if (!searchText.trim()) {
      setFilteredProjetos(projetos);
      return;
    }

    const filtered = projetos.filter((projeto) => {
      const searchLower = searchText.toLowerCase();
      return (
        projeto.titulo?.toLowerCase().includes(searchLower) ||
        projeto.categoria?.toLowerCase().includes(searchLower) ||
        projeto.descricao?.toLowerCase().includes(searchLower) ||
        projeto.instituicaoNome?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredProjetos(filtered);
  };

  const aplicarFiltros = (filters) => {
    console.log('Filtros aplicados:', filters);
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

  const renderProjetoCard = ({ item }) => {
    if (!item || !item.id) {
      console.warn('⚠️ Projeto sem ID:', item);
      return null;
    }

    const categoriaIcon = getCategoriaIcon(item.categoria);
    const categoriaColor = getCategoriaColor(item.categoria);

    return (
      <TouchableOpacity
        style={styles.projetoCard}
        onPress={() => navigation.navigate('DetalhesProjeto', { projeto: item })}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: categoriaColor }]}>
          <Ionicons name={categoriaIcon} size={50} color="#FFF" />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeader}>
              <Text style={styles.categoriaBadge}>
                {item.categoria || 'OUTROS'}
              </Text>
              <Text style={styles.cardTitulo} numberOfLines={2}>
                {item.titulo}
              </Text>
              <View style={styles.doadorInfo}>
                <Ionicons name="business" size={12} color={cores.placeholder} />
                <Text style={styles.doadorNome}>{item.instituicaoNome || 'Instituição'}</Text>
              </View>
            </View>
            
            {/* Botão Favoritar - PASSANDO DADOS CORRETOS */}
            <BotaoFavoritar
              projetoId={item.id}
              isFavorito={isFavorito(item.id)}
              onToggle={toggleFavorito}
              projeto={item}
              size={22}
            />
          </View>

          <Text style={styles.cardDescricao} numberOfLines={2}>
            {item.descricao || 'Sem descrição'}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.statusChip}>
              <Ionicons 
                name="checkmark-circle" 
                size={14} 
                color="#4CAF50" 
              />
              <Text style={styles.statusText}>Ativo</Text>
            </View>

            <TouchableOpacity style={styles.miniDoarBtn}>
              <Text style={styles.miniDoarBtnText}>Ver</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loadingLocation || loadingProjetos) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.verdeEscuro} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={cores.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar projetos..."
            placeholderTextColor={cores.placeholder}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={cores.placeholder} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.favoritosBtn}
            onPress={() => navigation.navigate('Favoritos')}
          >
            <Ionicons name="heart" size={22} color={cores.laranjaEscuro} />
            {totalFavoritos > 0 && (
              <View style={styles.favoritosBadge}>
                <Text style={styles.favoritosBadgeText}>
                  {totalFavoritos > 9 ? '9+' : totalFavoritos}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setViewMode(viewMode === 'mapa' ? 'lista' : 'mapa')}
          >
            <Ionicons
              name={viewMode === 'mapa' ? 'list' : 'map'}
              size={22}
              color={cores.verdeEscuro}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={22} color={cores.brancoTexto} />
          </TouchableOpacity>
        </View>
      </View>

      {searchText.length > 0 && (
        <View style={styles.resultCounter}>
          <Text style={styles.resultCounterText}>
            {filteredProjetos.length} projeto(s) encontrado(s)
          </Text>
        </View>
      )}

      {viewMode === 'mapa' && userLocation ? (
        <MapView
          style={styles.map}
          initialRegion={userLocation}
        >
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Você está aqui"
          >
            <View style={styles.userMarker}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </Marker>

          {filteredProjetos.map((projeto) => (
            <Marker
              key={projeto.id}
              coordinate={{
                latitude: projeto.latitude,
                longitude: projeto.longitude,
              }}
            >
              <View
                style={[
                  styles.customMarker,
                  { backgroundColor: getCategoriaColor(projeto.categoria) },
                ]}
              >
                <Ionicons name={getCategoriaIcon(projeto.categoria)} size={20} color="#fff" />
                {isFavorito(projeto.id) && (
                  <View style={styles.markerFavoriteBadge}>
                    <Ionicons name="heart" size={10} color="#fff" />
                  </View>
                )}
              </View>

              <Callout
                onPress={() => navigation.navigate('DetalhesProjeto', { projeto })}
              >
                <View style={styles.callout}>
                  <View style={styles.calloutHeader}>
                    <Text style={styles.calloutTitulo}>{projeto.titulo}</Text>
                    <BotaoFavoritar
                      projetoId={projeto.id}
                      isFavorito={isFavorito(projeto.id)}
                      onToggle={toggleFavorito}
                      projeto={projeto}
                      size={20}
                      style={{ padding: 0 }}
                    />
                  </View>
                  <Text style={styles.calloutCategoria}>{projeto.categoria}</Text>
                  <Text style={styles.calloutDescricao} numberOfLines={2}>
                    {projeto.descricao}
                  </Text>
                  <TouchableOpacity style={styles.calloutBtn}>
                    <Text style={styles.calloutBtnText}>Ver Detalhes</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <FlatList
          data={filteredProjetos}
          renderItem={renderProjetoCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={60} color={cores.placeholder} />
              <Text style={styles.emptyText}>Nenhum projeto encontrado</Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={aplicarFiltros}
      />
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
    backgroundColor: cores.brancoTexto,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.fundoBranco,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 10,
  },
  searchInput: {
    ...fontes.montserrat,
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  favoritosBtn: {
    backgroundColor: cores.fundoBranco,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  favoritosBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: cores.verdeEscuro,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: cores.brancoTexto,
  },
  favoritosBadgeText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 9,
  },
  toggleBtn: {
    backgroundColor: cores.fundoBranco,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtn: {
    flex: 1,
    backgroundColor: cores.verdeEscuro,
    height: 45,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCounter: {
    backgroundColor: cores.laranjaClaro,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  resultCounterText: {
    ...fontes.montserratMedium,
    fontSize: 12,
    color: cores.laranjaEscuro,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    backgroundColor: cores.verdeEscuro,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    position: 'relative',
  },
  markerFavoriteBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: cores.laranjaEscuro,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  callout: {
    width: 220,
    padding: 10,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  calloutTitulo: {
    ...fontes.montserratBold,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  calloutCategoria: {
    ...fontes.montserrat,
    fontSize: 11,
    color: cores.laranjaEscuro,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  calloutDescricao: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  calloutBtn: {
    backgroundColor: cores.laranjaEscuro,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  calloutBtnText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 11,
  },
  lista: {
    padding: 15,
  },
  projetoCard: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeader: {
    flex: 1,
  },
  categoriaBadge: {
    ...fontes.montserratBold,
    fontSize: 11,
    color: cores.laranjaEscuro,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitulo: {
    ...fontes.merriweatherBold,
    fontSize: 15,
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
  doadorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doadorNome: {
    ...fontes.montserrat,
    fontSize: 11,
    color: cores.placeholder,
  },
  cardDescricao: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    ...fontes.montserratMedium,
    fontSize: 11,
    color: '#666',
  },
  miniDoarBtn: {
    flexDirection: 'row',
    backgroundColor: cores.verdeEscuro,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
    gap: 5,
  },
  miniDoarBtnText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...fontes.montserrat,
    fontSize: 16,
    color: cores.placeholder,
    marginTop: 15,
  },
});