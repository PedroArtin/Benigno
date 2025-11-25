# Documentação de Implementação - Benigno TCC

**Versão**: 1.0  
**Data**: Novembro 25, 2025  
**Branch**: `feat/instituicao-fixes`  
**Status**: Pronto para apresentação de TCC

---

## Sumário Executivo

O projeto **Benigno** é um aplicativo React Native para gerenciamento de doações entre usuários e ONGs/Instituições. Durante o desenvolvimento deste TCC, foram implementadas as seguintes features críticas e correções:

1. ⭐ **Sistema de Avaliações (5 Estrelas)** - Doadores avaliam ONGs após doações
2. 📊 **Pontuação e Ranking** - ONGs ganham pontos por doações recebidas
3. 🔄 **Auto-Desativação de Projetos** - Projetos desativam se avaliação média < 2
4. 🛡️ **Guardas de Autenticação** - Guards completos em todas as telas com auth.currentUser
5. 📈 **Estatísticas Robustas** - Contadores com proteção contra divisão por zero e Timestamps inválidos

---

## 1. Sistema de Avaliações (5 Estrelas)

### O Que Foi Implementado

#### Serviço de Avaliações (`services/avaliacoesService.js`)
```javascript
// Funções principais:
- salvarAvaliacao(dados)          // Salva avaliação no Firestore
- atualizarMediaAvaliacoes(inst)  // Recalcula média e desativa se necessário
- desativarProjetosInstituicao(inst)  // Auto-desativa projetos com média < 2
- obterMediaAvaliacoes(inst)      // Obtém média atual
- obterClassificacao(pontos)      // Mapeia pontos para ranking (Bronze → Platina)
- adicionarPontosInstituicao(inst)    // Adiciona +10 pontos por doação
```

#### Modal de Avaliação no Formulário de Doação
- Após doação bem-sucedida, modal exibe 5 estrelas clicáveis
- Usuário seleciona estrelas e opcionalmente adiciona comentário
- Dados salvos em coleção `avaliacoes` do Firestore

#### Fluxo de Integração
1. Usuário completa formulário de doação
2. Doação salva em `doacoes` collection
3. Modal de avaliação aparece automaticamente
4. Usuário avalia (1-5 estrelas) e comenta (opcional)
5. Avaliação salva em `avaliacoes` collection
6. `atualizarMediaAvaliacoes()` recalcula média da ONG

### Configuração no Firestore

**Collection: `avaliacoes`**
```json
{
  "id": "auto-gerado",
  "doacaoId": "ref para doacao",
  "doadorId": "uid do doador",
  "instituicaoId": "uid da ONG",
  "projetoId": "id do projeto",
  "estrelas": 4,
  "comentario": "Ótima instituição!",
  "dataCriacao": Timestamp.now()
}
```

**Collection: `instituicoes` (campos adicionados)**
```json
{
  "mediaAvaliacoes": 4.2,
  "totalAvaliacoes": 5,
  "pontos": 50,
  "pontuacao": 50
}
```

---

## 2. Pontuação e Ranking

### Sistema de Pontos

**Regra**: +10 pontos por doação recebida e confirmada

#### Incremento de Pontos
- Quando ONG marca doação como "Entregue" em `DoacoesRecebidas`
- `doacoesService.confirmarRecebimento()` chama `adicionarPontosInstituicao(instituicaoId, 10)`
- Usa `FieldValue.increment(10)` para operação atômica no Firestore

#### Para Doadores
- +10 pontos por doação realizada
- Chamado por `authService.incrementarDoacoes(uid)` após salvar doação

### Classificação por Pontos (Ranking)

Função: `obterClassificacao(pontos)` retorna:

| Rank | Pontos | Cor | Icon |
|------|--------|-----|------|
| Bronze | 50-149 | `#CD7F32` | 🥉 |
| Prata | 150-299 | `#C0C0C0` | 🥈 |
| Ouro | 300-499 | `#FFD700` | 🥇 |
| Diamante | 500-999 | `#00D9FF` | 💎 |
| Platina | 1000+ | `#E5E4E2` | 👑 |

### Exibição de Badges

