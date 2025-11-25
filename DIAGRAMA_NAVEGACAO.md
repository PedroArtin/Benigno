# 📱 Diagrama Completo de Navegação - App Benigno

## 🎯 Visão Geral da Arquitetura de Navegação

```
┌─────────────────────────────────────────────────────────────────┐
│                    STACK NAVIGATOR (Principal)                   │
│                   (Gerencia toda navegação)                      │
└─────────────────────────────────────────────────────────────────┘
         │
         ├─────────────────────┬──────────────────────────────┐
         │                     │                              │
    ONBOARDING            AUTENTICAÇÃO                    APP PRINCIPAL
    (3 telas)         (Usuário/Instituição)              (TABS + Stacks)
         │                     │                              │
```

---

## 📋 Fluxo Completo de Navegação

### 1️⃣ **ONBOARDING** (Primeiros 3 passos)
```
┌──────────────────────────────────────────────────────────┐
│                    FLUXO ONBOARDING                       │
└──────────────────────────────────────────────────────────┘

  [Introducao]
       ↓
  (Botão "Próximo")
       ↓
  [PExplicacao] (Explicação Pessoa Física)
       ↓
  (Botão "Próximo")
       ↓
  [SExplicacao] (Explicação Instituição)
       ↓
  (Botão "Começar")
       ↓
  [EscolhaDeFuncao]
```

### 2️⃣ **ESCOLHA DE FUNÇÃO**
```
┌──────────────────────────────────────────────────────────┐
│              TELA: EscolhaDeFuncao                        │
│         (Escolhe se é Doador ou Instituição)             │
└──────────────────────────────────────────────────────────┘

         [EscolhaDeFuncao]
              ↙          ↖
     (Botão Sou        (Botão Sou
      Doador)          Instituição)
       ↙                  ↖
    [Login]        [LoginInstituicao]
```

### 3️⃣ **AUTENTICAÇÃO - DOADOR** (Pessoa Física)
```
┌──────────────────────────────────────────────────────────┐
│        FLUXO AUTENTICAÇÃO - PESSOA FÍSICA                │
└──────────────────────────────────────────────────────────┘

         [Login]
          ↙  ↖
    (Login   (Link "Cadastro")
     COM       ↓
     sucesso) [Cadastro]
       ↓           ↓
       └──────→ (Com sucesso)
              ↓
         [Home] (TABS)
```

### 4️⃣ **AUTENTICAÇÃO - INSTITUIÇÃO**
```
┌──────────────────────────────────────────────────────────┐
│      FLUXO AUTENTICAÇÃO - INSTITUIÇÃO                    │
└──────────────────────────────────────────────────────────┘

    [LoginInstituicao]
          ↙  ↖
    (Login   (Link "Cadastro")
     COM       ↓
     sucesso) [CadastroInst]
       ↓           ↓
       └──────→ (Com sucesso)
              ↓
    [InstituicaoNavigator]
```

---

## 🏠 APP PRINCIPAL - ESTRUTURA TABS

### **TAB ROUTES** (Bottom Navigation - 5 abas)
```
┌─────────────────────────────────────────────────────────────┐
│                     [HOME - TABS]                            │
│  ┌─────────┬─────────┬────────┬──────────┬──────────┐      │
│  │  Home   │Estatís- │ Doar   │Favoritos│  Perfil  │      │
│  │  🏠     │  ticas  │ ❤️     │ ⭐      │  👤      │      │
│  └─────────┴─────────┴────────┴──────────┴──────────┘      │
│         │         │        │        │          │            │
│  (Cada tab tem  Stack próprio com navegações secundárias)   │
└─────────────────────────────────────────────────────────────┘
```

### **ABA 1: HOME**
```
┌──────────────────────────────────────────┐
│ [Home]                                    │
│ (Feed de projetos com banner rotativo)    │
├──────────────────────────────────────────┤
│  Navegações:                              │
│  ├─→ Clique em projeto: [DetalhesProjeto]│
│  │   ├─→ Botão "Quero Ajudar"            │
│  │   │   └─→ [FormularioDoacao] (Modal)  │
│  │   │       ├─→ Sucesso                 │
│  │   │       │   └─→ voltar (goBack)     │
│  │   │       └─→ Cancelar                │
│  │   └─→ Botão "Favoritar"               │
│  │   └─→ Botão voltar                    │
│  └─→ Link "Favoritos" (bottom)           │
│      └─→ [Favoritos] (ABA 4)             │
└──────────────────────────────────────────┘
```

