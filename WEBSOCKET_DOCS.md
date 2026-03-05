# Documentação WebSocket

O Swagger documenta apenas as rotas HTTP. Para os eventos WebSocket, veja abaixo:

## Conexão

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'SEU_JWT_TOKEN', // Token obtido via /auth/login ou /auth/register
  },
});
```

**Autenticação**: O token JWT deve ser enviado no campo `auth.token` durante o handshake ou no header `Authorization: Bearer <token>`.

**Desconexão automática**: Se o token for inválido ou ausente, a conexão será rejeitada automaticamente.

**Auto-join em conversas**: Ao conectar, o usuário é automaticamente inscrito em todas as suas conversas (rooms no formato `conversation:{id}`).

---

## Eventos (Client → Server)

### `conversations:join`

**Descrição**: Permite entrar manualmente em uma conversa específica (caso não tenha sido feito automaticamente na conexão).

**Payload**:
```typescript
{
  conversationId: string; // ID da conversa
}
```

**Resposta**:
```typescript
{
  success: boolean;
  conversationId?: string;
  error?: string;
}
```

**Validação**: O usuário deve ser participante da conversa.

---

### `messages:send`

**Descrição**: Envia uma mensagem para uma conversa específica.

**Payload**:
```typescript
{
  conversationId: string; // ID da conversa
  content: string;        // Conteúdo da mensagem (1-1000 caracteres)
}
```

**Resposta**: Retorna o objeto da mensagem criada:
```typescript
{
  id: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  conversation: {
    id: string;
  };
}
```

**Validação**:
- Usuário autenticado (via JWT)
- Usuário deve ser participante da conversa
- Content entre 1 e 1000 caracteres

**Side effects**: A mensagem é salva no banco de dados e um broadcast é enviado para todos os participantes conectados da conversa.

---

## Eventos (Server → Client)

### `messages:new`

**Descrição**: Notifica todos os participantes de uma conversa quando uma nova mensagem é enviada.

**Payload**:
```typescript
{
  id: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  conversation: {
    id: string;
  };
}
```

**Quando é emitido**: Sempre que alguém envia uma mensagem via evento `messages:send`.

**Quem recebe**: Apenas os participantes da conversa que estão conectados (broadcast usando Socket.IO rooms).

**Uso no cliente**:
```typescript
socket.on('messages:new', (message) => {
  console.log('Nova mensagem recebida:', message);
  // Adicionar mensagem à UI
});
```

---

## Exemplo Completo

```typescript
import { io } from 'socket.io-client';

// Conectar
const socket = io('http://localhost:3000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
});

// Eventos de conexão
socket.on('connect', () => {
  console.log('Conectado ao servidor');
});

socket.on('disconnect', () => {
  console.log('Desconectado do servidor');
});

// Receber novas mensagens
socket.on('messages:new', (message) => {
  console.log('📩 Nova mensagem:', message);
});

// Enviar mensagem
socket.emit('messages:send', {
  conversationId: 'clxyz789',
  content: 'Olá pessoal!',
}, (response) => {
  console.log('✅ Mensagem enviada:', response);
});

// Entrar em conversa manualmente (opcional)
socket.emit('conversations:join', {
  conversationId: 'clxyz789',
}, (response) => {
  if (response.success) {
    console.log('✅ Entrou na conversa:', response.conversationId);
  } else {
    console.error('❌ Erro:', response.error);
  }
});
```

---

## Hierarquia de Rooms

O Socket.IO utiliza rooms para gerenciar broadcasts:

- `conversation:{conversationId}` - Todos os participantes de uma conversa específica
- Cada socket é automaticamente inscrito em todas as conversas do usuário ao conectar
- Broadcast de mensagens é feito apenas para a room da conversa específica

---

## Tratamento de Erros

### Token inválido ou ausente
- **Resultado**: Desconexão imediata
- **Como evitar**: Sempre envie o token JWT válido no campo `auth.token`

### Usuário não é participante da conversa
- **Evento**: `messages:send`
- **Resultado**: Erro retornado na callback
- **Mensagem**: "Você não é participante desta conversa"

### Validação de dados
- **Evento**: `messages:send`
- **Resultado**: Erro de validação se o payload não atender aos requisitos
- **Exemplo**: Content vazio ou maior que 1000 caracteres

---

## Boas Práticas

1. **Reconectar automaticamente**: Use `reconnection: true` nas opções do cliente Socket.IO
2. **Armazenar token**: Persista o JWT no localStorage/sessionStorage para reconexões
3. **Tratamento de desconexão**: Implemente lógica para lidar com desconexões inesperadas
4. **Confirmação de envio**: Use callbacks ou acknowledgments para confirmar que a mensagem foi recebida pelo servidor
5. **Indicador de digitação**: Considere adicionar eventos customizados para "usuário está digitando"

---

## Diferenças entre HTTP e WebSocket

| Recurso | HTTP REST | WebSocket |
|---------|-----------|-----------|
| Enviar mensagem | ❌ Não disponível | ✅ `messages:send` |
| Receber notificações em tempo real | ❌ Polling necessário | ✅ `messages:new` |
| Listar mensagens históricas | ✅ `GET /messages` | ❌ Use HTTP |
| Criar conversa | ✅ `POST /messages/conversations` | ❌ Use HTTP |
| Listar conversas | ✅ `GET /messages/conversations` | ❌ Use HTTP |
| Autenticação | ✅ Bearer Token | ✅ `auth.token` no handshake |

**Recomendação**: Use HTTP para operações de leitura/listagem e WebSocket apenas para mensagens em tempo real.
