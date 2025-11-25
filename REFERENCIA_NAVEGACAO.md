# 📱 REFERÊNCIA RÁPIDA DE NAVEGAÇÃO

## 🎯 Guia de Bolso para Desenvolvedores

### Como Navegar Para Cada Tela

```javascript
// ONBOARDING
navigation.navigate('Introducao');
navigation.navigate('PExplicacao');
navigation.navigate('SExplicacao');
navigation.navigate('EscolhaDeFuncao');

// AUTENTICAÇÃO
navigation.navigate('Login');
navigation.navigate('Cadastro');
navigation.navigate('LoginInstituicao');
navigation.navigate('CadastroInst');

// APÓS LOGIN - HOME (Doador)
navigation.navigate('Home'); // Vai para a tela HOME (TABS)

// TABS DOADOR (dentro de Home)
navigation.navigate('Home');           // TAB 1
navigation.navigate('Estatisticas');   // TAB 2
navigation.navigate('Doar');           // TAB 3
navigation.navigate('Favoritos');      // TAB 4
navigation.navigate('Perfil');         // TAB 5

// PROJETOS
navigation.navigate('DetalhesProjeto', { 
  projeto: { id, titulo, descricao, ... } 
});
navigation.navigate('MinhasDoacoes');

// MODAIS
navigation.navigate('FormularioDoacao'); // Abre modal de doação
navigation.navigate('FilterModal');      // Abre modal de filtros

// CONFIGURAÇÕES DOADOR
navigation.navigate('EditarPerfil');
navigation.navigate('Enderecos');
navigation.navigate('Notificacoes');
navigation.navigate('HistoricoAtividades');
navigation.navigate('Privacidade');
navigation.navigate('SobreApp');
navigation.navigate('AjudaSuporte');

// INSTITUIÇÃO - TABS
navigation.navigate('DashboardInstituicao');  // TAB 1
navigation.navigate('MeusProjetos');          // TAB 2
navigation.navigate('DoacoesRecebidas');      // TAB 3
// TAB 4 é HistoricoAtividades
// TAB 5 é PerfilInstituicao

// PROJETOS - INSTITUIÇÃO
navigation.navigate('CriarProjeto');
navigation.navigate('EditarProjeto');

// INSTITUIÇÃO - PERFIL
navigation.navigate('EstatisticasInstituicao');

// VOLTAR
navigation.goBack();

// LOGOUT (Limpa histórico)
navigation.replace('Login');                  // Doador
navigation.replace('LoginInstituicao');       // Instituição
```

---

## 📊 Estrutura de Abas

### Doador (TabRoutes)
```
[Home]              → HomeStack
[Estatisticas]      → EstatisticasStack
[Doar]              → DoarStack
[Favoritos]         → FavoritosStack
[Perfil]            → PerfilStack
```

### Instituição (InstituicaoNavigator)
```
[Dashboard]         → DashboardStack
[MeusProjetos]      → MeusProjetosStack
[DoacoesRecebidas]  → DoacoesRecebidas Stack
[Histórico]         → HistoricoAtividades Stack
[Perfil]            → PerfilInstituicao Stack
```

---

## 🔀 Fluxo de Parâmetros

### Passando Dados Entre Telas

```javascript
// ✅ CORRETO - Passar objeto completo
navigation.navigate('DetalhesProjeto', { 
  projeto: { 
    id: '123',
    titulo: 'Projeto X',
    descricao: 'Descrição...',
    instituicaoId: 'inst123',
    ...
  } 
});

// ❌ ERRADO - Passar apenas ID
navigation.navigate('DetalhesProjeto', { 
  projetoId: '123'  // Não! Espera 'projeto' objeto completo
});

// Recebendo os parâmetros
function DetalhesProjeto({ route, navigation }) {
  const projeto = route.params?.projeto;
  // projeto está completo aqui
}
```

### Passando Dados em Callbacks

```javascript
// Exemplo: FormularioDoacao
<FormularioDoacao
  projeto={projeto}
  onSuccess={() => {
    // Ação ao sucesso
    navigation.goBack();
  }}
  onCancel={() => {
    // Ação ao cancelar
    setMostrarFormulario(false);
  }}
/>
```

---

## 🛡️ Verificações de Segurança

### Proteger Contra Navegação Undefined

```javascript
// ❌ ERRADO
if (!navigation) {
  // navigation pode ser undefined em modals
  navigation.goBack();
}

// ✅ CORRETO
useEffect(() => {
  const unsubscribe = navigation?.addListener('focus', () => {
    // Recarregar dados
  });
  return unsubscribe;
}, [navigation]);
```

### Verificar Autenticação Antes de Navegar

