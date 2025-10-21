// navigation/InstituicaoNavigator.js - VERSÃO CORRETA
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack'; // ← CORRIGIDO

import DashboardInstituicao from '../screens/DashboardInstituicao';
import DoacoesRecebidas from '../screens/instituicao/DoacoesRecebidas';
import EstatisticasInstituicao from '../screens/instituicao/EstatisticasInstituicao';
import MeusProjetos from '../screens/instituicao/MeusProjetos';
import CriarProjeto from '../screens/CriarProjeto';
// Adicione outras telas de instituição aqui

const Stack = createStackNavigator(); // ← CORRIGIDO

export default function InstituicaoNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="DashboardInstituicao" 
        component={DashboardInstituicao} 
      />
      <Stack.Screen 
        name="CriarProjeto" 
        component={CriarProjeto} 
      />
      <Stack.Screen 
        name="DoacoesRecebidas" 
        component={DoacoesRecebidas} 
      />
      <Stack.Screen 
        name="EstatisticasInstituicao" 
        component={EstatisticasInstituicao} 
      />
      <Stack.Screen 
        name="MeusProjetos" 
        component={MeusProjetos} 
      />
    </Stack.Navigator>
  );
}