- **Perfil da ONG** (`screens/perfilInstituicao.js`): Badge sob nome da ONG
- **Perfil do Usuário** (`screens/perfilUser.js`): Badge no card de Pontos
- **Perfil Público da ONG** (`screens/DetalhesProjeto.js`): Badge visível em public profile

---

## 3. Auto-Desativação de Projetos

### Lógica

Quando um projeto recebe uma avaliação:
1. Sistema recalcula **média de todas as avaliações** da ONG
2. Se **média < 2.0 estrelas**:
   - Todos os projetos da ONG são marcados como `ativo: false`
   - Usuários não podem mais fazer doações para esses projetos
   - Logs indicam: "Projeto desativado por média de avaliações < 2"

### Implementação

```javascript
// services/avaliacoesService.js
async function desativarProjetosInstituicao(instituicaoId) {
  const media = await obterMediaAvaliacoes(instituicaoId);
  if (media < 2.0) {
    // Atualizar todos projetos da ONG: ativo = false
    const projetos = await getDocs(
      query(collection(db, 'projetos'), 
            where('instituicaoId', '==', instituicaoId))
    );
    // Batch update cada projeto
  }
}
```

---

## 4. Guardas de Autenticação (auth.currentUser)

### O Que Foi Corrigido

**Problema**: Vários screens acessavam `auth.currentUser` sem validação, causando crashes se usuário estava deslogado.

**Solução**: Adicionar guard em **14+ arquivos**:

```javascript
const user = auth.currentUser;
if (!user) {
  console.warn('Usuário não autenticado em [TELA]');
  Alert.alert('Sessão expirada', 'Faça login novamente', [
    { text: 'OK', onPress: () => navigation.replace('Login') },
  ]);
  return;
}
```

### Arquivos Corrigidos

**Screens de Usuário**:
- `screens/Perfil.js`
- `screens/Estatisticas.js`
- `screens/HistoricoAtividades.js`
- `screens/FormularioDoacao.js`
- `screens/perfilUser.js`
- `screens/Enderecos.js`
- `screens/Favoritos.js`
- `screens/MinhasDoacoes.js`
- `screens/Notificacoes.js` (usuário)
- `screens/Privacidade.js`
- `screens/CriarProjeto.js`

**Screens de Instituição**:
- `screens/instituicao/DashboardInstituicao.js`
- `screens/instituicao/EstatisticasInstituicao.js`
- `screens/instituicao/DoacoesRecebidas.js`
- `screens/instituicao/HistoricoAtividades.js`
- `screens/instituicao/MeusProjetos.js`
- `screens/instituicao/Notificacoes.js`
- `screens/instituicao/CriarProjeto.js`

### Comportamento

- Se `auth.currentUser === null`:
  - Mostra alert "Sessão expirada"
  - Redireciona para `Login` (usuários) ou `LoginInstituicao` (ONGs)
  - Não causa crash ou erro não tratado

---

## 5. Estatísticas Robustas

### Correções em `EstatisticasInstituicao.js`

#### 5.1 Proteção contra Divisão por Zero
```javascript
// Antes: Math.round(doacoes.length / projetos.length)
// Depois:
const mediaDocoesProj = projetos.length > 0 
  ? Math.round(doacoes.length / projetos.length * 100) / 100
  : 0;
```

#### 5.2 Validação de Timestamps
```javascript
if (d.dataDoacao) {
  try {
    const data = d.dataDoacao.toDate 
      ? d.dataDoacao.toDate() 
      : new Date(d.dataDoacao);
    
    // Validar data
    if (!isNaN(data.getTime())) {
      // Use data...
    }
  } catch (e) {
    console.warn('Erro ao parsear data:', e);
  }
}
```

#### 5.3 Proteção contra Status Inválido
```javascript
const doacoesPorStatus = { 
  pendente: 0, 
  confirmada: 0, 
  entregue: 0,
  recebida: 0,
  cancelada: 0 
};

doacoes.forEach((d) => {
  // Validar status antes de incrementar
  if (d.status && doacoesPorStatus.hasOwnProperty(d.status)) {
    doacoesPorStatus[d.status]++;
  }
});
```

