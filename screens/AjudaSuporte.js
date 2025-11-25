// screens/AjudaSuporte.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';

export default function AjudaSuporte({ navigation }) {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      pergunta: 'Como faço uma doação?',
      resposta: 'Para fazer uma doação, navegue até a página inicial, escolha um projeto e clique em "Doar Agora". Você será direcionado para uma página segura de pagamento onde poderá escolher o valor e a forma de pagamento.',
    },
    {
      id: 2,
      pergunta: 'Minha doação é segura?',
      resposta: 'Sim! Todas as transações são processadas através de gateways de pagamento certificados e criptografados. Seus dados financeiros estão completamente protegidos.',
    },
    {
      id: 3,
      pergunta: 'Como funcionam os pontos?',
      resposta: 'Você ganha 10 pontos para cada doação realizada. Os pontos podem ser usados para desbloquear benefícios exclusivos e badges especiais no aplicativo.',
    },
    {
      id: 4,
      pergunta: 'Posso cancelar uma doação?',
      resposta: 'Doações recorrentes podem ser canceladas a qualquer momento nas configurações. Doações únicas já processadas não podem ser canceladas, mas você pode entrar em contato conosco para casos especiais.',
    },
    {
      id: 5,
      pergunta: 'Como adicionar um projeto?',
      resposta: 'Se você representa uma instituição e deseja adicionar um projeto, entre em contato através do e-mail parceiros@bengoa.com.br. Nossa equipe analisará sua solicitação.',
    },
  ];

  const handleOpenURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir este link');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao abrir o link');
    }
  };

  const handleEnviarEmail = () => {
    handleOpenURL('mailto:suporte@benigno.com.br?subject=Preciso de Ajuda');
  };

  const handleAbrirWhatsApp = () => {
    handleOpenURL('https://wa.me/5513988601880?text=Olá, preciso de ajuda com o app Benigno');
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Contato Rápido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entre em Contato</Text>
            
            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleEnviarEmail}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color={cores.brancoTexto} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>E-mail</Text>
                <Text style={styles.contactText}>suporte@benigno.com.br</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleAbrirWhatsApp}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#25D366' }]}>
                <Ionicons name="logo-whatsapp" size={24} color={cores.brancoTexto} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>WhatsApp</Text>
                <Text style={styles.contactText}>(13) 98860-1880</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => handleOpenURL('tel:08007776666')}
            >
              <View style={[styles.contactIcon, { backgroundColor: cores.laranjaEscuro }]}>
                <Ionicons name="call" size={24} color={cores.brancoTexto} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Telefone</Text>
                <Text style={styles.contactText}>0800 777 6666</Text>
                <Text style={styles.contactSubtext}>
                  Seg a Sex, 9h às 18h
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Perguntas Frequentes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
            
            {faqs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <Text style={styles.faqPergunta}>{faq.pergunta}</Text>
                  <Ionicons
                    name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={cores.verdeEscuro}
                  />
                </TouchableOpacity>
                {expandedFAQ === faq.id && (
                  <Text style={styles.faqResposta}>{faq.resposta}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Links Úteis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Links Úteis</Text>

            <TouchableOpacity style={styles.linkItem}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={cores.verdeEscuro}
              />
              <Text style={styles.linkText}>Central de Ajuda Online</Text>
              <Ionicons name="open-outline" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem}>
              <Ionicons
                name="videocam-outline"
                size={24}
                color={cores.verdeEscuro}
              />
              <Text style={styles.linkText}>Tutoriais em Vídeo</Text>
              <Ionicons name="open-outline" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem}>
              <Ionicons
                name="chatbubbles-outline"
                size={24}
                color={cores.verdeEscuro}
              />
              <Text style={styles.linkText}>Comunidade</Text>
              <Ionicons name="open-outline" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Reportar Problema */}
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => Alert.alert('Reportar', 'Funcionalidade em desenvolvimento')}
          >
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color={cores.brancoTexto}
            />
            <Text style={styles.reportButtonText}>Reportar um Problema</Text>
          </TouchableOpacity>

          {/* Informações */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={cores.verdeEscuro} />
            <Text style={styles.infoText}>
              Nossa equipe de suporte está disponível de segunda a sexta, das 9h às 18h. 
              Geralmente respondemos em até 24 horas úteis.
            </Text>
          </View>
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    marginBottom: 15,
    color: cores.verdeEscuro,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.brancoTexto,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: cores.verdeEscuro,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    ...fontes.montserratBold,
    fontSize: 14,
    marginBottom: 3,
  },
  contactText: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
  },
  contactSubtext: {
    ...fontes.montserrat,
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  faqItem: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  faqPergunta: {
    ...fontes.montserratBold,
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  faqResposta: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 15,
    paddingBottom: 15,
    lineHeight: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.brancoTexto,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  linkText: {
    ...fontes.montserrat,
    fontSize: 14,
    flex: 1,
    marginLeft: 15,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.verdeEscuro,
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  reportButtonText: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.brancoTexto,
    marginLeft: 10,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: cores.verdeClaro,
    padding: 15,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    ...fontes.montserrat,
    fontSize: 13,
    color: cores.verdeEscuro,
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },
});