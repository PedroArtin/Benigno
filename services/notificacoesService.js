// services/notificacoesService.js - VERSÃO COMPLETA E PRONTA
// ✅ COPIE E COLE ESTE ARQUIVO SUBSTITUINDO O SEU notificacoesService.js

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';

// ═════════════════════════════════════════════════════════════
// CRIAR NOTIFICAÇÕES (já existiam)
// ═════════════════════════════════════════════════════════════

/**
 * Criar notificação de doação com opção ONG buscar
 */
export const criarNotificacaoDoacaoBusca = async (dados) => {
  try {
    const notificacaoRef = await addDoc(collection(db, 'notificacoes'), {
      usuarioId: dados.usuarioId,
      instituicaoId: dados.instituicaoId,
      instituicaoNome: dados.instituicaoNome,
      doacaoId: dados.doacaoId,
      tipoNotificacao: 'ong_busca',
      titulo: `${dados.instituicaoNome} vai buscar sua doação!`,
      descricao: `Sua doação foi aceita e a ${dados.instituicaoNome} irá buscar no endereço fornecido.`,
      cep: dados.cep,
      endereco: dados.endereco,
      numero: dados.numero,
      complemento: dados.complemento,
      cidade: dados.cidade,
      estado: dados.estado,
      nomeProjeto: dados.nomeProjeto,
      itens: dados.itens,
      lida: false,
      dataCriacao: Timestamp.now(),
      dataLeitura: null,
    });

    console.log('✅ Notificação criada:', notificacaoRef.id);
    return { success: true, id: notificacaoRef.id };
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    return { success: false, error };
  }
};

/**
 * Criar notificação quando ONG confirma busca
 */
export const criarNotificacaoOngBuscou = async (usuarioId, dados) => {
  try {
    const notificacaoRef = await addDoc(collection(db, 'notificacoes'), {
      usuarioId: usuarioId,
      instituicaoId: dados.instituicaoId,
      instituicaoNome: dados.instituicaoNome,
      doacaoId: dados.doacaoId,
      tipoNotificacao: 'ong_buscou_confirmacao',
      titulo: `${dados.instituicaoNome} confirmou a busca! 🎉`,
      descricao: `A ${dados.instituicaoNome} passou para buscar sua doação. Obrigado!`,
      lida: false,
      dataCriacao: Timestamp.now(),
      dataLeitura: null,
    });

    console.log('✅ Notificação de confirmação criada:', notificacaoRef.id);
    return { success: true, id: notificacaoRef.id };
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    return { success: false, error };
  }
};

// ═════════════════════════════════════════════════════════════
// 🆕 NOVA SEÇÃO: CONFIRMAÇÃO DE COLETA PELO USUÁRIO
// ═════════════════════════════════════════════════════════════

/**
 * 🆕 NOVO: Criar notificação pedindo confirmação do usuário
 * Esta notificação é enviada DEPOIS que a ONG clica em "Confirmar Busca"
 * O usuário pode responder SIM (confirmou) ou NÃO (não houve coleta)
 */