### **ABA 2: ESTATÍSTICAS**
```
┌──────────────────────────────────────────┐
│ [Estatisticas]                            │
│ (Gráficos de doações)                     │
├──────────────────────────────────────────┤
│  - Sem navegações adicionais              │
│  - Apenas refresh e voltar                │
└──────────────────────────────────────────┘
```

### **ABA 3: DOAR**
```
┌──────────────────────────────────────────┐
│ [Doar]                                    │
│ (Mapa de projetos + Lista + Filtros)      │
├──────────────────────────────────────────┤
│  Navegações:                              │
│  ├─→ Clique em projeto no mapa/lista      │
│  │   └─→ [DetalhesProjeto]                │
│  │       ├─→ [FormularioDoacao]           │
│  │       └─→ goBack                       │
│  ├─→ Botão "Abrir Filtros"                │
│  │   └─→ [FilterModal] (Modal)            │
│  └─→ Link "Favoritos" (top)               │
│      └─→ [Favoritos] (ABA 4)              │
└──────────────────────────────────────────┘
```

### **ABA 4: FAVORITOS**
```
┌──────────────────────────────────────────┐
│ [Favoritos]                               │
│ (Projetos salvos como favoritos)          │
├──────────────────────────────────────────┤
│  Navegações:                              │
│  ├─→ Clique em projeto                    │
│  │   └─→ [DetalhesProjeto]                │
│  │       ├─→ [FormularioDoacao]           │
│  │       └─→ goBack                       │
│  └─→ Botão remover do favorito            │
└──────────────────────────────────────────┘
```

### **ABA 5: PERFIL**
```
┌──────────────────────────────────────────┐
│ [Perfil]                                  │
│ (Dashboard do usuário)                    │
├──────────────────────────────────────────┤
│  Navegações (Menu):                       │
│  ├─→ [MinhasDoacoes]                      │
│  │   └─→ Detalhe de doação (Modal)        │
│  ├─→ [Favoritos]                          │
│  ├─→ [HistoricoAtividades]                │
│  ├─→ [EditarPerfil]                       │
│  ├─→ [Enderecos]                          │
│  ├─→ [Notificacoes]                       │
│  ├─→ [Privacidade]                        │
│  ├─→ [SobreApp]                           │
│  ├─→ [AjudaSuporte]                       │
│  └─→ Logout                               │
│      └─→ [Login]                          │
└──────────────────────────────────────────┘
```

---

## 🏢 INSTITUIÇÕES - ESTRUTURA DE NAVEGAÇÃO

### **INSTITUIÇÃO NAVIGATOR** (Tab Routes para Instituição)
```
┌──────────────────────────────────────────────────────────┐
│           [InstituicaoNavigator - TABS]                   │
│  ┌──────────┬──────────┬────────┬──────────┬────────┐    │
│  │Dashboard │ Meus     │Doações │Histórico │Perfil  │    │
│  │🏠        │Projetos  │Recebidas│Atividades│👤     │    │
│  └──────────┴──────────┴────────┴──────────┴────────┘    │
└──────────────────────────────────────────────────────────┘
```

### **TAB 1: DASHBOARD INSTITUIÇÃO**
```
┌──────────────────────────────────────────┐
│ [DashboardInstituicao]                    │
│ (Resumo de doações e projetos)            │
├──────────────────────────────────────────┤
│  Navegações:                              │
│  ├─→ Botão "Doações Recebidas"           │
│  │   └─→ [DoacoesRecebidas]               │
│  ├─→ Botão "Meus Projetos"               │
│  │   └─→ [MeusProjetos]                   │
│  ├─→ Botão "Criar Projeto"               │
│  │   └─→ [CriarProjeto]                   │
│  │       └─→ [Sucesso]                    │
│  └─→ Notificações (ícone)                │
│      └─→ [Notificacoes]                   │
└──────────────────────────────────────────┘
```

### **TAB 2: MEUS PROJETOS**
```
┌──────────────────────────────────────────┐
│ [MeusProjetos]                            │
│ (Lista de projetos da instituição)        │
├──────────────────────────────────────────┤
│  Navegações:                              │
│  ├─→ Clique em projeto                    │
│  │   └─→ [EditarProjeto]                  │
│  │       └─→ Salvar/Cancelar              │
│  └─→ Botão criar novo                    │
│      └─→ [CriarProjeto]                   │
└──────────────────────────────────────────┘
```

### **TAB 3: DOAÇÕES RECEBIDAS**
```
┌──────────────────────────────────────────┐
│ [DoacoesRecebidas]                        │
│ (Doações chegando para instituição)       │
├──────────────────────────────────────────┤
│  Navegações:                              │
│  ├─→ Clique em doação                     │
│  │   └─→ [ModalDetalhe]                   │
│  │       └─→ Botão "Confirmar"            │
│  │       └─→ Botão "Rejeitar"             │
│  └─→ Filtros (status)                    │
└──────────────────────────────────────────┘
```

