// screens/Cadastro.js
import React from 'react';
import EntradaConta from '../components/TelaAcesso';

export default function Cadastro({ navigation }) {
  const handleLinkPress = () => {
    console.log('Navegando para Login...');
    navigation.navigate('Login');
  };

  return (
    <EntradaConta
      navigation={navigation}
      onLinkPress={handleLinkPress}
      titulo="Crie sua conta"
      subtitulo="Cadastre-se e comece a fazer a diferença"
      botaoTexto="Cadastrar"
      textoLink="Já tenho conta"
    />
  );
}