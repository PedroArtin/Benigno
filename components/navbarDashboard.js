// components/NavbarDashboard.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from './Global';
import { auth } from '../firebase/firebaseconfig';
import { signOut } from 'firebase/auth';

const { width } = Dimensions.get('window');

export default function NavbarDashboard({ navigation, instituicao }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const abrirMenu = () => {
    setMenuVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const fecharMenu = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const handleNavegar = (rota) => {
    fecharMenu();
    setTimeout(() => {
      navigation.navigate(rota);
    }, 300);
  };

  const handleSair = () => {
    fecharMenu();
    setTimeout(() => {
      Alert.alert(
        'Sair da Conta',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut(auth);
                navigation.replace('LoginInstituicao');
              } catch (error) {
                Alert.alert('Erro', 'Não foi possível sair');
              }
            },
          },
        ]
      );
    }, 300);
  };

  const menuItems = [
    {
      icon: 'person-circle',
      title: 'Perfil da Instituição',
      subtitle: 'Ver e editar dados',
      color: cores.verdeEscuro,
      onPress: () => handleNavegar('perfilInstituicao'),
    },
    {
      icon: 'folder',
      title: 'Gerenciar Projetos',
      subtitle: 'Criar, editar e excluir',
      color: cores.laranjaEscuro,
      onPress: () => handleNavegar('MeusProjetos'),
    },
    {
      icon: 'stats-chart',
      title: 'Estatísticas Completas',
      subtitle: 'Relatórios e gráficos',
      color: '#1976D2',
      onPress: () => handleNavegar('EstatisticasInstituicao'),
    },
    {
      icon: 'settings',
      title: 'Configurações',
      subtitle: 'Preferências e ajustes',
      color: '#7B1FA2',
      onPress: () => handleNavegar('ConfiguracoesInst'),
    },
    {
      icon: 'log-out',
      title: 'Sair da Conta',
      subtitle: 'Fazer logout',
      color: '#E53935',
      onPress: handleSair,
    },
  ];

  return (
    <>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navbarLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={28} color={cores.verdeEscuro} />
          </View>
          <View style={styles.navbarTexts}>
            <Text style={styles.navbarTitle}>Dashboard</Text>
            <Text style={styles.navbarSubtitle} numberOfLines={1}>
              {instituicao?.nome || 'Instituição'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuButton} onPress={abrirMenu}>
          <Ionicons name="menu" size={28} color={cores.verdeEscuro} />
        </TouchableOpacity>
      </View>

      {/* Menu Lateral */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={fecharMenu}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={fecharMenu}
          />

          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Header do Menu */}
            <View style={styles.menuHeader}>
              <View style={styles.menuHeaderLeft}>
                <View style={styles.avatarLarge}>
                  <Ionicons name="business" size={32} color={cores.verdeEscuro} />
                </View>
                <View style={styles.menuHeaderTexts}>
                  <Text style={styles.menuHeaderTitle} numberOfLines={1}>
                    {instituicao?.nome || 'Instituição'}
                  </Text>
                  <Text style={styles.menuHeaderEmail} numberOfLines={1}>
                    {auth.currentUser?.email}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={fecharMenu}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Itens do Menu */}
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    index === menuItems.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuItemIcon,
                      { backgroundColor: item.color + '20' },
                    ]}
                  >
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <View style={styles.menuItemTexts}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.menuFooter}>
              <Text style={styles.menuFooterText}>WeCharity v1.0.0</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: cores.brancoTexto,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.verdeClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navbarTexts: {
    flex: 1,
  },
  navbarTitle: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
  },
  navbarSubtitle: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.verdeClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: width * 0.85,
    maxWidth: 360,
    backgroundColor: cores.fundoBranco,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: cores.verdeClaro,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.brancoTexto,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuHeaderTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  menuHeaderTitle: {
    ...fontes.merriweatherBold,
    fontSize: 16,
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
  menuHeaderEmail: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.brancoTexto,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLast: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF5F5',
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemTexts: {
    flex: 1,
  },
  menuItemTitle: {
    ...fontes.montserratBold,
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
  },
  menuFooter: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  menuFooterText: {
    ...fontes.montserrat,
    fontSize: 11,
    color: '#999',
  },
});