### **TAB 4: HISTÓRICO DE ATIVIDADES**
```
┌──────────────────────────────────────────┐
│ [HistoricoAtividades]                    │
│ (Timeline de eventos)                     │
├──────────────────────────────────────────┤
│  - Sem navegações adicionais              │
│  - Apenas visualização                    │
└──────────────────────────────────────────┘
```

### **TAB 5: PERFIL INSTITUIÇÃO**
```
┌──────────────────────────────────────────┐
│ [PerfilInstituicao]                       │
│ (Dados da instituição)                    │
├──────────────────────────────────────────┤
│  Navegações:                              │
│  ├─→ Botão "Editar Perfil"               │
│  │   └─→ [Editar] (inline)                │
│  ├─→ Botão "Notificações"                │
│  │   └─→ [Notificacoes]                   │
│  ├─→ Botão "Estatísticas"                │
│  │   └─→ [EstatisticasInstituicao]        │
│  └─→ Logout                               │
│      └─→ [LoginInstituicao]               │
└──────────────────────────────────────────┘
```

---

## 📊 Diagrama em Árvore Completo

```
START
  │
  ├─→ [Introducao] →  [PExplicacao] → [SExplicacao] → [EscolhaDeFuncao]
  │
  ├─────────────────────────────────────────────────────────────────────┐
  │                                                                       │
  │ DOADOR (Pessoa Física)              INSTITUIÇÃO                     │
  │        │                                   │                        │
  │      [Login]◄──────────┐                [LoginInstituicao]          │
  │        ↓    ↖ sem login │                  ↓    ↖ sem login         │
  │      [Cadastro]        │                [CadastroInst]              │
  │        │                │                  │                        │
  │      (Login OK)         │                (Login OK)                 │
  │        └────────────────┤                  │                        │
  │                         ↓                  ↓                        │
  │                      [HOME - TABS]  [INSTITUIÇÃO - TABS]           │
  │                      ┌─────────┐     ┌──────────────┐              │
  │                      │ 1. Home │     │ 1. Dashboard │              │
  │                      │ 2.Stats │     │ 2. Projetos  │              │
  │                      │ 3. Doar │     │ 3. Doações   │              │
  │                      │ 4. Favs │     │ 4. Histórico │              │
  │                      │ 5. Prof │     │ 5. Perfil    │              │
  │                      └─────────┘     └──────────────┘              │
  │                         │                  │                        │
  │                    [Sub-stacks]       [Sub-stacks]                 │
  │                         │                  │                        │
  └─────────────────────────────────────────────────────────────────────┘

┌─ [DOADOR - SUB-STACKS] ─────────────────────────────────────────┐
│                                                                   │
│ [DetalhesProjeto] ← Clique em projeto                           │
│   ├─→ [FormularioDoacao] (Modal) ← "Quero Ajudar"             │
│   └─→ goBack ← Botão voltar                                     │
│                                                                   │
│ [MinhasDoacoes] ← Clique "Minhas Doações"                      │
│   └─→ Modal detalhe ← Clique em doação                         │
│                                                                   │
│ [Favoritos] ← ABA 4 ou link em Home/Doar                       │
│   ├─→ [DetalhesProjeto]                                         │
│   └─→ [FormularioDoacao] ← "Quero Ajudar"                      │
│                                                                   │
│ [EditarPerfil] ← Menu Perfil                                    │
│ [Enderecos] ← Menu Perfil                                       │
│ [HistoricoAtividades] ← Menu Perfil ou ABA                     │
│ [Notificacoes] ← Menu Perfil                                    │
│ [Privacidade] ← Menu Perfil                                     │
│ [SobreApp] ← Menu Perfil                                        │
│ [AjudaSuporte] ← Menu Perfil                                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ [INSTITUIÇÃO - SUB-STACKS] ────────────────────────────────────┐
│                                                                   │
│ [CriarProjeto] ← Dashboard "Criar" ou MeusProjetos             │
│   └─→ Sucesso → voltar ou navigate                              │
│                                                                   │
│ [EditarProjeto] ← MeusProjetos "Editar"                         │
│   └─→ Sucesso → voltar                                          │
│                                                                   │
│ [DoacoesRecebidas] ← Dashboard "Ver Doações"                    │
│   └─→ Modal detalhe + ações (Confirmar/Rejeitar)               │
│                                                                   │
│ [EstatisticasInstituicao] ← Perfil "Estatísticas"             │
│   └─→ Gráficos                                                  │
│                                                                   │
│ [Notificacoes] ← Dashboard ou Perfil "Notificações"           │
│   └─→ [DoacoesRecebidas] ← Clique em notificação              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Mapa de Todas as 30+ Telas

| # | Nome da Tela | Tipo | De | Para | Ação |
|---|---|---|---|---|---|
| 1 | Introducao | Screen | START | PExplicacao | Botão "Próximo" |
| 2 | PExplicacao | Screen | Introducao | SExplicacao | Botão "Próximo" |
| 3 | SExplicacao | Screen | PExplicacao | EscolhaDeFuncao | Botão "Começar" |
| 4 | EscolhaDeFuncao | Screen | SExplicacao | Login \| LoginInstituicao | Escolhe função |
| 5 | Login | Screen | EscolhaDeFuncao | Home \| Cadastro | Login ou Link |
| 6 | Cadastro | Screen | Login | Home | Cadastro OK |
| 7 | LoginInstituicao | Screen | EscolhaDeFuncao | InstituicaoNav \| CadastroInst | Login ou Link |
| 8 | CadastroInst | Screen | LoginInstituicao | InstituicaoNav | Cadastro OK |
| 9 | **[TAB] Home** | Tab | Login | DetalhesProjeto \| Favoritos | Clique/Link |
| 10 | **[TAB] Estatisticas** | Tab | Home | - | Dashboard |
| 11 | **[TAB] Doar** | Tab | Home | DetalhesProjeto \| FilterModal | Clique/Filtro |
| 12 | **[TAB] Favoritos** | Tab | Home | DetalhesProjeto | Clique |
| 13 | **[TAB] Perfil** | Tab | Home | EditarPerfil \| MinhasDoacoes \| ... | Menu |
| 14 | DetalhesProjeto | Stack | Home \| Doar \| Favoritos | FormularioDoacao | Clique/Botão |
| 15 | FormularioDoacao | Modal | DetalhesProjeto | (voltar) | Submit/Cancel |
| 16 | MinhasDoacoes | Stack | Perfil | (Modal detalhe) | Clique |
| 17 | EditarPerfil | Stack | Perfil | (voltar) | Salvar/Cancel |
| 18 | Enderecos | Stack | Perfil | (voltar) | Salvar/Cancel |
| 19 | Notificacoes | Stack | Perfil \| Dashboard | (voltar) | Visualizar |
| 20 | HistoricoAtividades | Stack | Perfil | (voltar) | Visualizar |
| 21 | Privacidade | Stack | Perfil | (voltar) | Salvar/Cancel |
| 22 | SobreApp | Stack | Perfil | (voltar) | Visualizar |
| 23 | AjudaSuporte | Stack | Perfil | (voltar) | Visualizar |
| 24 | FilterModal | Modal | Doar | (voltar) | Aplicar/Cancel |
| 25 | **[INST TAB] Dashboard** | Tab | LoginInst | DoacoesRecebidas \| MeusProjetos \| CriarProjeto | Menu |
| 26 | **[INST TAB] MeusProjetos** | Tab | Dashboard | EditarProjeto \| CriarProjeto | Menu |
| 27 | **[INST TAB] DoacoesRecebidas** | Tab | Dashboard | (Modal) | Visualizar |
| 28 | **[INST TAB] Histórico** | Tab | Dashboard | - | Visualizar |
| 29 | **[INST TAB] PerfilInstituicao** | Tab | Dashboard | Notificacoes \| EstatisticasInstituicao | Menu |
| 30 | CriarProjeto | Stack | Dashboard \| MeusProjetos | (sucesso) | Submit |
| 31 | EditarProjeto | Stack | MeusProjetos | (sucesso) | Salvar |
| 32 | DoacoesRecebidas | Stack | Dashboard | (Modal) | Visualizar |
| 33 | EstatisticasInstituicao | Stack | PerfilInstituicao | (voltar) | Visualizar |

---

## 🔄 Fluxos Principais de Caso de Uso

### 📍 Fluxo: Fazer uma Doação
```
[Home/Doar] 
   ↓ (clique em projeto)