```javascript
// ❌ ERRADO
const irParaPerfil = () => {
  navigation.navigate('Perfil');
};

// ✅ CORRETO
const irParaPerfil = async () => {
  const user = auth.currentUser;
  if (!user) {
    Alert.alert('Erro', 'Você precisa estar logado');
    navigation.navigate('Login');
    return;
  }
  navigation.navigate('Perfil');
};
```

### Verificar Objeto Antes de Usar

```javascript
// ❌ ERRADO
function MeusComponente({ route }) {
  const projeto = route.params.projeto;
  // Pode dar erro se projeto for undefined
  return <Text>{projeto.titulo}</Text>;
}

// ✅ CORRETO
function MeuComponente({ route }) {
  const projeto = route.params?.projeto;
  if (!projeto) {
    return <Text>Projeto não encontrado</Text>;
  }
  return <Text>{projeto.titulo}</Text>;
}
```

---

## 📋 Checklist para Adicionar Nova Tela

Ao adicionar uma nova tela ao app, seguir este checklist:

### 1. Criar Arquivo da Tela
```javascript
// screens/MinhaNovaScreen.js
import React from 'react';
import { View, Text } from 'react-native';

export default function MinhaNovaScreen({ navigation, route }) {
  // Seu código aqui
  return (
    <View>
      <Text>Minha nova tela</Text>
    </View>
  );
}
```

### 2. Adicionar em StackRoutes.js
```javascript
// routes/StackRoutes.js
import MinhaNovaScreen from '../screens/MinhaNovaScreen';

// Dentro de Stack.Navigator:
<Stack.Screen name="MinhaNovaScreen" component={MinhaNovaScreen} />
```

### 3. Navegar Para ela
```javascript
navigation.navigate('MinhaNovaScreen', { /* parâmetros */ });
```

### 4. Voltar
```javascript
navigation.goBack();
```

---

## 🔍 Debugging de Navegação

### Ver Histórico de Navegação

```javascript
// Adicionar ao App.js para debug
import { NavigationContainer } from '@react-navigation/native';

const navigationRef = React.createRef();

function logCurrentScreen() {
  const state = navigationRef.current?.getRootState();
  console.log('Tela atual:', state?.routes[state.routes.length - 1]?.name);
}

export default function App() {
  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={() => logCurrentScreen()}
      onStateChange={logCurrentScreen}
    >
      {/* seu código */}
    </NavigationContainer>
  );
}
```

### Listener de Navegação

```javascript
// Executar quando uma tela recebe foco
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    console.log('Tela focou!');
    // Recarregar dados, etc
  });

  return unsubscribe;
}, [navigation]);
```

### Listener de Blur (saiu do foco)

```javascript
useEffect(() => {
  const unsubscribe = navigation.addListener('blur', () => {
    console.log('Tela saiu do foco');
    // Salvar dados, limpar, etc
  });

  return unsubscribe;
}, [navigation]);
```

---

## 🎬 Animações de Transição

### Stack Navigator Default
```javascript
// Automaticamente vem com slide_from_right
animation: 'slide_from_right'  // Default
animation: 'fade'              // Fade
animation: 'none'              // Nenhuma
```

### Bottom Tab Navigator
```javascript
// Sem animação padrão (muda de aba instantaneamente)
// Para adicionar animação, usar librarias extras:
// react-native-tab-view, react-native-pager-view
```

---

## 🌐 Estrutura de Rotas no App.js

```javascript
// App.js (Estrutura simplificada)
import StackRoutes from './routes/StackRoutes';

export default function App() {
  return (
    <NavigationContainer>
      <StackRoutes />
      {/* StackRoutes gerencia:
          - Onboarding
          - Auth (Login/Cadastro)
          - Home (contém TabRoutes)
          - Instituição (contém InstituicaoNavigator)
          - Telas adicionais (DetalhesProjeto, etc)
      */}
    </NavigationContainer>
  );
}

// StackRoutes.js
// ├─ Introducao
// ├─ PExplicacao
// ├─ SExplicacao
// ├─ EscolhaDeFuncao
// ├─ Login
// ├─ Cadastro
// ├─ LoginInstituicao
// ├─ CadastroInst
// ├─ Home (contém TabRoutes)
// │  ├─ Home Tab → HomeStack
// │  ├─ Estatisticas Tab
// │  ├─ Doar Tab → DoarStack
// │  ├─ Favoritos Tab → FavoritosStack
// │  └─ Perfil Tab → PerfilStack
// ├─ InstituicaoNavigator (contém Tabs de Instituição)
// │  ├─ Dashboard Tab
// │  ├─ MeusProjetos Tab
// │  ├─ DoacoesRecebidas Tab
// │  ├─ HistoricoAtividades Tab
// │  └─ PerfilInstituicao Tab
// ├─ DetalhesProjeto
// ├─ FormularioDoacao
// ├─ MinhasDoacoes
// ├─ EditarPerfil
// ├─ Enderecos
// ├─ Notificacoes
// ├─ HistoricoAtividades
// ├─ Privacidade
// ├─ SobreApp
// ├─ AjudaSuporte
// ├─ CriarProjeto
// ├─ EditarProjeto
// ├─ DoacoesRecebidas (Instituição)
// └─ EstatisticasInstituicao
```

