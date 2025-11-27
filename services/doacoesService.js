// services/doacoesService.js - VERSÃO COMPLETA E PRONTA
// ✅ COPIE E COLE ESTE ARQUIVO SUBSTITUINDO O SEU doacoesService.js

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
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';
import { criarNotificacaoConfirmacaoColetaUsuario } from './notificacoesService'; // 🆕 NOVO IMPORT

// ═════════════════════════════════════════════════════════════
// CRIAR/SALVAR DOAÇÃO (já existiam)
// ═════════════════════════════════════════════════════════════

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

// ═════════════════════════════════════════════════════════════
// BUSCAR DOAÇÕES (SEM ORDERBY - NÃO PRECISA ÍNDICE)
// ═════════════════════════════════════════════════════════════

/**
 * Buscar doações por instituição
 */
export const buscarDoacoesPorInstituicao = async (instituicaoId) => {
  try {
    const q = query(
      collection(db, 'doacoes'),
      where('instituicaoId', '==', instituicaoId)
    );
    
    const snapshot = await getDocs(q);
    const doacoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Ordenar no cliente (não precisa de índice)
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
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

    // Ordenar no cliente
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
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

    // Ordenar no cliente e pegar só as 10 mais recentes
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
    });

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
    const q = query(
      collection(db, 'doacoes'),
      where('doadorId', '==', doadorId)
    );
    
    const snapshot = await getDocs(q);
    const doacoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Ordenar no cliente
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
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

// ═════════════════════════════════════════════════════════════
// ATUALIZAR STATUS (já existiam)
// ═════════════════════════════════════════════════════════════

/**
 * Confirmar recebimento da doação
 */
export const confirmarRecebimento = async (doacaoId) => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    
    const doacaoSnap = await getDoc(doacaoRef);
    if (!doacaoSnap.exists()) {
      throw new Error('Doação não encontrada');
    }
    
    const doacao = doacaoSnap.data();
    const projetoId = doacao.projetoId;
    const instituicaoId = doacao.instituicaoId;
    
    await updateDoc(doacaoRef, {
      status: 'recebida',
      dataRecebimento: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
    });
    
    if (projetoId) {
      const projetoRef = doc(db, 'projetos', projetoId);
      await updateDoc(projetoRef, {
        doacoesRecebidas: increment(1),
      });
      console.log('✅ doacoesRecebidas incrementada no projeto:', projetoId);
    }
    
    if (instituicaoId) {
      const instRef = doc(db, 'instituicoes', instituicaoId);
      await updateDoc(instRef, {
        pontos: increment(10),
      });
      console.log('✅ +10 pontos adicionados à instituição:', instituicaoId);
    }
    
    console.log('✅ Doação confirmada como recebida');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao confirmar recebimento:', error);
    return { success: false, error };
  }
};

/**
 * Buscar doações pendentes de busca pela ONG
 */
export const buscarDoacoesPendenteBusca = async (instituicaoId) => {
  try {
    const q = query(
      collection(db, 'doacoes'),
      where('instituicaoId', '==', instituicaoId),
      where('status', '==', 'pendente_busca')
    );
    
    const snapshot = await getDocs(q);
    const doacoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    doacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(a.dataCriacao || 0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(b.dataCriacao || 0);
      return dateB - dateA;
    });
    
    console.log(`✅ ${doacoes.length} doações pendentes de busca encontradas`);
    return doacoes;
  } catch (error) {
    console.error('❌ Erro ao buscar doações pendentes de busca:', error);
    return [];
  }
};

/**
 * 🔄 MODIFICADO: Confirmar que a ONG fez a busca
 * Agora envia notificação para o usuário confirmar
 */
export const confirmarBuscaDoacao = async (doacaoId) => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    
    // Buscar dados da doação
    const doacaoSnap = await getDoc(doacaoRef);
    if (!doacaoSnap.exists()) {
      throw new Error('Doação não encontrada');
    }
    
    const doacao = doacaoSnap.data();
    const projetoId = doacao.projetoId;
    const instituicaoId = doacao.instituicaoId;
    const doadorId = doacao.doadorId;
    
    // Atualizar status para 'buscado'
    await updateDoc(doacaoRef, {
      status: 'buscado',
      dataBusca: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
    });
    
    // Incrementar contagem de doações do projeto
    if (projetoId) {
      const projetoRef = doc(db, 'projetos', projetoId);
      await updateDoc(projetoRef, {
        doacoesRecebidas: increment(1),
      });
      console.log('✅ doacoesRecebidas incrementada no projeto:', projetoId);
    }
    
    // Incrementar pontos da instituição
    if (instituicaoId) {
      const instRef = doc(db, 'instituicoes', instituicaoId);
      await updateDoc(instRef, {
        pontos: increment(10),
      });
      console.log('✅ +10 pontos adicionados à instituição:', instituicaoId);
    }
    
    // 🆕 NOVO: Criar notificação para o doador confirmar
    try {
      // Buscar nome da instituição
      const instDoc = await getDoc(doc(db, 'instituicoes', instituicaoId));
      const instituicaoNome = instDoc.exists() ? instDoc.data().nome : 'Instituição';
      
      await criarNotificacaoConfirmacaoColetaUsuario({
        doadorId: doadorId,
        instituicaoId: instituicaoId,
        instituicaoNome: instituicaoNome,
        doacaoId: doacaoId,
        projetoId: projetoId,
        projetoTitulo: doacao.projetoTitulo || 'Projeto',
      });
      
      console.log('✅ Notificação de confirmação enviada ao doador');
    } catch (notifError) {
      console.error('⚠️ Erro ao criar notificação (não crítico):', notifError);
      // Não falhar a operação se notificação falhar
    }
    
    console.log('✅ Doação confirmada como buscada');
    return { success: true, doadorId };
  } catch (error) {
    console.error('❌ Erro ao confirmar busca:', error);
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
      status: 'aguardando_confirmacao_usuario',
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
 * Usuário confirma que a ONG realmente coletou a doação
 */
export const confirmarColetaPeloUsuario = async (doacaoId, usuarioId) => {
  try {
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    
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

// ═════════════════════════════════════════════════════════════
// DETALHES E ESTATÍSTICAS (já existiam)
// ═════════════════════════════════════════════════════════════

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

// ═════════════════════════════════════════════════════════════
// 🆕 NOVA SEÇÃO: VALIDAÇÃO DE CEP
// ═════════════════════════════════════════════════════════════

/**
 * 🆕 NOVO: Validar formato de CEP (8 dígitos)
 */
export const validarCEP = (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
};

/**
 * 🆕 NOVO: Formatar CEP com hífen (00000-000)
 */
export const formatarCEP = (text) => {
  const numeros = text.replace(/\D/g, '');
  if (numeros.length <= 5) {
    return numeros;
  }
  return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
};