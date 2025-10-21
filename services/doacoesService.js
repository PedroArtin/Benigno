// services/doacoesService.js - VERSÃO FINAL SEM ERRO DE ÍNDICE
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';

// ============================================
// CRIAR/SALVAR DOAÇÃO
// ============================================

/**
 * Salvar nova doação (usado pelo FormularioDoacao)
 */
export const salvarDoacao = async (dadosDoacao) => {
  try {
    const doacaoRef = await addDoc(collection(db, 'doacoes'), {
      ...dadosDoacao,
      dataCriacao: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
    });
    
    console.log('✅ Doação salva com ID:', doacaoRef.id);
    return { success: true, id: doacaoRef.id };
  } catch (error) {
    console.error('❌ Erro ao salvar doação:', error);
    return { success: false, error };
  }
};

/**
 * Criar doação (compatibilidade com código antigo)
 */
export const criarDoacao = async (doacaoData) => {
  try {
    const docRef = await addDoc(collection(db, 'doacoes'), {
      ...doacaoData,
      status: doacaoData.status || 'pendente',
      dataDoacao: Timestamp.now(),
      dataColeta: null,
      dataCancelamento: null,
    });

    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar doação:', error);
    throw error;
  }
};

// ============================================
// BUSCAR DOAÇÕES (SEM ORDERBY - NÃO PRECISA ÍNDICE)
// ============================================

/**
 * Buscar doações por instituição
 */
export const buscarDoacoesPorInstituicao = async (instituicaoId) => {
  try {
    // REMOVIDO orderBy para não precisar de índice
    const q = query(
      collection(db, 'doacoes'),
      where('instituicaoId', '==', instituicaoId)
    );
    
    const snapshot = await getDocs(q);
    const doacoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // ORDENAR NO CLIENTE (não precisa de índice)
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA; // Mais recente primeiro
    });
    
    console.log(`✅ ${doacoes.length} doações encontradas para instituição`);
    return doacoes;
  } catch (error) {
    console.error('❌ Erro ao buscar doações:', error);
    return [];
  }
};

/**
 * Buscar doações por instituição com filtro de status
 */
export const buscarDoacoesInstituicao = async (instituicaoId, statusFiltro = null) => {
  try {
    let q;

    // REMOVIDO orderBy para não precisar de índice
    if (statusFiltro) {
      q = query(
        collection(db, 'doacoes'),
        where('instituicaoId', '==', instituicaoId),
        where('status', '==', statusFiltro)
      );
    } else {
      q = query(
        collection(db, 'doacoes'),
        where('instituicaoId', '==', instituicaoId)
      );
    }

    const querySnapshot = await getDocs(q);
    const doacoes = [];

    querySnapshot.forEach((doc) => {
      doacoes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // ORDENAR NO CLIENTE (não precisa de índice)
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA; // Mais recente primeiro
    });

    console.log(`✅ ${doacoes.length} doações encontradas e ordenadas`);
    return doacoes;
  } catch (error) {
    console.error('Erro ao buscar doações:', error);
    return [];
  }
};

/**
 * Buscar doações recentes (últimas 10)
 */
export const buscarDoacoesRecentes = async (instituicaoId) => {
  try {
    // REMOVIDO orderBy e limit, vamos ordenar no cliente
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

    // ORDENAR NO CLIENTE e pegar só as 10 mais recentes
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
    });

    // Retornar só as 10 primeiras
    const doacoesRecentes = doacoes.slice(0, 10);
    console.log(`✅ ${doacoesRecentes.length} doações recentes encontradas`);
    return doacoesRecentes;
  } catch (error) {
    console.error('Erro ao buscar doações recentes:', error);
    return [];
  }
};

/**
 * Buscar doações do usuário/doador
 */
export const buscarDoacoesPorDoador = async (doadorId) => {
  try {
    // REMOVIDO orderBy para não precisar de índice
    const q = query(
      collection(db, 'doacoes'),
      where('doadorId', '==', doadorId)
    );
    
    const snapshot = await getDocs(q);
    const doacoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // ORDENAR NO CLIENTE (não precisa de índice)
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA; // Mais recente primeiro
    });
    
    console.log(`✅ ${doacoes.length} doações do usuário encontradas`);
    return doacoes;
  } catch (error) {
    console.error('❌ Erro ao buscar doações do usuário:', error);
    return [];
  }
};

