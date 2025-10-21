// screens/Login.js
import React from 'react';
import EntradaConta from '../components/TelaAcesso';

export default function Login({ navigation }) {
  const handleLinkPress = () => {
    console.log('Navegando para Cadastro...');
    navigation.navigate('Cadastro');
  };

  return (
    <EntradaConta
      navigation={navigation}
      onLinkPress={handleLinkPress}
      titulo="Bem-vindo de volta!"
      subtitulo="Entre na sua conta e continue ajudando pessoas"
      botaoTexto="Entrar"
      textoLink="Ainda não tenho conta"
    />
  );
}