---

## 🔐 Controle de Acesso

### Verificação de Autenticação
```javascript
const user = auth.currentUser;

if (!user) {
  // Não autenticado → vai para Login
  navigation.replace('Login');
}

// Verificar tipo de conta
const docRef = doc(db, 'users', user.uid);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const tipo = docSnap.data().tipo; // 'doador' ou 'instituicao'
  if (tipo === 'doador') {
    navigation.replace('Home');
  } else if (tipo === 'instituicao') {
    navigation.replace('InstituicaoNavigator');
  }
}
```

---

## 📱 Diferenças Entre Plataformas

### iOS
```javascript
// Gesto de swipe da esquerda = goBack
// Botão back no header (se headerShown: true)
```

### Android
```javascript
// Botão back físico = goBack
// Botão < no header (se headerShown: true)
```

### Ambas
```javascript
// onPress={() => navigation.goBack()} sempre funciona
```

---

## 🚨 Erros Comuns

### Erro 1: "Cannot read property 'navigate' of undefined"
```javascript
// Problema: Componente não recebe navigation prop
function MinhaComponent() {  // ❌
  navigation.navigate('Home');
}

// Solução 1: Adicionar prop
function MinhaComponent({ navigation }) {  // ✅
  navigation.navigate('Home');
}

// Solução 2: Usar hook
import { useNavigation } from '@react-navigation/native';

function MinhaComponent() {  // ✅
  const navigation = useNavigation();
  navigation.navigate('Home');
}
```

### Erro 2: "Modal doesn't receive navigation prop"
```javascript
// Modal não precisa de navigation prop
// Passar via props do componente pai

function Pai() {
  const [visible, setVisible] = useState(false);
  return (
    <Modal visible={visible}>
      <Filho onClose={() => setVisible(false)} />
    </Modal>
  );
}

function Filho({ onClose }) {
  return (
    <TouchableOpacity onPress={onClose}>
      <Text>Fechar</Text>
    </TouchableOpacity>
  );
}
```

### Erro 3: "route.params is undefined"
```javascript
// ❌ Errado
const projeto = route.params.projeto;

// ✅ Correto
const projeto = route.params?.projeto;

// ✅ Mais seguro
const projeto = route.params?.projeto || null;
if (!projeto) {
  return <Text>Projeto não encontrado</Text>;
}
```

### Erro 4: "Can't perform a React state update on an unmounted component"
```javascript
// Problema: Componente desmonta antes de promise resolver
useEffect(() => {
  fetch('/data')
    .then(data => setState(data))  // ❌ Pode falhar
    .catch(err => console.error(err));
}, []);

// Solução: Verificar se componente ainda está montado
useEffect(() => {
  let isMounted = true;
  
  fetch('/data')
    .then(data => {
      if (isMounted) setState(data);  // ✅ Seguro
    })
    .catch(err => console.error(err));
  
  return () => {
    isMounted = false;
  };
}, []);
```

---

## 💡 Tips & Tricks

### Navegação com Delay
```javascript
setTimeout(() => {
  navigation.navigate('Home');
}, 1000);
```

### Navegar e Passar Dados de Volta
```javascript
// Tela A
navigation.navigate('TelaB', {
  onReturn: (dados) => {
    console.log('Dados de volta:', dados);
  }
});

// Tela B
const handleVoltar = () => {
  route.params.onReturn({ resultado: 'dados' });
  navigation.goBack();
};
```

### Reset da Stack
```javascript
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
```

### Verificar se Tela Está em Foco
```javascript
const isFocused = useIsFocused();

useEffect(() => {
  if (isFocused) {
    // Recarregar dados
  }
}, [isFocused]);
```

---

## 📚 Documentação Oficial

- [React Navigation](https://reactnavigation.org/docs/getting-started/)
- [Stack Navigator](https://reactnavigation.org/docs/stack-navigator/)
- [Bottom Tab Navigator](https://reactnavigation.org/docs/bottom-tab-navigator/)
- [Navigation Params](https://reactnavigation.org/docs/params/)

---

*Guia de Referência Rápida - Benigno v1.0*
*Última atualização: 24/11/2025*