export const criarNotificacaoConfirmacaoColetaUsuario = async (dados) => {
  try {
    console.log('📬 Criando notificação de confirmação para usuário');
    
    const notificacaoRef = await addDoc(collection(db, 'notificacoes'), {
      usuarioId: dados.doadorId, // ID do doador que vai receber
      instituicaoId: dados.instituicaoId,
      instituicaoNome: dados.instituicaoNome,
      doacaoId: dados.doacaoId,
      projetoId: dados.projetoId,
      projetoTitulo: dados.projetoTitulo,
      
      tipoNotificacao: 'confirmacao_coleta_usuario', // 🆕 Novo tipo
      
      titulo: '📦 Confirme a coleta da sua doação',
      descricao: `A ${dados.instituicaoNome} confirmou que realizou a coleta. Você pode confirmar que recebeu a visita?`,
      
      // Campos para resposta
      lida: false,
      respondida: false,
      respostaUsuario: null, // 'confirmado' ou 'negado'
      
      dataCriacao: Timestamp.now(),
      dataLeitura: null,
      dataResposta: null,
    });

    console.log('✅ Notificação de confirmação criada:', notificacaoRef.id);
    return { success: true, id: notificacaoRef.id };
  } catch (error) {
    console.error('❌ Erro ao criar notificação de confirmação:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 🆕 NOVO: Usuário responde à notificação de confirmação
 * 
 * @param {string} notificacaoId - ID da notificação
 * @param {string} doacaoId - ID da doação
 * @param {boolean} confirmou - true se confirmou, false se negou
 */
export const responderNotificacaoConfirmacao = async (notificacaoId, doacaoId, confirmou) => {
  try {
    console.log(`📝 Usuário ${confirmou ? 'CONFIRMOU' : 'NEGOU'} a coleta`);
    
    // 1. Atualizar notificação
    const notifRef = doc(db, 'notificacoes', notificacaoId);
    await updateDoc(notifRef, {
      respondida: true,
      respostaUsuario: confirmou ? 'confirmado' : 'negado',
      dataResposta: Timestamp.now(),
    });

    // 2. Atualizar status da doação
    const doacaoRef = doc(db, 'doacoes', doacaoId);
    
    if (confirmou) {
      // Usuário confirmou → doação concluída
      await updateDoc(doacaoRef, {
        status: 'recebida',
        usuarioConfirmouColeta: true,
        dataConfirmacaoUsuario: Timestamp.now(),
        dataAtualizacao: Timestamp.now(),
      });
      console.log('✅ Status atualizado para: recebida');
    } else {
      // Usuário negou → marcar como problemática
      await updateDoc(doacaoRef, {
        status: 'coleta_nao_confirmada',
        usuarioConfirmouColeta: false,
        motivoNaoConfirmacao: 'Doador informou que coleta não foi realizada',
        dataAtualizacao: Timestamp.now(),
      });
      console.log('⚠️ Status atualizado para: coleta_nao_confirmada');
    }

    return { success: true, confirmou };
  } catch (error) {
    console.error('❌ Erro ao responder notificação:', error);
    return { success: false, error: error.message };
  }
};

// ═════════════════════════════════════════════════════════════
// BUSCAR E GERENCIAR NOTIFICAÇÕES (já existiam)
// ═════════════════════════════════════════════════════════════

/**
 * Buscar notificações de um usuário
 */
export const buscarNotificacoesUsuario = async (usuarioId) => {
  try {
    const q = query(
      collection(db, 'notificacoes'),
      where('usuarioId', '==', usuarioId)
    );

    const snapshot = await getDocs(q);
    const notificacoes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordenar por data decrescente (mais recentes primeiro)
    notificacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    console.log(`✅ ${notificacoes.length} notificações encontradas`);
    return notificacoes;
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error);
    return [];
  }
};

/**
 * Marcar notificação como lida
 */
export const marcarNotificacaoComoLida = async (notificacaoId) => {
  try {
    const notifRef = doc(db, 'notificacoes', notificacaoId);
    await updateDoc(notifRef, {
      lida: true,
      dataLeitura: Timestamp.now(),
    });

    console.log('✅ Notificação marcada como lida');
    return true;
  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
    return false;
  }
};

/**
 * Deletar notificação
 */
export const deletarNotificacao = async (notificacaoId) => {
  try {
    const notifRef = doc(db, 'notificacoes', notificacaoId);
    await deleteDoc(notifRef);

    console.log('✅ Notificação deletada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar notificação:', error);
    return false;
  }
};

/**
 * Contar notificações não lidas
 */
export const contarNotificacoesNaoLidas = async (usuarioId) => {
  try {
    const q = query(
      collection(db, 'notificacoes'),
      where('usuarioId', '==', usuarioId),
      where('lida', '==', false)
    );

    const snapshot = await getDocs(q);
    const total = snapshot.size;

    console.log(`✅ Total de notificações não lidas: ${total}`);
    return total;
  } catch (error) {
    console.error('❌ Erro ao contar notificações:', error);
    return 0;
  }
};