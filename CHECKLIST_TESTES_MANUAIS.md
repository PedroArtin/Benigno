# Checklist de Testes Manuais - Benigno TCC

Data: Novembro 25, 2025  
Versão: 1.0  
Branch: `feat/instituicao-fixes`

---

## 1. Fluxo de Doação + Avaliação + Pontos

### 1.1 Preparação
- [ ] Conectar ao Firebase com credenciais de teste
- [ ] Ter 2 contas de teste criadas:
  - Usuário doador (Login)
  - ONG/Instituição (LoginInstituicao)
- [ ] ONG deve ter pelo menos 1 projeto ativo com categoria definida

### 1.2 Teste: Usuário Faz Doação
- [ ] Logar como usuário (doador)
- [ ] Navegar para "Home" ou "Doar"
- [ ] Selecionar um projeto de uma ONG
- [ ] Clicar em "Doar" ou acessar FormularioDoacao
- [ ] Preencher:
  - [ ] Tipo de entrega (coleta ou entrega)
  - [ ] Adicionar pelo menos 1 item com categoria e quantidade
  - [ ] Adicionar observações (opcional)
- [ ] Submeter doação
  - [ ] Confirmar sucesso da doação (mensagem "Doação registrada")
  - [ ] Verificar que **modal de avaliação (5 estrelas)** aparece
- [ ] **Avaliar a instituição com 4-5 estrelas**
  - [ ] Preencher comentário (opcional)
  - [ ] Clicar "Salvar Avaliação"
  - [ ] Confirmar sucesso (alert "Sucesso! 🎉")

### 1.3 Teste: Verificar Incremento de Pontos do Doador
- [ ] Abrir "Meu Perfil" (Perfil)
- [ ] Verificar card "Pontos"
  - [ ] Confirmar que mudou de 0 para 10 (ou incrementou +10)
  - [ ] Verificar se badge de ranking aparece (Bronze, Prata, Ouro, etc.)
  - [ ] Nota: ranking aparece quando pontos >= 50 (Bronze), >= 150 (Prata), etc.

### 1.4 Teste: ONG Recebe Doação + Pontos + Incremento
- [ ] Logar como ONG (LoginInstituicao)
- [ ] Navegar para "Doações Recebidas"
- [ ] Confirmar que doação aparece com status "Pendente"
- [ ] Clicar "Marcar como Entregue"
- [ ] Confirmar entrega
- [ ] Abrir "Perfil da Instituição"
  - [ ] Verificar que pontuação incrementou (+10 pontos por doação)
  - [ ] Verificar badge de ranking da ONG (se pontos >= 50)

### 1.5 Teste: Auto-Desativação por Avaliação Baixa
- [ ] Fazer 5 doações com avaliações de 1-2 estrelas para um projeto (média <= 1.6)
- [ ] Ir para "Meus Projetos" da ONG
- [ ] Confirmar que projeto está **"Inativo"** (auto-desativado pelo sistema)
- [ ] Verificar logs no console para message: "Projeto desativado por média de avaliações < 2"

---

## 2. Fluxo de Estatísticas

### 2.1 Dashboard da ONG
- [ ] Logar como ONG
- [ ] Abrir "Dashboard Instituição"
- [ ] Verificar cards:
  - [ ] Total de Projetos: deve corresponder a projetos criados
  - [ ] Projetos Ativos: contar apenas projetos com `ativo: true`
  - [ ] Total de Doações: contar todas as doações recebidas
  - [ ] Doações/Projeto: média = total doações / total projetos (com proteção contra divisão por zero)
  - [ ] Pontuação: mostrar pontos da instituição

### 2.2 Abas de Estatísticas
- [ ] Abrir "Estatísticas" na ONG
- [ ] **Tab "Doações"**: Gráfico de barras por mês
  - [ ] Validar que dados são agrupados corretamente por ano-mês
  - [ ] Confirmar parsing correto de Timestamp
  - [ ] Proteger contra datas inválidas