#### 5.4 Inicialização Segura
```javascript
setStats({
  totalProjetos: projetos.length || 0,
  projetosAtivos: projetosAtivos || 0,
  totalDoacoes: doacoes.length || 0,
  mediaDocoesProj,
  pontuacao: pontuacao || 0,
});
```

---

## 6. Fluxos Implementados

### Fluxo 1: Doação com Avaliação
```
Usuário (Login)
  ↓
Navegar para Projeto
  ↓
Preencher FormularioDoacao
  ↓
Salvar Doação → incrementarDoacoes(uid) → +10 pontos usuário
  ↓
Modal de Avaliação (5 estrelas)
  ↓
Avaliar + Salvar
  ↓
salvarAvaliacao() → atualizarMediaAvaliacoes()
  ↓
Se média < 2: desativarProjetosInstituicao()
```

### Fluxo 2: ONG Confirma Recebimento
```
ONG (LoginInstituicao)
  ↓
Abrir DoacoesRecebidas
  ↓
Clicar "Marcar como Entregue"
  ↓
confirmarRecebimento()
  ↓
  ├─ Atualizar status doação → "recebida"
  ├─ Incrementar projeto.doacoesRecebidas
  └─ adicionarPontosInstituicao() → +10 pontos ONG
  ↓
Abrir Perfil → Verificar pontos + ranking badge
```

### Fluxo 3: Consultar Estatísticas
```
ONG (LoginInstituicao)
  ↓
Dashboard / Estatísticas
  ↓
Carregar dados:
  ├─ Projetos (count, count ativo)
  ├─ Doações por Status
  ├─ Doações por Mês (com parsing seguro de Timestamp)
  └─ Média de Doações/Projeto (com proteção divisão por zero)
  ↓
Exibir Gráficos + Cards
```

---

## 7. Como Testar

### Teste Rápido (10 min)

1. **Preparar Dados**:
   - Logar como ONG
   - Criar 1 projeto (ou usar existente)
   - Sair da ONG

2. **Fazer Doação**:
   - Logar como Usuário
   - Navegar para projeto
   - Preencher doação
   - Avaliar com 4-5 estrelas

3. **Verificar Resultados**:
   - Abrir Perfil → Pontos deve ser 10 (ou +10)
   - Logar como ONG → Perfil → Pontos deve ser 10 (ou +10)
   - Confirmar que badge de ranking aparece

### Teste Completo

Consulte **`CHECKLIST_TESTES_MANUAIS.md`** para 50+ testes detalhados cobrindo:
- Fluxo de doação + avaliação + pontos
- Estatísticas de dashboard
- Auto-desativação por avaliação baixa
- Guardas de autenticação
- Edge cases e performance

---

## 8. Commits Realizados

```
git log --oneline feat/instituicao-fixes

fc76fc5 fix(auth-guards): add defensive auth.currentUser checks with alerts and navigation redirects
0adb756 fix(estatisticas): add defensive checks for division by zero, invalid status, and Timestamp parsing
bb0c768 docs: add comprehensive manual testing checklist for TCC presentation
f266d01 fix(dashboard): alert+redirect when auth.currentUser missing in DashboardInstituicao
77ecc44 chore(auth-guards): commit pending defensive auth.currentUser checks and UI fixes
ce1983e fix(minhas-doacoes): guard auth.currentUser before confirmarColeta
bb9fd37 fix(notificacoes): guard auth.currentUser before updating profile notifications
fae2175 fix(historico-atividades): fix syntax error - remove extra closing brace and guard auth.currentUser
4bb96ab feat(ranking): adicionar badge de classificação em perfilInstituicao e Perfil (usuário)
...
```

---

## 9. Estrutura de Diretórios Relevantes

