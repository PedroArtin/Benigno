// screens/Perfil.js - VERSÃO MELHORADA COM DEBUG
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { auth } from '../firebase/firebaseconfig';
import { signOut } from 'firebase/auth';
import { 
  buscarPerfilUsuario, 
  criarPerfilUsuario,
  buscarEstatisticas 
} from '../services/userService';
import { obterClassificacao } from '../services/avaliacoesService';

export default function Perfil({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    doacoes: 0,
    favoritos: 0,
    pontos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [classificacao, setClassificacao] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Perfil focado - recarregando dados...');
      carregarDadosUsuario();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    console.log('📊 Iniciando carregamento de dados do perfil...');
    setLoading(true);
    setErro(null);
    
    try {
      const user = auth.currentUser;
      console.log('👤 Usuário atual:', user?.email);
      
      if (!user) {
        console.error('❌ Nenhum usuário autenticado');
        Alert.alert('Sessão expirada', 'Faça login novamente para ver seu perfil', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
        setErro('Usuário não autenticado');
        setLoading(false);
        return;
      }

      // Dados básicos do usuário (sempre disponíveis)
      const dadosBasicos = {
        nome: user.displayName || 'Usuário',
        email: user.email,
        foto: user.photoURL,
        uid: user.uid,
      };
      console.log('✅ Dados básicos carregados:', dadosBasicos);

      // Tentar buscar perfil do Firestore
      try {
        console.log('🔍 Buscando perfil no Firestore...');
        let perfil = await buscarPerfilUsuario(user.uid);
        
        if (!perfil) {
          console.log('⚠️ Perfil não encontrado, criando novo...');
          perfil = await criarPerfilUsuario(user.uid, {
            nome: user.displayName,
            email: user.email,
            foto: user.photoURL,
          });
          console.log('✅ Perfil criado:', perfil);
        } else {
          console.log('✅ Perfil encontrado:', perfil);
        }

        setUserData({
          nome: perfil.nome || user.displayName || 'Usuário',
          email: user.email,
          foto: perfil.foto || user.photoURL,
          telefone: perfil.telefone || '',
          bio: perfil.bio || '',
          uid: user.uid,
        });
      } catch (perfilError) {
        console.warn('⚠️ Erro ao buscar/criar perfil:', perfilError.message);
        // Usar dados básicos mesmo com erro
        setUserData(dadosBasicos);
      }

      // Buscar estatísticas
      try {
        console.log('📈 Buscando estatísticas...');
        const estatisticas = await buscarEstatisticas(user.uid);
        console.log('✅ Estatísticas carregadas:', estatisticas);
        
        setStats({
          doacoes: estatisticas.doacoes || 0,
          favoritos: estatisticas.favoritos || 0,
          pontos: estatisticas.pontos || 0,
        });
        // Calcular classificação do usuário (se desejar mostrar)
        const pontosUser = estatisticas.pontos || 0;
        setClassificacao(obterClassificacao(pontosUser));
      } catch (statsError) {
        console.warn('⚠️ Erro ao buscar estatísticas:', statsError.message);
        // Manter valores padrão (0)
        setStats({
          doacoes: 0,
          favoritos: 0,
          pontos: 0,
        });
      }

      console.log('✅ Carregamento completo!');
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados:', error);
      setErro(error.message);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível sair da conta');
            }
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
          {erro && (
            <Text style={styles.errorText}>{erro}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header com foto e informações */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {userData?.foto ? (
              <Image 
                source={{ uri: userData.foto }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons 
                  name="person" 
                  size={50} 
                  color={cores.verdeEscuro} 
                />
              </View>
            )}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditarPerfil')}
            >
              <Ionicons 
                name="camera" 
                size={20} 
                color={cores.brancoTexto} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.nomeUsuario}>{userData?.nome || 'Usuário'}</Text>
          <Text style={styles.emailUsuario}>{userData?.email || ''}</Text>
          {userData?.bio && (
            <Text style={styles.bioUsuario}>{userData.bio}</Text>
          )}
        </View>

        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('MinhasDoacoes')}
          >
            <Ionicons 
              name="gift-outline" 
              size={30} 
              color={cores.laranjaEscuro} 
            />
            <Text style={styles.statNumber}>{stats.doacoes}</Text>
            <Text style={styles.statLabel}>Doações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Favoritos')}
          >
            <Ionicons 
              name="heart-outline" 
              size={30} 
              color={cores.laranjaEscuro} 
            />
            <Text style={styles.statNumber}>{stats.favoritos}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </TouchableOpacity>
          
          <View style={styles.statCard}>
            <Ionicons 
              name="trophy-outline" 
              size={30} 
              color={cores.laranjaEscuro} 
            />
            <Text style={styles.statNumber}>{stats.pontos}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
            {classificacao && (
              <View style={[styles.rankBadge, { backgroundColor: classificacao.cor + '22' }]}>
                <Text style={[styles.rankText, { color: classificacao.cor }]}>{classificacao.nome}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Botão de debug - REMOVER EM PRODUÇÃO */}
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => {
            console.log('🔍 Estado atual:', { userData, stats });
            Alert.alert(
              'Debug Info',
              `Doações: ${stats.doacoes}\nFavoritos: ${stats.favoritos}\nPontos: ${stats.pontos}\n\nVerifique o console para mais detalhes.`
            );
          }}
        >
          <Ionicons name="bug-outline" size={20} color="#666" />
          <Text style={styles.debugButtonText}>Debug Info</Text>
        </TouchableOpacity>

        {/* Menu de Opções */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Minhas Atividades</Text>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('MinhasDoacoes')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="gift-outline" 
                size={24} 
                color={cores.verdeEscuro} 
              />
              <Text style={styles.menuItemText}>Minhas Doações</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Favoritos')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="heart-outline" 
                size={24} 
                color={cores.verdeEscuro} 
              />
              <Text style={styles.menuItemText}>Favoritos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('HistoricoAtividades')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="time-outline" 
                size={24} 
                color={cores.verdeEscuro} 
              />
              <Text style={styles.menuItemText}>Histórico</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.menuTitle}>Configurações</Text>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditarPerfil')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="person-outline" 
                size={24} 
                color={cores.verdeEscuro} 
              />
              <Text style={styles.menuItemText}>Editar Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notificacoes')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={cores.verdeEscuro} 
              />
              <Text style={styles.menuItemText}>Notificações</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Privacidade')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="shield-checkmark-outline" 
                size={24} 
                color={cores.verdeEscuro} 
              />
              <Text style={styles.menuItemText}>Privacidade</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AjudaSuporte')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="help-circle-outline" 
                size={24} 
                color={cores.verdeEscuro} 
              />
              <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('SobreApp')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="information-circle-outline" 
                size={24} 
                color={cores.verdeEscuro} 
              />
              <Text style={styles.menuItemText}>Sobre o App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="log-out-outline" 
                size={24} 
                color="#E53935" 
              />
              <Text style={[styles.menuItemText, { color: '#E53935' }]}>
                Sair da Conta
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Versão do App */}
        <Text style={styles.versaoApp}>Versão 1.0.0</Text>
      </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    ...fontes.montserrat,
    fontSize: 16,
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    ...fontes.montserrat,
    fontSize: 12,
    marginTop: 10,
    color: '#E53935',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: cores.brancoTexto,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: cores.verdeEscuro,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: cores.verdeClaro,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: cores.verdeEscuro,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: cores.laranjaEscuro,
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: cores.brancoTexto,
  },
  nomeUsuario: {
    ...fontes.merriweatherBold,
    fontSize: 24,
    marginBottom: 5,
  },
  emailUsuario: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
  },
  bioUsuario: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    ...fontes.merriweatherBold,
    fontSize: 24,
    marginTop: 10,
    marginBottom: 5,
    color: cores.verdeEscuro,
  },
  statLabel: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  rankBadge: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    ...fontes.montserratBold,
    fontSize: 12,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  debugButtonText: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  menuContainer: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuTitle: {
    ...fontes.montserratBold,
    fontSize: 16,
    marginBottom: 15,
    marginTop: 10,
    marginLeft: 5,
    color: cores.verdeEscuro,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    ...fontes.montserrat,
    fontSize: 16,
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  versaoApp: {
    ...fontes.montserrat,
    textAlign: 'center',
    color: '#999',
    marginBottom: 30,
    fontSize: 12,
  },
});