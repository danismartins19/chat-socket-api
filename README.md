# Chat Socket (Nest + Prisma + MySQL)

Backend de chat com:

- autenticação por email e senha
- JWT para proteger HTTP e WebSocket
- sistema de conversas com múltiplos participantes
- envio/recebimento de mensagens via Socket.IO por conversa
- persistência de mensagens no MySQL com Prisma
- rota paginada para buscar histórico de mensagens por conversa
- avatar opcional para usuários

## 1) Configuração

```bash
pnpm install
```

Crie o `.env` a partir do `.env.example`:

```env
PORT=3000
JWT_SECRET=troque-esse-segredo
DATABASE_URL="mysql://root:root@localhost:3306/chat_socket"
```

## 2) Prisma

```bash
pnpm prisma:generate
pnpm prisma:migrate --name conversas
```

## 3) Rodar API

```bash
pnpm start:dev
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação Swagger

Acesse a documentação interativa da API em:

**`http://localhost:3000/api`**

O Swagger disponibiliza:
- ✅ Documentação completa de todos os endpoints HTTP
- ✅ Schemas de request e response
- ✅ Teste interativo de rotas (Try it out)
- ✅ Autenticação JWT integrada (clique em "Authorize" e cole o token)

**Nota**: Eventos WebSocket não aparecem no Swagger. Consulte [WEBSOCKET_DOCS.md](WEBSOCKET_DOCS.md) para documentação completa do WebSocket.

### Como testar rotas protegidas no Swagger

1. Execute `POST /auth/register` ou `POST /auth/login` para obter o `accessToken`
2. Clique no botão **"Authorize"** (cadeado) no topo da página
3. Cole o token JWT no campo (sem prefixo "Bearer")
4. Clique em "Authorize" e depois "Close"
5. Agora você pode testar as rotas protegidas (ex: `/messages/conversations`)

## Rotas HTTP

### Register

`POST /auth/register`

```json
{
  "name": "João Silva",
  "email": "user1@email.com",
  "password": "123456",
  "avatar": "https://exemplo.com/avatar.jpg" // opcional
}
```

### Login

`POST /auth/login`

```json
{
  "email": "user1@email.com",
  "password": "123456"
}
```

Retorno (register/login):

```json
{
  "accessToken": "jwt...",
  "user": {
    "id": "...",
    "name": "João Silva",
    "email": "user1@email.com",
    "avatar": "https://exemplo.com/avatar.jpg",
    "createdAt": "2026-03-04T00:00:00.000Z"
  }
}
```

### Criar conversa

`POST /messages/conversations`

Headers: `Authorization: Bearer <accessToken>`

```json
{
  "participantIds": ["userId1", "userId2"]
}
```

O criador é automaticamente adicionado como participante.

### Listar conversas do usuário

`GET /messages/conversations`

Headers: `Authorization: Bearer <accessToken>`

Retorna todas as conversas do usuário autenticado com a última mensagem.

### Listar mensagens (paginado)

`GET /messages?conversationId=xxx&page=1&limit=20`

Headers: `Authorization: Bearer <accessToken>`

## Socket.IO

Conectar enviando JWT no handshake:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'SEU_JWT',
  },
});
```

Ao conectar, o usuário é automaticamente inscrito em todas as suas conversas.

### Evento para entrar em conversa (opcional)

- client -> server: `conversations:join`

Payload:

```json
{
  "conversationId": "conversationId"
}
```

### Evento para enviar mensagem

- client -> server: `messages:send`

Payload:

```json
{
  "conversationId": "xxx",
  "content": "Olá, chat!"
}
```

### Evento de broadcast de nova mensagem

- server -> clients da conversa: `messages:new`

Apenas os participantes da conversa recebem o broadcast da nova mensagem.