- [ ] **Tab "Status"**: Pie Chart de status (Pendente, Confirmada, Entregue)
  - [ ] Validar contagem por status
  - [ ] Proteger contra status inválido
- [ ] **Tab "Projetos"**: Resumo de projetos
  - [ ] Total de projetos, projetos ativos, inativos

---

## 3. Fluxo de Perfil (Usuário Doador)

### 3.1 Perfil do Usuário
- [ ] Logar como doador
- [ ] Abrir "Meu Perfil" (Perfil)
- [ ] Verificar seção "Estatísticas":
  - [ ] Card "Doações": contar doações feitas pelo usuário
  - [ ] Card "Favoritos": contar favoritos
  - [ ] Card "Pontos": mostrar pontos do usuário
  - [ ] Ranking Badge: mostrar classificação (Bronze → Platina) baseado em pontos
- [ ] Clicar em "Minhas Doações"
  - [ ] Listar todas as doações feitas com status (Aguardando, Confirmada, Recebida)
  - [ ] Validar que status muda quando ONG marca como recebida

### 3.2 Perfil da ONG (Public Profile)
- [ ] Buscar e abrir perfil de uma ONG (DetalhesProjeto → Perfil da ONG)
- [ ] Verificar:
  - [ ] Nome, email, descrição da ONG
  - [ ] Pontuação e Ranking Badge
  - [ ] Botão para ver projetos da ONG

---

## 4. Autenticação e Guards

### 4.1 Teste: Sessão Expirada
- [ ] Logar como usuário
- [ ] Abrir Dev Tools / Acessibilidade e simular logout (limpar token)
- [ ] Navegar para qualquer tela que requer autenticação (ex: Perfil, Histórico)
- [ ] Confirmar:
  - [ ] Alert aparece: "Sessão expirada"
  - [ ] Usuário é redirecionado para Login
  - [ ] Não há crash/erro 500

### 4.2 Teste: Acesso sem Autenticação
- [ ] Fechar e reabrir o app sem fazer login
- [ ] Tentar acessar rota protegida (ex: `/Perfil` diretamente via deep link)
- [ ] Confirmar redirecionamento para Login

### 4.3 Teste: Guards de auth.currentUser
- Verificar que todos os `if (!user)` guards estão presentes em:
  - [ ] `screens/Perfil.js`
  - [ ] `screens/Estatisticas.js`
  - [ ] `screens/perfilUser.js`
  - [ ] `screens/FormularioDoacao.js` (handleSalvarAvaliacao)
  - [ ] `screens/instituicao/DashboardInstituicao.js`
  - [ ] `screens/instituicao/EstatisticasInstituicao.js`
  - [ ] `screens/instituicao/MeusProjetos.js`
  - [ ] E demais screens com auth

---

## 5. Contadores e Sincronização

### 5.1 Contador de Doações do Usuário
- [ ] Criar novo doador
- [ ] Fazer 3 doações
- [ ] Abrir Perfil → "Doações"
- [ ] Confirmar contador = 3
- [ ] Verificar campo `usuarios.doacoes` no Firestore
- [ ] Validar que contador não fica "0" mesmo com múltiplas doações

### 5.2 Contador de Doações Recebidas (Projeto)
- [ ] ONG receber 5 doações para um projeto específico
- [ ] Abrir "Meus Projetos"
- [ ] Verificar que campo "X doações" está correto
- [ ] Validar que campo `projetos.doacoesRecebidas` no Firestore incrementa

### 5.3 Atualização em Tempo Real
- [ ] Fazer doação em um device/aberto browser
- [ ] Abrir Estatísticas em outro device/browser
- [ ] Confirmar que contador atualiza (pode exigir refresh manual)

---

## 6. Validação de Dados

### 6.1 Proteção contra Null/Undefined
- [ ] Tentar criar doação sem itens
  - [ ] Validar que alert aparece
  - [ ] Confirmar que não salva
- [ ] Tentar criar projeto sem categoria
  - [ ] Validar que alert aparece
