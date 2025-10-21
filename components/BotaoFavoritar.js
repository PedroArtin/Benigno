// components/BotaoFavoritar.js - COM DEBUG INTENSIVO
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from './Global';

export default function BotaoFavoritar({ 
  projetoId, 
  isFavorito, 
  onToggle, 
  projeto,
  size = 24,
  style = {} 
}) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    
    console.log('🔴 BotaoFavoritar - CLICADO');
    console.log('🔴 projetoId recebido:', projetoId);
    console.log('🔴 projeto recebido:', projeto ? 'SIM' : 'NÃO');
    console.log('🔴 projeto.id:', projeto?.id);
    console.log('🔴 isFavorito:', isFavorito);
    
    if (!projetoId) {
      console.error('❌ BotaoFavoritar: projetoId é obrigatório!');
      return;
    }
    
    if (!projeto) {
      console.error('❌ BotaoFavoritar: projeto é obrigatório!');
      return;
    }
    
    setLoading(true);
    try {
      // CRÍTICO: Passar o ID correto
      const idParaUsar = projetoId || projeto.id;
      console.log('🟢 ID que será usado:', idParaUsar);
      
      await onToggle(idParaUsar, projeto);
      console.log('✅ Toggle favorito concluído');
    } catch (error) {
      console.error('❌ Erro no BotaoFavoritar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TouchableOpacity style={[styles.button, style]} disabled>
        <ActivityIndicator size="small" color={cores.laranjaEscuro} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFavorito ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorito ? cores.laranjaEscuro : '#999'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});