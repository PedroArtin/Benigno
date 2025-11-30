import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// ============================================
// ONBOARDING
// ============================================
import Introducao from '../screens/Introducao';
import PExplicacao from '../screens/PExplicacao';
import SExplicacao from '../screens/SExplicacao';

// ============================================
// AUTENTICAÇÃO
// ============================================
import EscolhaDeFuncao from '../screens/EscolhaDeFuncao';
import Login from '../screens/Login';
import Cadastro from '../screens/Cadastro';
import LoginInstituicao from '../screens/LoginInstituicao';
import CadastroInst from '../screens/CadastroInst';

// ============================================
// APP PRINCIPAL
// ============================================
import TabRoutes from './TabRoutes';
import InstituicaoNavigator from '../navigation/InstituicaoNavigator';

// ============================================
// DOAÇÕES E PROJETOS
// ============================================
import DetalhesProjeto from '../screens/DetalhesProjeto';
import MinhasDoacoes from '../screens/MinhasDoacoes';
import FormularioDoacao from '../screens/FormularioDoacao';

// ============================================
// PERFIL E CONFIGURAÇÕES
// ============================================
import EditarPerfil from '../screens/EditarPerfil';
import Enderecos from '../screens/Enderecos';
import Notificacoes from '../screens/Notificacoes';
import HistoricoAtividades from '../screens/HistoricoAtividades';
import Privacidade from '../screens/Privacidade';
import AjudaSuporte from '../screens/AjudaSuporte';
import SobreApp from '../screens/SobreApp';

// ============================================
// INSTITUIÇÕES
// ============================================
import DashboardInstituicao from '../screens/DashboardInstituicao';
import CriarProjeto from '../screens/CriarProjeto';

const Stack = createStackNavigator();

// RECEBENDO A PROPRIEDADE initialRoute
export default function StackRoutes({ initialRoute }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      // USA A ROTA QUE O APP MANDAR, SE NÃO TIVER USA INTRODUCAO
      initialRouteName={initialRoute || "Introducao"}
    >
      {/* ===== ONBOARDING ===== */}
      <Stack.Screen name="Introducao" component={Introducao} />
      <Stack.Screen name="PExplicacao" component={PExplicacao} />
      <Stack.Screen name="SExplicacao" component={SExplicacao} />
      
      {/* ===== ESCOLHA DE FUNÇÃO ===== */}
      <Stack.Screen name="EscolhaDeFuncao" component={EscolhaDeFuncao} />
      
      {/* ===== AUTENTICAÇÃO ===== */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="LoginInstituicao" component={LoginInstituicao} />
      <Stack.Screen name="CadastroInst" component={CadastroInst} />
      
      {/* ===== APP PRINCIPAL (TABS) ===== */}
      <Stack.Screen name="Home" component={TabRoutes} />
      
      {/* ===== DOAÇÕES E PROJETOS ===== */}
      <Stack.Screen name="DetalhesProjeto" component={DetalhesProjeto} />
      <Stack.Screen name="FormularioDoacao" component={FormularioDoacao} />
      <Stack.Screen name="MinhasDoacoes" component={MinhasDoacoes} />
      
      {/* ===== PERFIL E CONFIGURAÇÕES ===== */}
      <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
      <Stack.Screen name="Enderecos" component={Enderecos} />
      <Stack.Screen name="Notificacoes" component={Notificacoes} />
      <Stack.Screen name="HistoricoAtividades" component={HistoricoAtividades} />
      <Stack.Screen name="Privacidade" component={Privacidade} />
      <Stack.Screen name="AjudaSuporte" component={AjudaSuporte} />
      <Stack.Screen name="SobreApp" component={SobreApp} />
      
      {/* ===== INSTITUIÇÕES ===== */}
      <Stack.Screen name="InstituicaoNavigator" component={InstituicaoNavigator} />
    </Stack.Navigator>
  );
}