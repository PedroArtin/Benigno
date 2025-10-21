// screens/Notificacoes.js
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

export default function Notificacoes({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    novosprojetos: true,
    atualizacoesDoacoes: true,
    mensagens: true,
    promocoes: false,
    newsletters: false,
    lembretesDoacao: true,
    impactoProjetos: true,
    conquistas: true,
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfil = await buscarPerfilUsuario(user.uid);
        if (perfil?.notificacoes) {
          setConfiguracoes({
            novosprojetos: perfil.notificacoes.novosprojetos ?? true,
            atualizacoesDoacoes: perfil.notificacoes.atualizacoesDoacoes ?? true,
            mensagens: perfil.notificacoes.mensagens ?? true,
            promocoes: perfil.notificacoes.promocoes ?? false,
            newsletters: perfil.notificacoes.newsletters ?? false,
            lembretesDoacao: perfil.notificacoes.lembretesDoacao ?? true,
            impactoProjetos: perfil.notificacoes.impactoProjetos ?? true,
            conquistas: perfil.notificacoes.conquistas ?? true,
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
      await atualizarPerfil(user.uid, {
        notificacoes: novasConfiguracoes,
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setConfiguracoes(configuracoes);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setSalvando(false);
    }
  };

  const handleDesativarTodas = () => {
    Alert.alert(
      'Desativar todas',
      'Tem certeza que deseja desativar todas as notificações? Você pode perder atualizações importantes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            const todasDesativadas = Object.keys(configuracoes).reduce(
              (acc, key) => ({ ...acc, [key]: false }),
              {}
            );
            setConfiguracoes(todasDesativadas);
            
            setSalvando(true);
            try {
              const user = auth.currentUser;
              await atualizarPerfil(user.uid, {
                notificacoes: todasDesativadas,
              });
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível salvar as configurações');
            } finally {
              setSalvando(false);
            }
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
          <Text style={styles.headerTitle}>Notificações</Text>
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
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color={cores.verdeEscuro} />
            <Text style={styles.infoText}>
              Gerencie como você quer receber notificações sobre suas doações e projetos
            </Text>
          </View>

          {/* Push Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notificações Push</Text>
            <Text style={styles.sectionDescription}>
              Receba alertas no seu celular
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="rocket-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Novos projetos</Text>
                  <Text style={styles.settingDescription}>
                    Notificações sobre novos projetos na plataforma
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.novosprojetos}
                onValueChange={(value) => handleToggle('novosprojetos', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.novosprojetos ? cores.verdeEscuro : '#f4f3f4'}
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
                  <Text style={styles.settingTitle}>Atualizações de doações</Text>
                  <Text style={styles.settingDescription}>
                    Informações sobre os projetos que você apoiou
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.atualizacoesDoacoes}
                onValueChange={(value) => handleToggle('atualizacoesDoacoes', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.atualizacoesDoacoes ? cores.verdeEscuro : '#f4f3f4'}
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
                  <Text style={styles.settingTitle}>Conquistas e badges</Text>
                  <Text style={styles.settingDescription}>
                    Quando você desbloquear novas conquistas
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.conquistas}
                onValueChange={(value) => handleToggle('conquistas', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.conquistas ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Mensagens</Text>
                  <Text style={styles.settingDescription}>
                    Quando você receber novas mensagens
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.mensagens}
                onValueChange={(value) => handleToggle('mensagens', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.mensagens ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Lembretes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lembretes</Text>
            <Text style={styles.sectionDescription}>
              Nunca perca uma oportunidade de ajudar
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Lembretes de doação</Text>
                  <Text style={styles.settingDescription}>
                    Lembretes para doar regularmente
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.lembretesDoacao}
                onValueChange={(value) => handleToggle('lembretesDoacao', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.lembretesDoacao ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="stats-chart-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Impacto dos projetos</Text>
                  <Text style={styles.settingDescription}>
                    Relatórios sobre o impacto das suas doações
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.impactoProjetos}
                onValueChange={(value) => handleToggle('impactoProjetos', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.impactoProjetos ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>
          </View>

          {/* E-mails e Marketing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>E-mails e Marketing</Text>
            <Text style={styles.sectionDescription}>
              Comunicações por e-mail
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="mail-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Newsletter</Text>
                  <Text style={styles.settingDescription}>
                    Receba nossa newsletter semanal
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.newsletters}
                onValueChange={(value) => handleToggle('newsletters', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.newsletters ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="pricetag-outline"
                  size={24}
                  color={cores.verdeEscuro}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Promoções e ofertas</Text>
                  <Text style={styles.settingDescription}>
                    Campanhas especiais e eventos
                  </Text>
                </View>
              </View>
              <Switch
                value={configuracoes.promocoes}
                onValueChange={(value) => handleToggle('promocoes', value)}
                trackColor={{ false: '#E0E0E0', true: cores.verdeClaro }}
                thumbColor={configuracoes.promocoes ? cores.verdeEscuro : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Ações Rápidas */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDesativarTodas}
            >
              <Ionicons
                name="notifications-off-outline"
                size={24}
                color="#E53935"
              />
              <Text style={styles.actionButtonText}>
                Desativar todas as notificações
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert('Testar', 'Notificação de teste enviada!')
              }
            >
              <Ionicons
                name="send-outline"
                size={24}
                color={cores.verdeEscuro}
              />
              <Text style={[styles.actionButtonText, { color: cores.verdeEscuro }]}>
                Enviar notificação de teste
              </Text>
            </TouchableOpacity>
          </View>

          {/* Informações Adicionais */}
          <View style={styles.infoCard}>
            <Ionicons name="bulb-outline" size={24} color={cores.laranjaEscuro} />
            <Text style={styles.infoCardText}>
              <Text style={styles.infoCardBold}>Dica:</Text> Mantenha as
              notificações de atualizações de doações ativadas para acompanhar
              o impacto das suas contribuições!
            </Text>
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: cores.verdeClaro,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    ...fontes.montserrat,
    fontSize: 13,
    color: cores.verdeEscuro,
    flex: 1,
    marginLeft: 10,
    lineHeight: 18,
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
  actionsSection: {
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    ...fontes.montserratBold,
    fontSize: 15,
    color: '#E53935',
    marginLeft: 15,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoCardText: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },
  infoCardBold: {
    ...fontes.montserratBold,
    color: cores.laranjaEscuro,
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