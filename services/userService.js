// services/userService.js - CORRIGIDO COM VALIDAÇÃO
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';

// ============================================
// FAVORITOS
// ============================================

/**
 * Adicionar projeto aos favoritos
 * @param {string} userId - ID do usuário
 * @param {object} dadosProjeto - Dados do projeto (TODOS OS CAMPOS OBRIGATÓRIOS)
 */
export const adicionarFavorito = async (userId, dadosProjeto) => {
  try {
    console.log('💾 adicionarFavorito INICIADO');
    console.log('💾 userId:', userId);
    console.log('💾 dadosProjeto:', JSON.stringify(dadosProjeto, null, 2));
    
    // VALIDAÇÃO CRÍTICA - Garantir que todos os campos existem
    if (!dadosProjeto) {
      throw new Error('dadosProjeto é obrigatório');
    }
    
    if (!dadosProjeto.projetoId) {
      console.error('❌ projetoId ausente em dadosProjeto:', dadosProjeto);
      throw new Error('Campo projetoId é obrigatório');
    }
    
    if (!dadosProjeto.titulo) {
      console.error('❌ titulo ausente em dadosProjeto:', dadosProjeto);
      throw new Error('Campo titulo é obrigatório');
    }

    const favoritoRef = doc(collection(db, 'favoritos'));
    
    const dadosFavorito = {
      userId: userId,
      projetoId: String(dadosProjeto.projetoId), // CONVERTER PARA STRING
      titulo: String(dadosProjeto.titulo || 'Sem título'),
      descricao: String(dadosProjeto.descricao || ''),
      categoria: String(dadosProjeto.categoria || 'outros'),
      instituicaoId: String(dadosProjeto.instituicaoId || ''),
      instituicaoNome: String(dadosProjeto.instituicaoNome || ''),
      status: String(dadosProjeto.status || 'ativo'),
      dataAdicao: Timestamp.now(),
    };

    console.log('💾 Dados finais para salvar:', JSON.stringify(dadosFavorito, null, 2));

    await setDoc(favoritoRef, dadosFavorito);
    
    console.log('✅ Favorito salvo com ID:', favoritoRef.id);
    return favoritoRef.id;
  } catch (error) {
    console.error('❌ Erro ao adicionar favorito:', error);
    console.error('❌ Stack:', error.stack);
    throw error;
  }
};

/**
 * Remover favorito
 */
export const removerFavorito = async (userId, favoritoId) => {
  try {
    const favoritoRef = doc(db, 'favoritos', favoritoId);
    await deleteDoc(favoritoRef);
    console.log('✅ Favorito removido:', favoritoId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover favorito:', error);
    throw error;
  }
};

/**
 * Buscar favoritos do usuário
 */
export const buscarFavoritos = async (userId) => {
  try {
    const q = query(
      collection(db, 'favoritos'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const favoritos = snapshot.docs.map(doc => ({
      favoritoId: doc.id,
      ...doc.data(),
    }));
    
    console.log(`✅ ${favoritos.length} favoritos encontrados`);
    return favoritos;
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos:', error);
    return [];
  }
};

/**
 * Verificar se projeto é favorito
 */
export const verificarFavorito = async (userId, projetoId) => {
  try {
    const q = query(
      collection(db, 'favoritos'),
      where('userId', '==', userId),
      where('projetoId', '==', projetoId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Erro ao verificar favorito:', error);
    return false;
  }
};