[DetalhesProjeto]
   ↓ (clique "Quero Ajudar")
[FormularioDoacao] (Modal)
   ├─→ (preenche dados)
   ├─→ (clique Enviar)
   ├─→ ✅ Sucesso
   └─→ voltar para [DetalhesProjeto]
```

### 💾 Fluxo: Gerenciar Favoritos
```
[Home/Doar/Favoritos]
   ├─→ Clique ⭐ favoritar
   ├─→ Salva em [Favoritos]
   └─→ Pode clicar em projeto para doar
```

### 🏗️ Fluxo: Instituição Criar Projeto
```
[Dashboard]
   ├─→ Botão "Criar Projeto"
   └─→ [CriarProjeto]
      ├─→ (preenche dados)
      ├─→ (clique Salvar)
      ├─→ ✅ Sucesso
      └─→ [Dashboard]
```

### ✅ Fluxo: Instituição Receber Doação
```
[Dashboard] (notificação de nova doação)
   ├─→ Clique badge notificação
   └─→ [DoacoesRecebidas]
      ├─→ Lista de doações pendentes
      ├─→ Clique em doação
      ├─→ [Modal detalhe]
      ├─→ Botão "Confirmar Recebimento"
      └─→ ✅ Doação marcada como recebida
```

### 👤 Fluxo: Editar Perfil
```
[Perfil - ABA 5]
   ├─→ Clique "Editar Perfil"
   └─→ [EditarPerfil]
      ├─→ (edita dados)
      ├─→ (clique Salvar)
      ├─→ ✅ Sucesso
      └─→ voltar para [Perfil]
