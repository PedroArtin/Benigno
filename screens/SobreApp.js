// screens/SobreApp.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';

export default function SobreApp({ navigation }) {
  const handleOpenURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Erro ao abrir URL:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre o App</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo e Nome */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Ionicons name="heart" size={60} color={cores.brancoTexto} />
            </View>
            <Text style={styles.appName}>Bengoa</Text>
            <Text style={styles.versao}>Versão 1.0.0</Text>
            <Text style={styles.tagline}>
              Conectando corações generosos a causas transformadoras
            </Text>
          </View>

          {/* Missão */}
          <View style={styles.section}>
            <View style={styles.iconHeader}>
              <Ionicons name="compass" size={28} color={cores.verdeEscuro} />
              <Text style={styles.sectionTitle}>Nossa Missão</Text>
            </View>
            <Text style={styles.sectionText}>
              Facilitar e democratizar o acesso a doações, conectando pessoas que 
              desejam fazer a diferença com projetos sociais verificados e transparentes. 
              Acreditamos que pequenos gestos podem gerar grandes transformações.
            </Text>
          </View>

          {/* Valores */}
          <View style={styles.section}>
            <View style={styles.iconHeader}>
              <Ionicons name="shield-checkmark" size={28} color={cores.verdeEscuro} />
              <Text style={styles.sectionTitle}>Nossos Valores</Text>
            </View>
            <View style={styles.valorItem}>
              <Ionicons name="checkmark-circle" size={20} color={cores.laranjaEscuro} />
              <Text style={styles.valorText}>
                <Text style={styles.valorBold}>Transparência:</Text> Todas as doações 
                são rastreáveis e os projetos prestam contas regularmente.
              </Text>
            </View>
            <View style={styles.valorItem}>
              <Ionicons name="checkmark-circle" size={20} color={cores.laranjaEscuro} />
              <Text style={styles.valorText}>
                <Text style={styles.valorBold}>Segurança:</Text> Seus dados e 
                transações estão protegidos com os mais altos padrões de segurança.
              </Text>
            </View>
            <View style={styles.valorItem}>
              <Ionicons name="checkmark-circle" size={20} color={cores.laranjaEscuro} />
              <Text style={styles.valorText}>
                <Text style={styles.valorBold}>Impacto:</Text> Focamos em projetos 
                verificados que geram impacto real nas comunidades.
              </Text>
            </View>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Nosso Impacto</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={32} color={cores.verdeEscuro} />
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel}>Doadores</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="folder" size={32} color={cores.verdeEscuro} />
                <Text style={styles.statNumber}>200+</Text>
                <Text style={styles.statLabel}>Projetos</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="cash" size={32} color={cores.verdeEscuro} />
                <Text style={styles.statNumber}>R$ 5M</Text>
                <Text style={styles.statLabel}>Arrecadados</Text>
              </View>
            </View>
          </View>

          {/* Equipe */}
          <View style={styles.section}>
            <View style={styles.iconHeader}>
              <Ionicons name="people" size={28} color={cores.verdeEscuro} />
              <Text style={styles.sectionTitle}>Equipe</Text>
            </View>
            <Text style={styles.sectionText}>
              Somos uma equipe apaixonada por tecnologia e impacto social, 
              trabalhando para tornar o mundo um lugar melhor através da 
              solidariedade e inovação.
            </Text>
          </View>

          {/* Redes Sociais */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Siga-nos nas redes sociais</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleOpenURL('https://instagram.com/bengoa')}
              >
                <Ionicons name="logo-instagram" size={28} color={cores.brancoTexto} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleOpenURL('https://facebook.com/bengoa')}
              >
                <Ionicons name="logo-facebook" size={28} color={cores.brancoTexto} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleOpenURL('https://twitter.com/bengoa')}
              >
                <Ionicons name="logo-twitter" size={28} color={cores.brancoTexto} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleOpenURL('https://linkedin.com/company/bengoa')}
              >
                <Ionicons name="logo-linkedin" size={28} color={cores.brancoTexto} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Links Legais */}
          <View style={styles.legalSection}>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>Termos de Uso</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>Política de Privacidade</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>Licenças de Código Aberto</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <Text style={styles.copyright}>
            © 2025 Bengoa. Todos os direitos reservados.
          </Text>
          <Text style={styles.madeWith}>
            Feito com <Ionicons name="heart" size={12} color={cores.laranjaEscuro} /> no Brasil
          </Text>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: cores.verdeEscuro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    ...fontes.merriweatherBold,
    fontSize: 32,
    color: cores.verdeEscuro,
    marginBottom: 5,
  },
  versao: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  tagline: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    color: cores.verdeEscuro,
    marginLeft: 10,
  },
  sectionText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  valorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  valorText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },
  valorBold: {
    ...fontes.montserratBold,
    color: cores.verdeEscuro,
  },
  statsSection: {
    backgroundColor: cores.verdeClaro,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  statsTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    color: cores.verdeEscuro,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    ...fontes.merriweatherBold,
    fontSize: 24,
    color: cores.verdeEscuro,
    marginTop: 10,
  },
  statLabel: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  socialSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  socialTitle: {
    ...fontes.montserratBold,
    fontSize: 16,
    marginBottom: 15,
    color: cores.verdeEscuro,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.verdeEscuro,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  legalSection: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  legalText: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
  },
  copyright: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  madeWith: {
    ...fontes.montserrat,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
});