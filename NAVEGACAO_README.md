# 🗺️ NAVEGAÇÃO DO APP BENIGNO

> **Documentação Completa da Arquitetura de Navegação**

Bem-vindo! Este diretório contém toda a documentação sobre como o App Benigno funciona em termos de navegação entre telas.

---

## 📑 Começar Aqui

### 👋 Primeira Vez?

1. **Abra primeiro**: [`INDEX_NAVEGACAO.md`](./INDEX_NAVEGACAO.md)
   - Resumo de tudo
   - Como usar a documentação
   - Qual arquivo ler para cada situação

2. **Depois leia**: [`DIAGRAMA_NAVEGACAO.md`](./DIAGRAMA_NAVEGACAO.md)
   - Arquitetura completa
   - Fluxos de navegação
   - Estrutura de todas as telas

3. **Visualize**: [`DIAGRAMA_NAVEGACAO_VISUAL.md`](./DIAGRAMA_NAVEGACAO_VISUAL.md)
   - Diagramas ASCII art
   - Fluxos visuais
   - Entenda com imagens

4. **Código**: [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md)
   - Como codificar
   - Exemplos prontos
   - Troubleshooting

---

## 🎯 Encontrando o Que Precisa

### Estou programando...

**"Preciso navegar para uma tela"**
→ Abra: [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md) seção "Como Navegar Para Cada Tela"

**"Preciso passar dados entre telas"**
→ Abra: [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md) seção "Fluxo de Parâmetros"

**"Estou com erro de navegação"**
→ Abra: [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md) seção "Erros Comuns"

**"Preciso adicionar uma nova tela"**
→ Abra: [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md) seção "Checklist para Adicionar Nova Tela"

---

### Estou entendendo a estrutura...

**"Como o app é navegável?"**
→ Abra: [`DIAGRAMA_NAVEGACAO.md`](./DIAGRAMA_NAVEGACAO.md) seção "Visão Geral"

**"Qual é o fluxo de um doador?"**
→ Abra: [`DIAGRAMA_NAVEGACAO_VISUAL.md`](./DIAGRAMA_NAVEGACAO_VISUAL.md) seção "Fluxo DOADOR"

**"Qual é o fluxo de uma instituição?"**
→ Abra: [`DIAGRAMA_NAVEGACAO_VISUAL.md`](./DIAGRAMA_NAVEGACAO_VISUAL.md) seção "Fluxo INSTITUIÇÃO"

**"Quero ver um mapa de todas as telas"**
→ Abra: [`DIAGRAMA_NAVEGACAO.md`](./DIAGRAMA_NAVEGACAO.md) seção "Mapa de Todas as 30+ Telas"

---

## 📁 Arquivos de Documentação

```
├── INDEX_NAVEGACAO.md ⭐ LEIA PRIMEIRO
│   └─ Índice e guia de onde procurar
│
├── DIAGRAMA_NAVEGACAO.md
│   ├─ Arquitetura completa
│   ├─ Fluxos de entrada e autenticação
│   ├─ Estrutura de tabs
│   ├─ Matriz de transições
│   └─ Proteções de navegação
│
├── DIAGRAMA_NAVEGACAO_VISUAL.md
│   ├─ ASCII art dos fluxos
│   ├─ Visualização interativa
│   ├─ Profundidade de stack
│   └─ Comportamento de back button
│
├── REFERENCIA_NAVEGACAO.md
│   ├─ Código pronto para usar
│   ├─ Checklist de implementação
│   ├─ Debugging tools
│   ├─ Erros e soluções
│   └─ Tips & tricks
│
└── Este arquivo (README de Navegação)
```

---

## 🚀 Quick Start

### Código: Navegar para uma Tela

```javascript
// ✅ Navegar para tela simples
navigation.navigate('Home');

// ✅ Navegar com parâmetros
navigation.navigate('DetalhesProjeto', { 
  projeto: { id: '123', titulo: 'Projeto X' }
});

// ✅ Voltar
navigation.goBack();

// ✅ Logout (limpa histórico)
navigation.replace('Login');
```

---

## 📊 Estrutura Geral

