// services/avaliacoesService.js
import { db } from '../firebase/firebaseconfig';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, increment } from 'firebase/firestore';

/**
 * Salvar avaliação de uma ONG
 */
export const salvarAvaliacao = async (dados) => {
  try {
    const avaliacoesRef = collection(db, 'avaliacoes');
    
    const docRef = await addDoc(avaliacoesRef, {
      ...dados,
      dataCriacao: new Date().toISOString(),
    });

    // Atualizar média de avaliações da instituição
    await atualizarMediaAvaliacoes(dados.instituicaoId);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    throw error;
  }
};

/**
 * Atualizar média de avaliações e desativar projeto se necessário
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
    console.log('✅ Projetos desativados por baixa avaliação');
  } catch (error) {
    console.error('Erro ao desativar projetos:', error);
    throw error;
  }
};

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
