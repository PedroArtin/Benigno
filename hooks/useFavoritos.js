// hooks/useFavoritos.js - CORRIGIDO COM VALIDAÇÃO
import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseconfig';
import { adicionarFavorito, removerFavorito, buscarFavoritos } from '../services/userService';
import { Alert } from 'react-native';

export const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosIds, setFavoritosIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  const carregarFavoritos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const dados = await buscarFavoritos(user.uid);
      setFavoritos(dados);
      
      // Criar Set com IDs dos favoritos para lookup rápido
      const ids = new Set(dados.map(fav => fav.projetoId).filter(Boolean));
      setFavoritosIds(ids);
      
      console.log('✅ Favoritos carregados:', ids.size);
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFavorito = (projetoId) => {
    if (!projetoId) return false;
    return favoritosIds.has(projetoId);
  };

  const toggleFavorito = async (projetoId, projeto = null) => {
    try {
      console.log('🟡 toggleFavorito INICIADO');
      console.log('🟡 projetoId:', projetoId);
      console.log('🟡 projeto:', projeto ? 'EXISTE' : 'NULL');
      
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Atenção', 'Você precisa estar logado para adicionar favoritos');
        return;
      }

      if (!projetoId) {
        console.error('❌ ID do projeto não fornecido');
        Alert.alert('Erro', 'Projeto inválido');
        return;
      }

      const jaEhFavorito = isFavorito(projetoId);
      console.log('🟡 É favorito?', jaEhFavorito);

      if (jaEhFavorito) {
        // Remover favorito
        const favorito = favoritos.find(f => f.projetoId === projetoId);
        if (favorito?.favoritoId) {
          await removerFavorito(user.uid, favorito.favoritoId);
          
          // Atualizar estado
          setFavoritos(prev => prev.filter(f => f.projetoId !== projetoId));
          setFavoritosIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(projetoId);
            return newSet;
          });
          
          console.log('✅ Favorito removido');
        }
      } else {
        // Adicionar favorito - VALIDAR DADOS
        console.log('➕ Tentando adicionar favorito...');
        
        if (!projeto) {
          console.error('❌ Dados do projeto não fornecidos');
          Alert.alert('Erro', 'Dados do projeto incompletos');
          return;
        }

        // CRÍTICO: Garantir que todos os campos necessários existem
        const dadosFavorito = {
          projetoId: projetoId, // USAR O ID PASSADO
          titulo: projeto.titulo || 'Sem título',
          descricao: projeto.descricao || 'Sem descrição',
          categoria: projeto.categoria || 'outros',
          instituicaoId: projeto.instituicaoId || '',
          instituicaoNome: projeto.instituicaoNome || 'Instituição',
          status: projeto.status || 'ativo',
          dataAdicao: new Date().toISOString(),
        };

        console.log('📋 Dados do favorito preparados:');
        console.log('  - projetoId:', dadosFavorito.projetoId);
        console.log('  - titulo:', dadosFavorito.titulo);
        console.log('  - categoria:', dadosFavorito.categoria);

        const favoritoId = await adicionarFavorito(user.uid, dadosFavorito);
        
        if (favoritoId) {
          // Atualizar estado
          const novoFavorito = {
            ...dadosFavorito,
            favoritoId: favoritoId,
          };
          
          setFavoritos(prev => [...prev, novoFavorito]);
          setFavoritosIds(prev => new Set(prev).add(projetoId));
          
          console.log('✅ Favorito adicionado');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao toggle favorito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar favorito');
    }
  };

  return {
    favoritos,
    isFavorito,
    toggleFavorito,
    totalFavoritos: favoritos.length,
    loading,
    recarregar: carregarFavoritos,
  };
};