/**
 * Buscar minhas doações (compatibilidade)
 */
export const buscarMinhasDoacoes = async (doadorId) => {
  return buscarDoacoesPorDoador(doadorId);
};

// ============================================
// ATUALIZAR STATUS
// ============================================

/**
 * Confirmar recebimento da doação
 */
export const confirmarRecebimento = async (doacaoId) => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    await updateDoc(doacaoRef, {
      status: 'recebida',
      dataRecebimento: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
    });
    
    console.log('✅ Doação confirmada como recebida');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao confirmar recebimento:', error);
    return { success: false, error };
  }
};

/**
 * Marcar doação como coletada (ONG coletou, aguarda confirmação do usuário)
 */
export const marcarComoColetado = async (doacaoId, instituicaoId) => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    await updateDoc(doacaoRef, {
      status: 'aguardando_confirmacao_usuario', // 🆕 Aguarda usuário confirmar
      dataColeta: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
    });

    console.log('✅ Doação marcada como coletada - aguardando confirmação do usuário');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao marcar como coletado:', error);
    return { success: false, error };
  }
};

/**
 * 🆕 Usuário confirma que a ONG realmente coletou a doação
 */
export const confirmarColetaPeloUsuario = async (doacaoId, usuarioId) => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    
    // Verificar se a doação pertence ao usuário
    const doacaoDoc = await getDoc(doacaoRef);
    if (!doacaoDoc.exists()) {
      throw new Error('Doação não encontrada');
    }
    
    const doacao = doacaoDoc.data();
    if (doacao.doadorId !== usuarioId) {
      throw new Error('Esta doação não pertence a você');
    }
    
    if (doacao.status !== 'aguardando_confirmacao_usuario') {
      throw new Error('Esta doação não está aguardando confirmação');
    }
    
    // Confirmar coleta
    await updateDoc(doacaoRef, {
      status: 'recebida',
      dataConfirmacaoUsuario: Timestamp.now(),
      dataRecebimento: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
    });
    
    console.log('✅ Usuário confirmou que a doação foi coletada');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao confirmar coleta:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Atualizar status da doação
 */
export const atualizarStatusDoacao = async (doacaoId, novoStatus) => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    await updateDoc(doacaoRef, {
      status: novoStatus,
      dataAtualizacao: Timestamp.now(),
    });
    
    console.log('✅ Status da doação atualizado');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    return { success: false, error };
  }
};

/**
 * Cancelar doação
 */
export const cancelarDoacao = async (doacaoId, instituicaoId = null, motivo = '') => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    await updateDoc(doacaoRef, {
      status: 'cancelada',
      motivoCancelamento: motivo,
      dataCancelamento: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
    });
    
    console.log('✅ Doação cancelada');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao cancelar doação:', error);
    return { success: false, error };
  }
};

// ============================================
// DETALHES
// ============================================

/**
 * Buscar detalhes de uma doação
 */
export const buscarDetalhesDoacao = async (doacaoId) => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    const doacaoDoc = await getDoc(doacaoRef);

    if (doacaoDoc.exists()) {
      return {
        id: doacaoDoc.id,
        ...doacaoDoc.data(),
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar detalhes da doação:', error);
    return null;
  }
};

// ============================================
// ESTATÍSTICAS
// ============================================

/**
 * Buscar estatísticas das doações
 */
export const buscarEstatisticasDoacoes = async (instituicaoId) => {
  try {
    const doacoes = await buscarDoacoesPorInstituicao(instituicaoId);
    
    const stats = {
      total: doacoes.length,
      pendentes: doacoes.filter(d => d.status === 'pendente').length,
      aguardando: doacoes.filter(d => d.status === 'aguardando_confirmacao').length,
      recebidas: doacoes.filter(d => d.status === 'recebida').length,
      canceladas: doacoes.filter(d => d.status === 'cancelada').length,
    };

    // Doações deste mês
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    stats.mesAtual = doacoes.filter(d => {
      if (!d.dataCriacao) return false;
      const data = d.dataCriacao.toDate ? d.dataCriacao.toDate() : new Date(d.dataCriacao);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).length;

    return stats;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      total: 0,
      pendentes: 0,
      aguardando: 0,
      recebidas: 0,
      canceladas: 0,
      mesAtual: 0,
    };
  }
};