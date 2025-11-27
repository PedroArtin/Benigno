// screens/Privacidade.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { auth } from '../firebase/firebaseconfig';
import { buscarPerfilUsuario, atualizarPerfil } from '../services/userService';

export default function Privacidade({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    perfilPublico: true,
    mostrarDoacoes: true,
    mostrarPontos: true,
    permitirMensagens: true,
    compartilharEmail: false,
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfil = await buscarPerfilUsuario(user.uid);
        if (perfil?.privacidade) {
          setConfiguracoes({
            perfilPublico: perfil.privacidade.perfilPublico ?? true,
            mostrarDoacoes: perfil.privacidade.mostrarDoacoes ?? true,
            mostrarPontos: perfil.privacidade.mostrarPontos ?? true,
            permitirMensagens: perfil.privacidade.permitirMensagens ?? true,
            compartilharEmail: perfil.privacidade.compartilharEmail ?? false,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (chave, valor) => {
    const novasConfiguracoes = { ...configuracoes, [chave]: valor };
    setConfiguracoes(novasConfiguracoes);

    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado ao salvar configurações de privacidade');
        Alert.alert('Sessão expirada', 'Faça login novamente para salvar as configurações');
        setSalvando(false);
        return;
      }

      await atualizarPerfil(user.uid, {
        privacidade: novasConfiguracoes,
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      // Reverter em caso de erro
      setConfiguracoes(configuracoes);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirConta = () => {
    Alert.alert(
      'Excluir conta',
      'Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmação',
              'Digite sua senha para confirmar a exclusão da conta',
              [{ text: 'OK' }]
            );
          },
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
          <Text style={styles.headerTitle}>Privacidade</Text>
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
        <Text style={styles.headerTitle}>Privacidade</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Seção: Visibilidade do Perfil */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visibilidade do Perfil</Text>
            <Text style={styles.sectionDescription}>
              Controle quem pode ver suas informações
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="globe-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Perfil público</Text>
                  <Text style={styles.settingDescription}>
                    Seu perfil será visível para outros usuários
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.perfilPublico}
                onValueChange={(value) => handleToggle('perfilPublico', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.perfilPublico ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="gift-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Mostrar doações</Text>
                  <Text style={styles.settingDescription}>
                    Outros podem ver seus projetos apoiados
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.mostrarDoacoes}
                onValueChange={(value) => handleToggle('mostrarDoacoes', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.mostrarDoacoes ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="trophy-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Mostrar pontos</Text>
                  <Text style={styles.settingDescription}>
                    Sua pontuação será visível no perfil
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.mostrarPontos}
                onValueChange={(value) => handleToggle('mostrarPontos', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.mostrarPontos ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Seção: Comunicação */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comunicação</Text>
            <Text style={styles.sectionDescription}>
              Gerencie como outros podem entrar em contato
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Permitir mensagens</Text>
                  <Text style={styles.settingDescription}>
                    Outros usuários podem te enviar mensagens
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.permitirMensagens}
                onValueChange={(value) => handleToggle('permitirMensagens', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.permitirMensagens ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="mail-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Compartilhar e-mail</Text>
                  <Text style={styles.settingDescription}>
                    Seu e-mail será visível no perfil público
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.compartilharEmail}
                onValueChange={(value) => handleToggle('compartilharEmail', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.compartilharEmail ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Seção: Dados e Segurança */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados e Segurança</Text>

            <TouchableOpacity style={styles.actionItem}>
              <Ionicons
                name="download-outline"
                size={24}
                color={cores.verdeEscuro}
              />
              <Text style={styles.actionText}>Baixar meus dados</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={cores.verdeEscuro}
              />
              <Text style={styles.actionText}>Termos de uso</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={cores.verdeEscuro}
              />
              <Text style={styles.actionText}>Política de privacidade</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Zona de Perigo */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Zona de Perigo</Text>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleExcluirConta}
            >
              <Ionicons name="trash-outline" size={24} color="#E53935" />
              <Text style={styles.dangerButtonText}>Excluir minha conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {salvando && (
        <View style={styles.salvandoOverlay}>
          <ActivityIndicator size="small" color={cores.verdeEscuro} />
          <Text style={styles.salvandoText}>Salvando...</Text>
        </View>
      )}
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
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    ...fontes.merriweatherBold,
    fontSize: 16,
    marginBottom: 5,
    color: cores.verdeEscuro,
  },
  sectionDescription: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    ...fontes.montserratBold,
    fontSize: 15,
    marginBottom: 3,
  },
  settingDescription: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionText: {
    ...fontes.montserrat,
    fontSize: 15,
    flex: 1,
    marginLeft: 15,
  },
  dangerZone: {
    backgroundColor: '#FFF5F5',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 16,
    color: '#E53935',
    marginBottom: 15,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerButtonText: {
    ...fontes.montserratBold,
    fontSize: 15,
    color: '#E53935',
    marginLeft: 15,
  },
  salvandoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: cores.brancoTexto,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  salvandoText: {
    ...fontes.montserrat,
    marginLeft: 10,
    color: cores.verdeEscuro,
  },
});