```

---

## 🛡️ Proteções de Navegação

### Autenticação
- ✅ Sem login: acesso apenas a [Login], [Cadastro], [LoginInstituicao], [CadastroInst]
- ✅ Com login DOADOR: acesso a [Home] (TABS) + sub-stacks
- ✅ Com login INSTITUIÇÃO: acesso a [InstituicaoNavigator] (TABS) + sub-stacks

### Modal Stacks
- ✅ [FormularioDoacao] é Modal (não afeta back button)
- ✅ [FilterModal] é Modal (não afeta back button)
- ✅ Detalhes em listas usam Modal Dialog

### Back Navigation
- ✅ Cada Stack tem goBack() para voltar
- ✅ Logout usa replace('Login') - limpa stack

---

## 📲 Componentes de Navegação Utilizados

```javascript
// Tipos de navegadores usados:
1. Stack Navigator - StackRoutes (rota principal)
2. Bottom Tab Navigator - TabRoutes (5 abas doador)
3. Bottom Tab Navigator - InstituicaoNavigator (5 abas instituição)
4. Modal Presenter - para FormularioDoacao, FilterModal
5. Nested Stacks - para sub-telas dentro de cada aba
```

---

## ✨ Resumo Visual Simplificado

```
                          APP BENIGNO
                              │
              ┌───────────────┴───────────────┐
              │                               │
         [DOADOR]                       [INSTITUIÇÃO]
              │                               │
         Login/Cadastro               LoginInstituicao/CadastroInst
              │                               │
         [HOME - 5 TABS]            [INSTITUIÇÃO - 5 TABS]
         ├─ Home                     ├─ Dashboard
         ├─ Estatísticas             ├─ Meus Projetos
         ├─ Doar                     ├─ Doações Recebidas
         ├─ Favoritos                ├─ Histórico
         └─ Perfil                   └─ Perfil
              │                               │
         Sub-Stacks:                   Sub-Stacks:
         • DetalhesProjeto            • CriarProjeto
         • FormularioDoacao           • EditarProjeto
         • MinhasDoacoes              • DoacoesRecebidas
         • EditarPerfil               • EstatisticasInstituicao
         • Enderecos                  • Notificacoes
         • Notificacoes
         • HistoricoAtividades
         • Privacidade
         • SobreApp
         • AjudaSuporte
```

---

## 🚀 Como Navegar Programaticamente

```javascript
// Exemplo 1: Navegar para tela com parâmetros
navigation.navigate('DetalhesProjeto', { projeto: projectObject });

// Exemplo 2: Voltar
navigation.goBack();

// Exemplo 3: Trocar aba
navigation.navigate('Favoritos'); // Vai para a aba Favoritos

// Exemplo 4: Logout (limpa stack)
navigation.replace('Login');

// Exemplo 5: Abrir modal
navigation.navigate('FormularioDoacao');
```

---

## 📝 Notas Importantes

1. **Ordenamento de Telas**: As telas estão organizadas por contexto (Onboarding, Auth, App, etc)
2. **Modal Handling**: Alguns diálogos usam Modal, outros usam Stack
3. **Back Button**: Todos os stacks tem back navigation habilitada
4. **Tab Switching**: Cada aba é independente com seu próprio stack
5. **Deep Linking**: Estrutura permite future implementation de deep links
6. **Logout**: Usa `replace()` em vez de `navigate()` para não permitir voltar ao histórico

---

*Diagrama criado em 24/11/2025 - App Benigno v1.0*