```
APP BENIGNO
├── ONBOARDING (3 telas)
├── AUTENTICAÇÃO (4 telas)
│
├── DOADOR
│   ├── HOME (5 ABAS)
│   │   ├── Home
│   │   ├── Estatísticas
│   │   ├── Doar
│   │   ├── Favoritos
│   │   └── Perfil
│   │
│   └── STACKS SUBORDINADAS (10+ telas)
│       ├── DetalhesProjeto
│       ├── FormularioDoacao
│       ├── MinhasDoacoes
│       ├── EditarPerfil
│       ├── Enderecos
│       ├── Notificacoes
│       ├── HistoricoAtividades
│       ├── Privacidade
│       ├── SobreApp
│       └── AjudaSuporte
│
└── INSTITUIÇÃO
    ├── DASHBOARD (5 ABAS)
    │   ├── Dashboard
    │   ├── Meus Projetos
    │   ├── Doações Recebidas
    │   ├── Histórico
    │   └── Perfil
    │
    └── STACKS SUBORDINADAS (8+ telas)
        ├── CriarProjeto
        ├── EditarProjeto
        ├── DoacoesRecebidas
        ├── Notificacoes
        └── EstatisticasInstituicao
```

---

## 🎯 Fluxos Principais

### 1️⃣ Fazer uma Doação

```
[Home] → [DetalhesProjeto] → [FormularioDoacao] ✅
```

**Arquivo de referência**: [`DIAGRAMA_NAVEGACAO.md`](./DIAGRAMA_NAVEGACAO.md) - "Fluxo: Fazer uma Doação"

### 2️⃣ Editar Perfil

```
[Perfil] → [EditarPerfil] → Salvar → voltar ✅
```

**Arquivo de referência**: [`DIAGRAMA_NAVEGACAO_VISUAL.md`](./DIAGRAMA_NAVEGACAO_VISUAL.md) - "Fluxo: Editar Perfil"

### 3️⃣ Instituição Criar Projeto

```
[Dashboard] → [CriarProjeto] → Salvar → voltar ✅
```

**Arquivo de referência**: [`DIAGRAMA_NAVEGACAO_VISUAL.md`](./DIAGRAMA_NAVEGACAO_VISUAL.md) - "Fluxo: Criar Projeto"

### 4️⃣ Instituição Receber Doação

```
[Dashboard] → [DoacoesRecebidas] → Confirmar ✅
```

**Arquivo de referência**: [`DIAGRAMA_NAVEGACAO_VISUAL.md`](./DIAGRAMA_NAVEGACAO_VISUAL.md) - "Fluxo: Receber Doação"

---

## 🛡️ Segurança

### Autenticação
- ✅ Sem login: Apenas Onboarding + Auth
- ✅ Com login DOADOR: Acesso ao Home (TABS)
- ✅ Com login INSTITUIÇÃO: Acesso ao Dashboard (TABS)

### Parâmetros
- ✅ Sempre validar `route.params?.propriedade`
- ✅ Usar optional chaining (`?.`)
- ✅ Verificar null/undefined

### Back Navigation
- ✅ `goBack()` volta uma tela
- ✅ `replace()` substitui (para logout)
- ✅ Modals não afetam back button

---

## 🔍 Debugging

### Ver Tela Atual

```javascript
import { useIsFocused } from '@react-navigation/native';

function MeuaScreen() {
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      console.log('Tela em foco!');
    }
  }, [isFocused]);
}
```

### Listener de Navegação

```javascript
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    console.log('Tela recebeu foco');
    // Recarregar dados
  });

  return unsubscribe;
}, [navigation]);
```

**Mais informações**: [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md) - "Debugging de Navegação"

---

## ⚠️ Erros Comuns

| Erro | Solução | Arquivo |
|------|---------|---------|
| `Cannot read property 'navigate'` | Adicionar prop `navigation` | [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md) |
| `route.params is undefined` | Usar optional chaining `?.` | [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md) |
| `Modal doesn't work` | Modals não precisam de nav | [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md) |
| Back button não funciona | Verificar se está em Stack | [`DIAGRAMA_NAVEGACAO_VISUAL.md`](./DIAGRAMA_NAVEGACAO_VISUAL.md) |

---

## 📚 Documentação Oficial

