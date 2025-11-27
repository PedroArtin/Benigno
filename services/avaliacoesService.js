// services/avaliacoesService.js - VERSÃO COMPLETA E PRONTA
// ✅ COPIE E COLE ESTE ARQUIVO SUBSTITUINDO O SEU avaliacoesService.js

import { db } from '../firebase/firebaseconfig';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc, 
  increment, 
  Timestamp 
} from 'firebase/firestore';

// ═════════════════════════════════════════════════════════════
// SALVAR AVALIAÇÃO
// ═════════════════════════════════════════════════════════════

/**
 * Salvar avaliação de uma ONG
 * 🆕 MODIFICADO: Agora atualiza média da instituição E do projeto
 */
export const salvarAvaliacao = async (dados) => {
  try {
    const avaliacoesRef = collection(db, 'avaliacoes');
    
    const docRef = await addDoc(avaliacoesRef, {
      ...dados,
      dataCriacao: Timestamp.now(),
    });

    console.log('✅ Avaliação salva:', docRef.id);

    // Atualizar média de avaliações da INSTITUIÇÃO
    await atualizarMediaAvaliacoes(dados.instituicaoId);

    // 🆕 NOVO: Atualizar média de avaliações do PROJETO específico
    if (dados.projetoId) {
      await atualizarMediaAvaliacoesProjeto(dados.projetoId);
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    throw error;
  }
};

// ═════════════════════════════════════════════════════════════
// MÉDIA E DESATIVAÇÃO - INSTITUIÇÃO (já existia)
// ═════════════════════════════════════════════════════════════

/**
 * Atualizar média de avaliações da INSTITUIÇÃO
 */
export const atualizarMediaAvaliacoes = async (instituicaoId) => {
  try {
    const avaliacoesRef = collection(db, 'avaliacoes');
    const q = query(avaliacoesRef, where('instituicaoId', '==', instituicaoId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const avaliacoes = snapshot.docs.map((d) => d.data());
    const mediaEstrelas = avaliacoes.reduce((acc, a) => acc + (a.estrelas || 0), 0) / avaliacoes.length;
    const totalAvaliacoes = avaliacoes.length;

    // Atualizar documento da instituição
    const instRef = doc(db, 'instituicoes', instituicaoId);
    await updateDoc(instRef, {
      mediaAvaliacoes: mediaEstrelas,
      totalAvaliacoes: totalAvaliacoes,
    });

    // Se média < 2 estrelas, desativar todos os projetos da instituição
    if (mediaEstrelas < 2) {
      await desativarProjetosInstituicao(instituicaoId);
    }

    return { mediaEstrelas, totalAvaliacoes };
  } catch (error) {
    console.error('Erro ao atualizar média de avaliações:', error);
    throw error;
  }
};

/**
 * Desativar todos os projetos de uma instituição
 */
export const desativarProjetosInstituicao = async (instituicaoId) => {
  try {
    const projetosRef = collection(db, 'projetos');
    const q = query(projetosRef, where('instituicaoId', '==', instituicaoId));
    const snapshot = await getDocs(q);

    const atualizacoes = snapshot.docs.map((docSnap) =>
      updateDoc(doc(db, 'projetos', docSnap.id), { ativo: false })
    );

    await Promise.all(atualizacoes);
    console.log('✅ Projetos desativados por baixa avaliação da instituição');
  } catch (error) {
    console.error('Erro ao desativar projetos:', error);
    throw error;
  }
};

// ═════════════════════════════════════════════════════════════
// 🆕 NOVA SEÇÃO: MÉDIA E DESATIVAÇÃO - PROJETO ESPECÍFICO
// ═════════════════════════════════════════════════════════════

/**
 * 🆕 NOVO: Calcular e atualizar média de avaliações de um PROJETO específico
 * (diferente da função acima que calcula da instituição inteira)
 */
export const atualizarMediaAvaliacoesProjeto = async (projetoId) => {
  try {
    console.log('📊 Calculando média do projeto:', projetoId);
    
    // Buscar todas as avaliações do projeto
    const avaliacoesRef = collection(db, 'avaliacoes');
    const q = query(avaliacoesRef, where('projetoId', '==', projetoId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('⚠️ Nenhuma avaliação encontrada para o projeto');
      return { success: true, media: 0, total: 0 };
    }

    // Calcular média
    const avaliacoes = snapshot.docs.map(d => d.data());
    const somaEstrelas = avaliacoes.reduce((acc, a) => acc + (a.estrelas || 0), 0);
    const totalAvaliacoes = avaliacoes.length;
    const mediaEstrelas = somaEstrelas / totalAvaliacoes;

    console.log(`📊 Média calculada: ${mediaEstrelas.toFixed(2)} (${totalAvaliacoes} avaliações)`);

    // Atualizar projeto com a média
    const projetoRef = doc(db, 'projetos', projetoId);
    await updateDoc(projetoRef, {
      mediaAvaliacoesProjeto: mediaEstrelas,
      totalAvaliacoesProjeto: totalAvaliacoes,
      ultimaAtualizacaoMediaProjeto: Timestamp.now(),
    });

    console.log('✅ Média do projeto atualizada no Firestore');

    // ⚠️ DESATIVAR PROJETO SE MÉDIA < 3 E TEM PELO MENOS 3 AVALIAÇÕES
    if (mediaEstrelas < 3 && totalAvaliacoes >= 3) {
      await desativarProjetoPorBaixaAvaliacao(projetoId, mediaEstrelas, totalAvaliacoes);
    }

    return { success: true, media: mediaEstrelas, total: totalAvaliacoes };
  } catch (error) {
    console.error('❌ Erro ao atualizar média do projeto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 🆕 NOVO: Desativar projeto específico por baixa avaliação
 * (diferente da função que desativa TODOS os projetos da instituição)
 */
const desativarProjetoPorBaixaAvaliacao = async (projetoId, media, totalAvaliacoes) => {
  try {
    console.log(`⚠️ DESATIVANDO projeto ${projetoId} - Média: ${media.toFixed(2)}`);
    
    const projetoRef = doc(db, 'projetos', projetoId);
    await updateDoc(projetoRef, {
      ativo: false,
      motivoDesativacao: 'baixa_avaliacao_projeto',
      mediaQuandoDesativado: media,
      totalAvaliacoesQuandoDesativado: totalAvaliacoes,
      desativadoPorBaixaAvaliacaoEm: Timestamp.now(),
    });

    console.log('✅ Projeto desativado por baixa avaliação');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao desativar projeto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 🆕 NOVO: Buscar avaliações de um projeto específico
 */
export const buscarAvaliacoesProjeto = async (projetoId) => {
  try {
    const avaliacoesRef = collection(db, 'avaliacoes');
    const q = query(avaliacoesRef, where('projetoId', '==', projetoId));
    const snapshot = await getDocs(q);

    const avaliacoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordenar por data (mais recentes primeiro)
    avaliacoes.sort((a, b) => {
      const dateA = a.dataCriacao?.toDate?.() || new Date(0);
      const dateB = b.dataCriacao?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    console.log(`✅ ${avaliacoes.length} avaliações do projeto encontradas`);
    return avaliacoes;
  } catch (error) {
    console.error('❌ Erro ao buscar avaliações do projeto:', error);
    return [];
  }
};

// ═════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES (já existiam)
// ═════════════════════════════════════════════════════════════

/**
 * Obter média de avaliações de uma instituição
 */
export const obterMediaAvaliacoes = async (instituicaoId) => {
  try {
    const instRef = doc(db, 'instituicoes', instituicaoId);
    const docSnap = await getDoc(instRef);

    if (!docSnap.exists()) return { media: 0, total: 0 };

    const data = docSnap.data();
    return {
      media: data.mediaAvaliacoes || 0,
      total: data.totalAvaliacoes || 0,
    };
  } catch (error) {
    console.error('Erro ao obter média de avaliações:', error);
    return { media: 0, total: 0 };
  }
};

/**
 * Obter classificação (ranking) baseada em pontuação
 * Bronze: 0-99, Prata: 100-199, Ouro: 200-299, Diamante: 300-399, Platina: 400+
 */
export const obterClassificacao = (pontos) => {
  if (pontos >= 400) return { nome: 'Platina', cor: '#E5E4E2', nivel: 5 };
  if (pontos >= 300) return { nome: 'Diamante', cor: '#B9F2FF', nivel: 4 };
  if (pontos >= 200) return { nome: 'Ouro', cor: '#FFD700', nivel: 3 };
  if (pontos >= 100) return { nome: 'Prata', cor: '#C0C0C0', nivel: 2 };
  return { nome: 'Bronze', cor: '#CD7F32', nivel: 1 };
};

/**
 * Adicionar pontos à instituição por doação recebida
 */
export const adicionarPontosInstituicao = async (instituicaoId, pontos = 10) => {
  try {
    const instRef = doc(db, 'instituicoes', instituicaoId);
    await updateDoc(instRef, {
      pontos: increment(pontos),
    });
    return true;
  } catch (error) {
    console.error('Erro ao adicionar pontos à instituição:', error);
    return false;
  }
};