- [ ] Tentar criar avaliação sem selecionar estrelas
  - [ ] Validar que alert aparece: "Por favor, selecione uma classificação"

### 6.2 Proteção contra Divisão por Zero
- [ ] ONG com 0 projetos, N doações
  - [ ] Verificar que "Doações/Projeto" = 0 (não NaN ou Infinity)
- [ ] Projeto com 0 doações
  - [ ] Verificar estatísticas não quebram

### 6.3 Proteção contra Timestamp Inválido
- [ ] Fazer doação, verificar que `dataDoacao` é salvo corretamente
- [ ] Abrir Estatísticas
- [ ] Confirmar que gráfico de "Doações por Mês" não mostra `NaN` ou data inválida
- [ ] Simular doação com data inválida no Firestore e verificar console.warn

---

## 7. Performance e Boundary Cases

### 7.1 Grandes Volumes de Dados
- [ ] ONG com 100+ doações
  - [ ] Abrir Estatísticas → verificar que não congela
  - [ ] Gráfico de barras deve renderizar sem lag
- [ ] Usuário com 50+ doações
  - [ ] Abrir "Minhas Doações" → verify lista scrolls sem freeze

### 7.2 Edge Cases
- [ ] Avaliar uma instituição com comentário muito longo (500+ caracteres)
  - [ ] Confirmar que salva e exibe sem truncar (ou trunca gracefully)
- [ ] ONG com pontos muito altos (1000+)
  - [ ] Verificar badge de ranking aparece corretamente
  - [ ] Confirmar cálculo de ranking: `obterClassificacao(pontos)` retorna valor válido

---

## 8. UX e UI

### 8.1 Modal de Avaliação
- [ ] Confirmame que modal tem estilo limpo e alinhado ao design
- [ ] Estrelas são clicáveis e mudam de cor (outline → filled)
- [ ] Botões "Cancelar" e "Salvar" funcionam
- [ ] Fechar modal com X também funciona

### 8.2 Ranking Badges
- [ ] Badge aparece com cor diferente por rank:
  - [ ] Bronze: cor1
  - [ ] Prata: cor2
  - [ ] Ouro: cor3
  - [ ] Diamante: cor4
  - [ ] Platina: cor5
- [ ] Texto legível em fundos

### 8.3 Alerts e Mensagens
- [ ] Mensagens de sucesso aparecem (alert "Sucesso! 🎉")
- [ ] Mensagens de erro aparecem com detalhes
- [ ] Mensagens de loading ("Carregando...") aparecem quando necessário

---

## 9. Fluxo Completo (E2E)

### Scenario: Novo Usuário Faz Primeira Doação
1. [ ] Criar conta nova (Cadastro)
2. [ ] Fazer primeira doação para ONG X
3. [ ] Avaliar ONG com 5 estrelas
4. [ ] Verificar:
   - [ ] Pontos do usuário = 10
   - [ ] Ranking = Bronze (se pontos >= 50 não aparece, senão invisível)
   - [ ] ONG recebeu pontos +10
   - [ ] Contador de doações do usuário = 1
   - [ ] Doação aparece em "Minhas Doações"
5. [ ] ONG confirma recebimento
6. [ ] Verificar doação muda para "Recebida"

### Scenario: ONG com Múltiplas Avaliações Baixas
1. [ ] ONG cria 1 projeto
2. [ ] 3 doadores fazem doações com avaliações de 1 estrela
3. [ ] Média de avaliações calculada corretamente
4. [ ] Verificar que projeto é desativado (auto) quando média < 2
5. [ ] Confirmar mudança de status em "Meus Projetos"

---

## Assinatura de Conclusão

Testador: ________________  
Data: ________________  
Resultado: ☐ PASSOU | ☐ FALHOU  
Observações: _________________________________________________

---

**Nota**: Este checklist deve ser executado em diferentes dispositivos (iOS/Android) e navegadores quando aplicável. Erros críticos devem ser anotados e priorizados antes da apresentação do TCC.