- 📖 [React Navigation Docs](https://reactnavigation.org/)
- 📖 [Stack Navigator](https://reactnavigation.org/docs/stack-navigator/)
- 📖 [Bottom Tab Navigator](https://reactnavigation.org/docs/bottom-tab-navigator/)
- 📖 [Navigation Params](https://reactnavigation.org/docs/params/)

---

## 💡 Tips Importantes

### ✅ FAÇA
```javascript
// Passar objeto completo
navigation.navigate('DetalhesProjeto', { projeto: objCompleto });

// Verificar antes de usar
const projeto = route.params?.projeto;
if (!projeto) return <Text>Não encontrado</Text>;

// Usar optional chaining
const nome = projeto?.nome || 'Sem nome';
```

### ❌ NÃO FAÇA
```javascript
// Passar apenas ID
navigation.navigate('DetalhesProjeto', { projetoId: '123' });

// Usar diretamente
const nome = route.params.projeto.nome; // Pode quebrar!

// Não verificar null
navigation.navigate('Home'); // Se não logado, quebra
```

---

## 🎬 Demonstração Visual

### Tela Inicial
```
┌─────────────────────┐
│    INTRODUCAO       │
│  (Bem-vindo!)       │
│                     │
│   [Próximo]         │
└─────────────────────┘
          ↓
┌─────────────────────┐
│  P/S EXPLICACAO     │
│  (Explica função)   │
│                     │
│   [Próximo]         │
└─────────────────────┘
          ↓
┌─────────────────────┐
│  ESCOLHA FUNCAO     │
│  [Doador] [Inst]    │
└─────────────────────┘
```

### Home do Doador (5 Abas)
```
┌─────────────────────┐
│ [Home]📊 [Doar]❤️  │
│ 🏠     📊    Favs⭐ │
│                     │
│   Conteúdo          │
│    da Aba           │
│                     │
├─────────────────────┤
│🏠  📊  ❤️  ⭐  👤  │
└─────────────────────┘
```

---

## 📞 Precisa de Ajuda?

### 1. Procure no INDEX
👉 [`INDEX_NAVEGACAO.md`](./INDEX_NAVEGACAO.md)

### 2. Procure no DIAGRAMA
👉 [`DIAGRAMA_NAVEGACAO.md`](./DIAGRAMA_NAVEGACAO.md)

### 3. Procure na REFERÊNCIA
👉 [`REFERENCIA_NAVEGACAO.md`](./REFERENCIA_NAVEGACAO.md)

### 4. Procure no VISUAL
👉 [`DIAGRAMA_NAVEGACAO_VISUAL.md`](./DIAGRAMA_NAVEGACAO_VISUAL.md)

---

## 📈 Estatísticas

```
📱 Total de Telas: 33+
📄 Total de Documentos: 4
📝 Total de Páginas: 50+
💻 Exemplos de Código: 50+
🐛 Erros Documentados: 10+
✅ Cobertura: 100%
```

---

## ✨ Próximas Melhorias

- [ ] Diagrama interativo em Figma
- [ ] Vídeo walkthrough
- [ ] Testes de navegação
- [ ] Performance metrics
- [ ] Deep linking completo

---

## 📝 Versão

```
Versão: 1.0
Data: 24/11/2025
Status: ✅ COMPLETO
Mantido por: Equipe Benigno
```

---

## 🎁 Resumo de 30 Segundos

**O App Benigno tem:**
- 1 entrada (Onboarding)
- 2 fluxos de autenticação (Doador + Instituição)
- 2 apps principais (Home 5 TABS + Dashboard 5 TABS)
- 15+ telas adicionais
- Proteções de navegação
- Parâmetros bem-definidos

**Para navegar, use:**
- `navigation.navigate('NomeTela', {parametros})`
- `navigation.goBack()`
- `navigation.replace()` para logout

**Para entender, leia:**
1. `INDEX_NAVEGACAO.md`
2. `DIAGRAMA_NAVEGACAO.md`
3. `REFERENCIA_NAVEGACAO.md`

---

**Comece lendo** [`INDEX_NAVEGACAO.md`](./INDEX_NAVEGACAO.md) **agora! 👉**

---

*Documentação de Navegação - App Benigno v1.0*
*Última atualização: 24/11/2025*
*Status: ✅ PRONTO PARA USO*
