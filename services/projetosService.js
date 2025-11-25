// services/projetosService.js - VERSÃO COMPLETA E TESTADA
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  deleteDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';

console.log('✅ projetosService.js carregado!');

// ============================================
// PROJETOS
// ============================================

/**
 * Criar novo projeto
 */
export const criarProjeto = async (projetoData) => {
  try {
    console.log('📝 Criando projeto...', projetoData);
    
    const docRef = await addDoc(collection(db, 'projetos'), {
      ...projetoData,
      arrecadado: 0,
      doacoesRecebidas: 0,
      dataCriacao: serverTimestamp(),
      ativo: true,
    });

    console.log('✅ Projeto criado com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar projeto:', error);
    console.error('Detalhes:', error.message, error.code);
    throw error;
  }
};

/**
 * Buscar todos os projetos ativos
 */
export const buscarProjetosAtivos = async () => {
  try {
    console.log('🔍 Buscando projetos ativos...');
    
    const q = query(
      collection(db, 'projetos'),
      where('ativo', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const projetos = [];

    querySnapshot.forEach((doc) => {
      projetos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Ordenar no lado do cliente
    projetos.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
    });

    console.log(`✅ ${projetos.length} projetos ativos encontrados`);
    return projetos;
  } catch (error) {
    console.error('❌ Erro ao buscar projetos:', error);
    return [];
  }
};

/**
 * Buscar projetos de uma instituição específica
 */
export const buscarProjetosInstituicao = async (instituicaoId) => {
  try {
    console.log('🔍 Buscando projetos da instituição:', instituicaoId);
    
    const q = query(
      collection(db, 'projetos'),
      where('instituicaoId', '==', instituicaoId)
    );

    const querySnapshot = await getDocs(q);
    const projetos = [];

    querySnapshot.forEach((doc) => {
      projetos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Ordenar no lado do cliente
    projetos.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
    });

    console.log(`✅ ${projetos.length} projetos da instituição encontrados`);
    return projetos;
  } catch (error) {
    console.error('❌ Erro ao buscar projetos da instituição:', error);
    return [];
  }
};

/**
 * Buscar projeto por ID
 */
export const buscarProjetoPorId = async (projetoId) => {
  try {
    console.log('🔍 Buscando projeto:', projetoId);
    
    const docRef = doc(db, 'projetos', projetoId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('✅ Projeto encontrado');
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }

    console.log('⚠️ Projeto não encontrado');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar projeto:', error);
    return null;
  }
};

/**
 * Atualizar projeto
 */
export const atualizarProjeto = async (projetoId, dados) => {
  try {
    console.log('📝 Atualizando projeto:', projetoId);
    
    const docRef = doc(db, 'projetos', projetoId);
    await updateDoc(docRef, {
      ...dados,
      ultimaAtualizacao: serverTimestamp(),
    });
    
    console.log('✅ Projeto atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar projeto:', error);
    throw error;
  }
};

/**
 * Deletar projeto
 */
export const deletarProjeto = async (projetoId) => {
  try {
    console.log('🗑️ Deletando projeto:', projetoId);
    
    const docRef = doc(db, 'projetos', projetoId);
    await deleteDoc(docRef);
    
    console.log('✅ Projeto deletado');
  } catch (error) {
    console.error('❌ Erro ao deletar projeto:', error);
    throw error;
  }
};

/**
 * Desativar projeto (soft delete)
 */
export const desativarProjeto = async (projetoId) => {
  try {
    console.log('🔒 Desativando projeto:', projetoId);
    
    const docRef = doc(db, 'projetos', projetoId);
    await updateDoc(docRef, {
      ativo: false,
      dataDesativacao: serverTimestamp(),
    });
    
    console.log('✅ Projeto desativado');
  } catch (error) {
    console.error('❌ Erro ao desativar projeto:', error);
    throw error;
  }
};

// ============================================
// DOAÇÕES
// ============================================

/**
 * Buscar doações de um projeto
 */
export const buscarDoacoesProjeto = async (projetoId) => {
  try {
    console.log('🔍 Buscando doações do projeto:', projetoId);
    
    const q = query(
      collection(db, 'doacoes'),
      where('projetoId', '==', projetoId)
    );

    const querySnapshot = await getDocs(q);
    const doacoes = [];

    querySnapshot.forEach((doc) => {
      doacoes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Ordenar no lado do cliente
    doacoes.sort((a, b) => {
      const dateA = a.dataDoacao?.toDate?.() || new Date(a.dataDoacao || 0);
      const dateB = b.dataDoacao?.toDate?.() || new Date(b.dataDoacao || 0);
      return dateB - dateA;
    });

    console.log(`✅ ${doacoes.length} doações encontradas`);
    return doacoes;
  } catch (error) {
    console.error('❌ Erro ao buscar doações do projeto:', error);
    return [];
  }
};

/**
 * Buscar doações recebidas por uma instituição
 */
export const buscarDoacoesInstituicao = async (instituicaoId) => {
  try {
    console.log('🔍 Buscando doações da instituição:', instituicaoId);
    
    const q = query(
      collection(db, 'doacoes'),
      where('instituicaoId', '==', instituicaoId)
    );

    const querySnapshot = await getDocs(q);
    const doacoes = [];

    querySnapshot.forEach((doc) => {
      doacoes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Ordenar no lado do cliente
    doacoes.sort((a, b) => {
      const dateA = a.dataDoacao?.toDate?.() || new Date(a.dataDoacao || 0);
      const dateB = b.dataDoacao?.toDate?.() || new Date(b.dataDoacao || 0);
      return dateB - dateA;
    });

    console.log(`✅ ${doacoes.length} doações encontradas`);
    return doacoes;
  } catch (error) {
    console.error('❌ Erro ao buscar doações da instituição:', error);
    return [];
  }
};

/**
 * Buscar doações feitas por um usuário
 */
export const buscarMinhasDoacoes = async (doadorId) => {
  try {
    console.log('🔍 Buscando doações do usuário:', doadorId);
    
    const q = query(
      collection(db, 'doacoes'),
      where('doadorId', '==', doadorId)
    );

    const querySnapshot = await getDocs(q);
    const doacoes = [];

    querySnapshot.forEach((doc) => {
      doacoes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Ordenar no lado do cliente
    doacoes.sort((a, b) => {
      const dateA = a.dataDoacao?.toDate?.() || new Date(a.dataDoacao || 0);
      const dateB = b.dataDoacao?.toDate?.() || new Date(b.dataDoacao || 0);
      return dateB - dateA;
    });

    console.log(`✅ ${doacoes.length} doações encontradas`);
    return doacoes;
  } catch (error) {
    console.error('❌ Erro ao buscar minhas doações:', error);
    return [];
  }
};

/**
 * Buscar estatísticas de doações do usuário
 */
export const buscarEstatisticasDoacao = async (userId) => {
  try {
    console.log('📊 Buscando estatísticas do usuário:', userId);
    
    const doacoes = await buscarMinhasDoacoes(userId);
    
    // Agrupar por mês
    const doacoesPorMes = {};
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    meses.forEach(mes => {
      doacoesPorMes[mes] = 0;
    });

    doacoes.forEach(doacao => {
      if (doacao.dataDoacao) {
        const data = doacao.dataDoacao?.toDate?.() || new Date(doacao.dataDoacao);
        const mes = meses[data.getMonth()];
        doacoesPorMes[mes]++;
      }
    });

    // Agrupar por categoria
    const doacoesPorCategoria = {};
    doacoes.forEach(doacao => {
      const cat = doacao.categoria || 'Outros';
      doacoesPorCategoria[cat] = (doacoesPorCategoria[cat] || 0) + 1;
    });

    console.log('✅ Estatísticas calculadas');
    return {
      totalDoacoes: doacoes.length,
      doacoesPorMes,
      doacoesPorCategoria,
      doacoes,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    throw error;
  }
};

/**
 * Atualizar status da doação
 */
export const atualizarStatusDoacao = async (doacaoId, novoStatus) => {
  try {
    console.log('📝 Atualizando status da doação:', doacaoId, '→', novoStatus);
    
    const docRef = doc(db, 'doacoes', doacaoId);
    
    const updateData = {
      status: novoStatus,
    };

    if (novoStatus === 'entregue' || novoStatus === 'confirmado') {
      updateData.dataEntrega = serverTimestamp();
    }

    await updateDoc(docRef, updateData);
    console.log('✅ Status atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar status da doação:', error);
    throw error;
  }
};

/**
 * Cancelar doação
 */
export const cancelarDoacao = async (doacaoId, motivo = '') => {
  try {
    console.log('🚫 Cancelando doação:', doacaoId);
    
    const docRef = doc(db, 'doacoes', doacaoId);
    await updateDoc(docRef, {
      status: 'cancelado',
      motivoCancelamento: motivo,
      dataCancelamento: serverTimestamp(),
    });
    
    console.log('✅ Doação cancelada');
  } catch (error) {
    console.error('❌ Erro ao cancelar doação:', error);
    throw error;
  }
};

// ============================================
// FAVORITOS
// ============================================

/**
 * Adicionar projeto aos favoritos
 */
export const adicionarFavorito = async (userId, projetoId) => {
  try {
    console.log('⭐ Adicionando aos favoritos:', projetoId);
    
    const favoritoRef = collection(db, 'favoritos');
    await addDoc(favoritoRef, {
      userId,
      projetoId,
      dataAdicionado: serverTimestamp(),
    });
    
    console.log('✅ Adicionado aos favoritos');
  } catch (error) {
    console.error('❌ Erro ao adicionar favorito:', error);
    throw error;
  }
};

/**
 * Remover projeto dos favoritos
 */
export const removerFavorito = async (userId, projetoId) => {
  try {
    console.log('💔 Removendo dos favoritos:', projetoId);
    
    const favoritosRef = collection(db, 'favoritos');
    const q = query(
      favoritosRef,
      where('userId', '==', userId),
      where('projetoId', '==', projetoId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    console.log('✅ Removido dos favoritos');
  } catch (error) {
    console.error('❌ Erro ao remover favorito:', error);
    throw error;
  }
};

/**
 * Verificar se projeto está nos favoritos
 */
export const verificarFavorito = async (userId, projetoId) => {
  try {
    const favoritosRef = collection(db, 'favoritos');
    const q = query(
      favoritosRef,
      where('userId', '==', userId),
      where('projetoId', '==', projetoId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Erro ao verificar favorito:', error);
    return false;
  }
};

/**
 * Buscar todos os favoritos do usuário
 */
export const buscarFavoritos = async (userId) => {
  try {
    console.log('⭐ Buscando favoritos do usuário:', userId);
    
    const favoritosRef = collection(db, 'favoritos');
    const q = query(
      favoritosRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const favoritosIds = [];
    
    querySnapshot.forEach((doc) => {
      favoritosIds.push(doc.data().projetoId);
    });
    
    // Buscar os projetos favoritos
    if (favoritosIds.length === 0) {
      console.log('✅ Nenhum favorito encontrado');
      return [];
    }
    
    // Buscar detalhes dos projetos favoritos
    const projetosFavoritos = [];
    for (const projetoId of favoritosIds) {
      const projeto = await buscarProjetoPorId(projetoId);
      if (projeto && projeto.ativo) {
        projetosFavoritos.push(projeto);
      }
    }
    
    // Ordenar por data
    projetosFavoritos.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
    });
    
    console.log(`✅ ${projetosFavoritos.length} favoritos encontrados`);
    return projetosFavoritos;
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos:', error);
    return [];
  }
};