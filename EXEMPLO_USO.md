# Exemplo de uso do Chat Socket

## 1. Registro de usuários

```bash
# Usuário 1
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "123456",
    "avatar": "https://avatar.joao.jpg"
  }'

# Resposta:
# {
#   "accessToken": "eyJhbG...",
#   "user": {
#     "id": "user1_id",
#     "name": "João Silva",
#     "email": "joao@email.com",
#     "avatar": "https://avatar.joao.jpg",
#     "createdAt": "2026-03-04..."
#   }
# }

# Usuário 2
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@email.com",
    "password": "123456"
  }'
```

## 2. Criar conversa

```bash
# João cria conversa com Maria
curl -X POST http://localhost:3000/messages/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JOAO>" \
  -d '{
    "participantIds": ["user2_id"]
  }'

# Resposta:
# {
#   "id": "conversation_id",
#   "createdAt": "...",
#   "participants": [
#     {
#       "id": "...",
#       "user": {
#         "id": "user1_id",
#         "name": "João Silva",
#         "email": "joao@email.com",
#         "avatar": "..."
#       }
#     },
#     {
#       "id": "...",
#       "user": {
#         "id": "user2_id",
#         "name": "Maria Santos",
#         "email": "maria@email.com",
#         "avatar": null
#       }
#     }
#   ]
# }
```

## 3. Listar conversas do usuário

```bash
curl -X GET http://localhost:3000/messages/conversations \
  -H "Authorization: Bearer <TOKEN_JOAO>"
```

## 4. Conectar ao socket e enviar mensagens

```javascript
// Cliente do João
import { io } from 'socket.io-client';

const socketJoao = io('http://localhost:3000', {
  auth: {
    token: 'TOKEN_JOAO',
  },
});

socketJoao.on('connect', () => {
  console.log('João conectado');
});

// Receber novas mensagens
socketJoao.on('messages:new', (message) => {
  console.log('Nova mensagem:', message);
});

// Enviar mensagem
socketJoao.emit('messages:send', {
  conversationId: 'conversation_id',
  content: 'Olá Maria!',
});

// Cliente da Maria
const socketMaria = io('http://localhost:3000', {
  auth: {
    token: 'TOKEN_MARIA',
  },
});

socketMaria.on('messages:new', (message) => {
  console.log('Maria recebeu:', message);
  // {
  //   id: "msg_id",
  //   content: "Olá Maria!",
  //   createdAt: "...",
  //   sender: {
  //     id: "user1_id",
  //     name: "João Silva",
  //     email: "joao@email.com",
  //     avatar: "..."
  //   },
  //   conversation: { id: "conversation_id" }
  // }
});

// Maria responde
socketMaria.emit('messages:send', {
  conversationId: 'conversation_id',
  content: 'Oi João, tudo bem?',
});
```

## 5. Listar mensagens da conversa (HTTP)

```bash
curl -X GET "http://localhost:3000/messages?conversationId=conversation_id&page=1&limit=20" \
  -H "Authorization: Bearer <TOKEN_JOAO>"

# Resposta:
# {
#   "items": [
#     {
#       "id": "msg2_id",
#       "content": "Oi João, tudo bem?",
#       "createdAt": "...",
#       "sender": {
#         "id": "user2_id",
#         "name": "Maria Santos",
#         "email": "maria@email.com",
#         "avatar": null
#       }
#     },
#     {
#       "id": "msg1_id",
#       "content": "Olá Maria!",
#       "createdAt": "...",
#       "sender": {
#         "id": "user1_id",
#         "name": "João Silva",
#         "email": "joao@email.com",
#         "avatar": "..."
#       }
#     }
#   ],
#   "pagination": {
#     "page": 1,
#     "limit": 20,
#     "total": 2,
#     "totalPages": 1
#   }
# }
```

## Recursos implementados

✅ Autenticação JWT (register/login)
✅ Campo `name` obrigatório no usuário
✅ Campo `avatar` opcional no usuário
✅ Sistema de conversas com múltiplos participantes
✅ Mensagens vinculadas a conversas
✅ Socket.IO com rooms por conversa (broadcast apenas para participantes)
✅ Listagem paginada de mensagens por conversa
✅ Validação: usuário só envia mensagem se for participante
✅ Auto-join em conversas ao conectar no socket
