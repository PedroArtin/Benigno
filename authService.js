// authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseconfig';
import { useEffect, useState } from 'react';

// ============================================
// AUTENTICAÇÃO COM EMAIL E SENHA
// ============================================

/**
 * Registrar novo usuário com email e senha
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @param {string} nome - Nome do usuário (opcional)
 * @returns {Promise<Object>} Dados do usuário criado
 */
export const registerWithEmail = async (email, senha, nome = '') => {
  try {
    // Cria o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    
    // Atualiza o perfil com o nome
    if (nome) {
      await updateProfile(user, {
        displayName: nome,
      });
    }

    // Cria documento do usuário no Firestore
    try {
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: nome || 'Usuário',
        email: email,
        totalDoacoes: 0,
        totalFavoritos: 0,
        pontos: 0,
        dataCriacao: new Date().toISOString(),
      });
    } catch (firestoreError) {
      console.log('Não foi possível criar documento no Firestore:', firestoreError);
    }
    
    return user;
  } catch (error) {
    console.error('Erro ao registrar:', error);
    throw error;
  }
};

/**
 * Login com email e senha
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário autenticado
 */
export const loginWithEmail = async (email, senha) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

// ============================================
// LOGOUT
// ============================================

/**
 * Deslogar usuário
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

// ============================================
// GERENCIAMENTO DE PERFIL
// ============================================

/**
 * Atualizar perfil do usuário
 * @param {Object} updates - Objeto com as atualizações (displayName, photoURL)
 * @returns {Promise<Object>} Usuário atualizado
 */
export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Atualiza no Firebase Auth
    await updateProfile(user, updates);

    // Atualiza no Firestore se existir
    try {
      const userDocRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userDocRef, {
        nome: updates.displayName || user.displayName,
        ultimaAtualizacao: new Date().toISOString(),
      });
    } catch (firestoreError) {
      console.log('Não foi possível atualizar Firestore:', firestoreError);
    }

    return user;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

/**
 * Recuperar senha do usuário
 * @param {string} email - Email do usuário
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    throw error;
  }
};

// ============================================
// DADOS DO USUÁRIO
// ============================================

/**
 * Obter usuário atual
 * @returns {Object|null} Usuário atual ou null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Verificar se usuário está logado
 * @returns {boolean} True se logado, false caso contrário
 */
export const isUserLoggedIn = () => {
  return auth.currentUser !== null;
};

/**
 * Obter dados completos do usuário do Firestore
 * @param {string} uid - ID do usuário
 * @returns {Promise<Object|null>} Dados do usuário ou null
 */
export const getUserData = async (uid) => {
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return null;
  }
};

// ============================================
// HOOKS PERSONALIZADOS
// ============================================

/**
 * Hook para monitorar estado de autenticação
 * @returns {Object} { user, loading }
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};

// ============================================
// AUTENTICAÇÃO COM GOOGLE (OPCIONAL)
// ============================================

/**
 * Login com Google
 * Requer configuração adicional do expo-auth-session
 */
export const loginWithGoogle = async (idToken) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    // Verifica se é primeiro login e cria documento no Firestore
    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        nome: user.displayName || 'Usuário',
        email: user.email,
        foto: user.photoURL,
        totalDoacoes: 0,
        totalFavoritos: 0,
        pontos: 0,
        dataCriacao: new Date().toISOString(),
      });
    }

    return user;
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    throw error;
  }
};

// ============================================
// ESTATÍSTICAS E GAMIFICAÇÃO
// ============================================

/**
 * Atualizar estatísticas do usuário
 * @param {string} uid - ID do usuário
 * @param {Object} stats - Estatísticas a atualizar
 */
export const updateUserStats = async (uid, stats) => {
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    await updateDoc(userDocRef, stats);
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
    throw error;
  }
};

/**
 * Incrementar contador de doações
 * @param {string} uid - ID do usuário
 * 
 * IMPORTANTE: Usa FieldValue.increment() para evitar race conditions
 * Adiciona +1 na totalDoacoes e +10 nos pontos
 */
export const incrementarDoacoes = async (uid) => {
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    
    // Usar increment() para evitar race conditions e garantir atomicidade
    await updateDoc(userDocRef, {
      totalDoacoes: increment(1),    // +1 doação
      pontos: increment(10),         // +10 pontos
    });
    
    console.log('✅ Doações e pontos incrementados para usuário:', uid);
    return true;
  } catch (error) {
    console.error('❌ Erro ao incrementar doações:', error);
    throw error;
  }
};