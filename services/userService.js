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

// ============================================
// PERFIL DO USUÁRIO
// ============================================

/**
 * Buscar perfil do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object|null>} Dados do perfil ou null
 */
export const buscarPerfilUsuario = async (userId) => {
  try {
    const perfilRef = doc(db, 'usuarios', userId);
    const perfilSnap = await getDoc(perfilRef);
    
    if (perfilSnap.exists()) {
      return perfilSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

/**
 * Criar perfil do usuário
 * @param {string} userId - ID do usuário
 * @param {Object} dadosUsuario - Dados iniciais do usuário
 * @returns {Promise<Object>} Dados do perfil criado
 */
export const criarPerfilUsuario = async (userId, dadosUsuario) => {
  try {
    const perfilData = {
      nome: dadosUsuario.nome || 'Usuário',
      email: dadosUsuario.email,
      foto: dadosUsuario.foto || null,
      telefone: '',
      bio: '',
      pontos: 0,
      dataCriacao: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
    };
    
    const perfilRef = doc(db, 'usuarios', userId);
    await setDoc(perfilRef, perfilData);
    
    return perfilData;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    throw error;
  }
};

/**
 * Atualizar perfil do usuário
 * @param {string} userId - ID do usuário
 * @param {Object} dadosAtualizacao - Dados a atualizar
 * @returns {Promise<void>}
 */
export const atualizarPerfil = async (userId, dadosAtualizacao) => {
  try {
    const perfilRef = doc(db, 'usuarios', userId);
    await setDoc(perfilRef, {
      ...dadosAtualizacao,
      dataAtualizacao: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

// ============================================
// ESTATÍSTICAS DO USUÁRIO
// ============================================

/**
 * Buscar estatísticas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Estatísticas (doacoes, favoritos, pontos)
 */
export const buscarEstatisticas = async (userId) => {
  try {
    // Contar doações
    const qDoacoes = query(
      collection(db, 'doacoes'),
      where('doadorId', '==', userId)
    );
    const snapshotDoacoes = await getDocs(qDoacoes);
    const totalDoacoes = snapshotDoacoes.size;
    
    // Contar favoritos
    const qFavoritos = query(
      collection(db, 'favoritos'),
      where('userId', '==', userId)
    );
    const snapshotFavoritos = await getDocs(qFavoritos);
    const totalFavoritos = snapshotFavoritos.size;
    
    // Buscar pontos do perfil
    let pontos = 0;
    try {
      const perfilRef = doc(db, 'usuarios', userId);
      const perfilSnap = await getDoc(perfilRef);
      if (perfilSnap.exists()) {
        pontos = perfilSnap.data().pontos || 0;
      }
    } catch (e) {
      // Silencioso se não encontrar
    }
    
    return {
      doacoes: totalDoacoes,
      favoritos: totalFavoritos,
      pontos: pontos,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      doacoes: 0,
      favoritos: 0,
      pontos: 0,
    };
  }
};