```
screens/
├── FormularioDoacao.js          ← Modal 5 estrelas, salvarAvaliacao()
├── Perfil.js                    ← Badge ranking, pontos doador
├── perfilUser.js                ← Badge ranking, pontos doador (alt)
├── Estatisticas.js              ← Gráficos doações
├── HistoricoAtividades.js       ← Timeline atividades
├── MinhasDoacoes.js             ← Lista doações usuário
├── Notificacoes.js              ← Preferências notificações
├── Privacidade.js               ← Configurações privacidade
└── instituicao/
    ├── DashboardInstituicao.js  ← Dashboard ONG
    ├── EstatisticasInstituicao.js  ← Gráficos ONG (com proteções)
    ├── DoacoesRecebidas.js      ← Doações recebidas, confirmar entrega
    ├── MeusProjetos.js          ← CRUD projetos
    ├── HistoricoAtividades.js   ← Timeline atividades ONG
    └── Notificacoes.js          ← Notificações ONG

services/
├── avaliacoesService.js         ← NEW: Avaliações, ranking, auto-deactivate
├── doacoesService.js            ← Doações, confirmarRecebimento()
├── userService.js               ← Perfis usuário, estatísticas
├── projetosService.js           ← Projetos
├── authService.js               ← incrementarDoacoes()
└── firebaseconfig.js            ← Configuração Firebase

components/
├── Global.js                    ← Cores, fontes globais
├── navbarDashboard.js           ← Navbar ONG
└── ...

Documentos:
├── CHECKLIST_TESTES_MANUAIS.md  ← NEW: Testes manuais
└── IMPLEMENTACAO.md             ← Este arquivo
```

---

## 10. Notas para Apresentação de TCC

### Pontos-Chave a Destacar

1. **Avaliações 5 Estrelas**
   - Feature crítica: doadores avaliam ONGs
   - Média armazenada para reputação
   - Impacto: auto-desativação se média < 2

2. **Sistema de Pontuação**
   - +10 pontos por doação = incentivo
   - Ranking visual (5 níveis: Bronze → Platina)
   - Usado para gamificação

3. **Robustez**
   - 14+ telas com guards de auth
   - Proteções contra divisão por zero, Timestamps inválidos
   - Error handling completo

4. **Testabilidade**
   - Checklist com 50+ testes manuais
   - Fluxos E2E documentados
   - Edge cases cobertos

### O Que Testar na Apresentação

1. **Fluxo Doação → Avaliação → Pontos** (2 min)
   - Fazer doação, avaliar, confirmar pontos

2. **Dashboard Estatísticas** (1 min)
   - Mostrar gráficos e contadores

3. **Auto-Desativação** (2 min, opcional)
   - Demonstrar que projeto desativa com média < 2

4. **Guards de Auth** (opcional)
   - Simular logout, tentar acessar tela protegida

---

## 11. Dependências Críticas

### Firebase (Firestore + Auth)
- Collections: `usuarios`, `instituicoes`, `doacoes`, `projetos`, `avaliacoes`, `favoritos`
- Auth: Google Sign-In, Email/Password

### React Native + Expo
- Navigation: React Navigation (Stack + Tab)
- UI: Expo Vector Icons, react-native-element-dropdown, react-native-masked-text
- Charts: react-native-gifted-charts

---

## 12. Troubleshooting

### Erro: "Missing catch or finally clause"
- Verifique que todo `try` tem `catch` e `finally`
- Executado durante bundle do Expo

### Erro: "Cannot read property 'uid' of null"
- Usuario não autenticado; verifique guards de auth.currentUser
- Procurar por `if (!user)` antes de usar `user.uid`

### Pontos não incrementam
- Verificar se `incrementarDoacoes()` é chamado após salvar doação
- Confirmar que `confirmarRecebimento()` chama `adicionarPontosInstituicao()`

### Gráficos mostram NaN
- Verificar timestamps: `d.dataDoacao.toDate()` vs `new Date()`
- Adicionar try-catch ao parsear datas

---

## 13. Próximos Passos (Pós-TCC)

- [ ] Testes unitários (Jest)
- [ ] Integração contínua (CI/CD)
- [ ] Notificações push (FCM)
- [ ] Chat entre doadores e ONGs
- [ ] Checkout integrado (Stripe/Mercado Pago)
- [ ] Mapa de ONGs (Google Maps)
- [ ] Deep linking para compartilhamento de projetos

---

**Documento preparado para apresentação de TCC**  
**Última atualização**: Novembro 25, 2025
