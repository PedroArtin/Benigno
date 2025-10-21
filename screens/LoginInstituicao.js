// screens/LoginInstituicao.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { fontes, cores } from "../components/Global";
import { loginWithEmail, resetPassword } from "../authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig";

export default function LoginInstituicao({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
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
      const userCredential = await loginWithEmail(email.trim(), senha);
      
      const instRef = doc(db, 'instituicoes', userCredential.uid);
      const instDoc = await getDoc(instRef);

      if (!instDoc.exists()) {
        Alert.alert(
          "Erro",
          "Esta conta não é de uma instituição. Use o login de doador."
        );
        return;
      }

      navigation.replace("InstituicaoNavigator", {
        screen: "DashboardInstituicao",
      });
    } catch (erro) {
      console.error("Erro no login:", erro);
      let msg = "Ocorreu um erro. Tente novamente.";

      if (erro.code === "auth/invalid-credential") {
        msg = "E-mail ou senha incorretos.";
      } else if (erro.code === "auth/user-not-found") {
        msg = "Instituição não encontrada. Cadastre-se primeiro.";
      }

      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert("Digite seu e-mail", "Por favor, digite seu e-mail no campo acima.");
      return;
    }

    Alert.alert(
      "Recuperar Senha",
      `Enviar link para ${email}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            try {
              await resetPassword(email.trim());
              Alert.alert("E-mail Enviado! ✉️", "Verifique sua caixa de entrada.");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível enviar o e-mail.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.voltarBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
          </TouchableOpacity>

          <Ionicons
            name="business"
            size={80}
            color={cores.laranjaEscuro}
            style={styles.icon}
          />

          <Text style={styles.titulo}>Login Instituição</Text>
          <Text style={styles.subtexto}>
            Entre com a conta da sua instituição
          </Text>

          <View style={styles.containerForm}>
            <View style={styles.inputContainer}>
              <FontAwesome
                name="envelope"
                size={16}
                color={cores.placeholder}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="E-mail da instituição"
                placeholderTextColor={cores.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome
                name="lock"
                size={20}
                color={cores.placeholder}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={cores.placeholder}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                style={styles.eyeIcon}
              >
                <FontAwesome
                  name={mostrarSenha ? "eye" : "eye-slash"}
                  size={18}
                  color={cores.placeholder}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text style={styles.link}>Esqueci a senha</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.botao, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotao}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("CadastroInst")}
            style={styles.linkContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.link2}>Ainda não tenho cadastro</Text>
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Image
        source={require("../assets/wave-1.png")}
        style={styles.imagem}
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 200,
  },
  voltarBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  icon: {
    marginBottom: 20,
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
  linkContainer: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 999,
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
    zIndex: -1,
  },
});