# 🧹 ARQUIVOS PARA DELETAR

Estes arquivos são duplicados ou não utilizados e devem ser deletados manualmente no Git:

## 1. ❌ `screens/perfilUser.js`
**Motivo**: É uma cópia idêntica de `screens/Perfil.js`
**Status**: TabRoutes.js já foi corrigido para importar `Perfil.js`
**Ação**: DELETE

---

## 2. ❌ `Global.js` (arquivo na raiz)
**Motivo**: É na verdade um arquivo de Estatísticas duplicado (nome enganoso)
**Status**: `screens/Estatisticas.js` é a versão correta
**Ação**: DELETE

---

## ✅ DELETAR VIA GIT

```bash
git rm screens/perfilUser.js
git rm Global.js
git commit -m "Remove: arquivos duplicados (perfilUser.js e Global.js)"
```

Ou se preferir deletar manualmente via explorador de arquivos, depois faça:

```bash
git add -A
git commit -m "Remove: arquivos duplicados"
```

---

## 📋 Resumo das mudanças realizadas:

✅ **userService.js** - Adicionadas 4 funções essenciais:
  - buscarPerfilUsuario()
  - criarPerfilUsuario()
  - buscarEstatisticas()
  - atualizarPerfil()

✅ **projetosService.js** - Removida função duplicada `criarDoacao()`

✅ **TabRoutes.js** - Corrigida importação de `perfilUser` → `Perfil`

✅ **ListaProjetos.js** - Corrigida importação e chamada de `buscarTodosProjetos()` → `buscarProjetosAtivos()`
