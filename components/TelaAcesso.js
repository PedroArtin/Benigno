// components/TelaAcesso.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { fontes, cores } from "./Global";
import { registerWithEmail, loginWithEmail, resetPassword } from "../authService";

export default function TelaAcesso({
  titulo,
  subtitulo,
  botaoTexto,
  textoLink,
  onLinkPress,
  navigation,
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Detecta se é tela de cadastro ou login
  const isCadastro = 
    botaoTexto?.toLowerCase().includes("cadastrar") || 
    botaoTexto?.toLowerCase().includes("criar");

  // Validação de email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Ação principal (Login ou Cadastro)
  const handleSubmit = async () => {
    // Validações
    if (!email.trim() || !senha.trim() || (isCadastro && !nome.trim())) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert("Erro", "Digite um e-mail válido!");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    try {
      setLoading(true);

      if (isCadastro) {
        // CADASTRO
        await registerWithEmail(email.trim(), senha, nome.trim());
        
        Alert.alert(
          "Sucesso! 🎉",
          "Sua conta foi criada com sucesso! Faça login para continuar.",
          [
            {
              text: "OK",
              onPress: () => {
                // Limpa os campos
                setNome("");
                setEmail("");
                setSenha("");
                // Navega para login
                if (navigation) {
                  navigation.navigate("Login");
                }
              },
            },
          ]
        );
      } else {
        // LOGIN
        await loginWithEmail(email.trim(), senha);
        
        // Navega para Home
        if (navigation) {
          navigation.replace("Home");
        }
      }
    } catch (erro) {
      console.error("Erro:", erro);
      
      let msg = "Ocorreu um erro. Tente novamente.";

      // Mensagens de erro personalizadas
      if (erro.code === "auth/email-already-in-use") {
        msg = "Este e-mail já está em uso.";
      } else if (erro.code === "auth/invalid-email") {
        msg = "E-mail inválido.";
      } else if (erro.code === "auth/weak-password") {
        msg = "A senha deve ter pelo menos 6 caracteres.";
      } else if (erro.code === "auth/invalid-credential") {
        msg = "E-mail ou senha incorretos.";
      } else if (erro.code === "auth/user-not-found") {
        msg = "Usuário não encontrado. Crie uma conta primeiro.";
      } else if (erro.code === "auth/wrong-password") {
        msg = "Senha incorreta.";
      } else if (erro.code === "auth/network-request-failed") {
        msg = "Erro de conexão. Verifique sua internet.";
      } else if (erro.code === "auth/too-many-requests") {
        msg = "Muitas tentativas. Tente novamente mais tarde.";
      }

      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  // Recuperar senha
  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert(
        "Digite seu e-mail",
        "Por favor, digite seu e-mail no campo acima para recuperar sua senha."
      );
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert("Erro", "Digite um e-mail válido!");
      return;
    }

    Alert.alert(
      "Recuperar Senha",
      `Enviar link de recuperação para ${email}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Enviar",
          onPress: async () => {
            try {
              await resetPassword(email.trim());
              Alert.alert(
                "E-mail Enviado! ✉️",
                "Verifique sua caixa de entrada e siga as instruções para redefinir sua senha."
              );
            } catch (error) {
              console.error("Erro ao recuperar senha:", error);
              Alert.alert(
                "Erro",
                "Não foi possível enviar o e-mail. Verifique se o e-mail está correto."
              );
            }
          },
        },
      ]
    );
  };

  // Handler para o link - com log para debug
  const handleLinkClick = () => {
    console.log("Link clicado! Chamando onLinkPress...");
    if (onLinkPress) {
      onLinkPress();
    } else {
      console.warn("onLinkPress não está definido!");
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={style.keyboardView}
      >
        <ScrollView
          contentContainerStyle={style.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={style.titulo}>{titulo}</Text>
          <Text style={style.subtexto}>{subtitulo}</Text>

          <View style={style.containerForm}>
            {/* Campo nome - só no cadastro */}
            {isCadastro && (
              <View style={style.inputContainer}>
                <FontAwesome
                  name="user"
                  size={18}
                  color={cores.placeholder}
                  style={style.inputIcon}
                />
                <TextInput
                  style={style.input}
                  placeholder="Nome completo"
                  placeholderTextColor={cores.placeholder}
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Campo email */}
            <View style={style.inputContainer}>
              <FontAwesome
                name="envelope"
                size={16}
                color={cores.placeholder}
                style={style.inputIcon}
              />
              <TextInput
                style={style.input}
                placeholder="E-mail"
                placeholderTextColor={cores.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Campo senha */}
            <View style={style.inputContainer}>
              <FontAwesome
                name="lock"
                size={20}
                color={cores.placeholder}
                style={style.inputIcon}
              />
              <TextInput
                style={style.input}
                placeholder="Senha"
                placeholderTextColor={cores.placeholder}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                style={style.eyeIcon}
              >
                <FontAwesome
                  name={mostrarSenha ? "eye" : "eye-slash"}
                  size={18}
                  color={cores.placeholder}
                />
              </TouchableOpacity>
            </View>

            {/* Link esqueci senha - só no login */}
            {!isCadastro && (
              <TouchableOpacity 
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={style.link}>Esqueci a senha</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botão principal */}
          <TouchableOpacity
            style={[style.botao, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={style.textoBotao}>
              {loading ? "Aguarde..." : botaoTexto}
            </Text>
          </TouchableOpacity>

          {/* Linha "ou" */}
          <View style={style.linhaComTexto}>
            <View style={style.linha} />
            <Text style={style.texto}>ou</Text>
            <View style={style.linha} />
          </View>

          {/* Botão Google */}
          <View style={style.containerBtnLogo}>
            <TouchableOpacity
              style={style.botaoConta}
              onPress={() => Alert.alert("Em breve", "Login com Google em desenvolvimento")}
              activeOpacity={0.8}
            >
              <FontAwesome name="google" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Link para trocar entre login/cadastro - CORRIGIDO */}
          <TouchableOpacity 
            onPress={handleLinkClick} 
            style={style.linkContainer}
            activeOpacity={0.7}
          >
            <Text style={style.link2}>{textoLink}</Text>
          </TouchableOpacity>

          {/* Espaçamento extra para não ficar atrás da imagem */}
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Imagem de fundo */}
      <Image 
        source={require("../assets/wave-1.png")} 
        style={style.imagem} 
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingBottom: 200, // Espaço extra para a imagem de fundo
  },
  titulo: {
    ...fontes.merriweatherBold,
    fontSize: 32,
    marginBottom: 5,
    textAlign: "center",
  },
  subtexto: {
    ...fontes.montserrat,
    fontSize: 16,
    marginHorizontal: 20,
    textAlign: "center",
    marginBottom: 50,
    color: "#666",
  },
  containerForm: {
    width: 300,
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 300,
    height: 48,
    marginBottom: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 18,
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    ...fontes.montserrat,
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  eyeIcon: {
    padding: 5,
  },
  link: {
    ...fontes.montserratMedium,
    color: cores.verdeEscuro,
    textAlign: "right",
    marginTop: 5,
  },
  botao: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    width: 300,
    borderRadius: 30,
    height: 50,
    backgroundColor: cores.verdeEscuro,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotao: {
    ...fontes.montserratBold,
    fontSize: 18,
    textAlign: "center",
    color: cores.brancoTexto,
  },
  linhaComTexto: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
    marginHorizontal: 40,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: "#858585",
  },
  texto: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#666",
    ...fontes.montserrat,
  },
  botaoConta: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: cores.laranjaMedio,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  containerBtnLogo: {
    width: 300,
    height: 60,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  linkContainer: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 999, // Garante que fique acima da imagem
    elevation: 999,
  },
  link2: {
    ...fontes.montserratMedium,
    color: cores.verdeEscuro,
    textDecorationLine: "underline",
    fontSize: 16,
  },
  imagem: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 170,
    resizeMode: "cover",
    zIndex: -1, // Garante que fique atrás do conteúdo
  },
});