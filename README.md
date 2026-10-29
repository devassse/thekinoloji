# Thekinoloji — Frontend (Next.js) + Backend (Express · Prisma · Postgres)

```
fullstack/
├─ backend/    API REST — Node.js, Express, Prisma, PostgreSQL   → http://localhost:4000
├─ frontend/   Site público + backoffice (/admin) — Next.js 14   → http://localhost:3000
└─ docker-compose.yml   Postgres para desenvolvimento
```

## Arrancar (3 terminais)

**1. Base de dados + backend**
```bash
docker compose up -d                  # Postgres em localhost:5432 (ou use o seu Postgres e ajuste DATABASE_URL)
cd backend
cp .env.example .env                  # defina JWT_SECRET
npm install                           # também corre `prisma generate`
npm run migrate:deploy                # aplica as migrations (cria as tabelas)
npm run seed                          # categorias, utilizadores, 18 artigos, definições, 2 subscritores de teste
npm run dev                           # API em http://localhost:4000  (teste: /health)
```

**2. Frontend**
```bash
cd frontend
cp .env.example .env.local            # API_URL=http://localhost:4000
npm install
npm run dev                           # http://localhost:3000   ·   backoffice: /admin
```

Contas de demonstração (criadas pelo seed):

| Perfil | Email | Palavra-passe |
|---|---|---|
| Administrador | admin@thekinoloji.co.mz | admin123 |
| Editor | joao@thekinoloji.co.mz | editor123 |
| Autor | manuel@thekinoloji.co.mz | author123 |

**Altere estas palavras-passe** (Definições → Utilizadores) antes de pôr o site online. O seed pode ser repetido sem apagar o que editou.

## Actualizar uma instalação existente
```bash
cd backend && npm install && npm run migrate:deploy && npm run seed   # nova migration: vídeos, várias categorias, redes sociais
cd ../frontend && npm install                                        # (sem novas dependências)
```
O seed é seguro de repetir: acrescenta os vídeos de exemplo e categorias extra a alguns artigos, sem apagar o que já editou.

## Migrations (Prisma)
- Schema: `backend/prisma/schema.prisma` · migration inicial: `backend/prisma/migrations/20261020000000_init`.
- Aplicar em qualquer ambiente: `npm run migrate:deploy`.
- Ao alterar o schema em desenvolvimento: `npm run migrate:dev -- --name descricao_da_alteracao`.
- Se o `migrate dev` indicar divergência (a migration inicial foi escrita à mão), apague a pasta `prisma/migrations/20261020000000_init` e a base de dados de desenvolvimento e corra `npx prisma migrate dev --name init`.
- Ver/editar dados: `npm run studio`.

## Como o frontend fala com a API
- Páginas do servidor (Next) chamam a API com `fetch` — ver `frontend/src/lib/api.ts` (um método por endpoint, tipado em `types.ts`).
- Login: o Next chama `POST /api/auth/login`, guarda o JWT num cookie **httpOnly** e envia-o como `Authorization: Bearer` nas chamadas do backoffice. O navegador nunca vê o token.
- Imagens carregadas: o editor envia para `/api/admin/upload` (Next), que reencaminha para a API. Ficam em `backend/uploads` e são servidas em `/uploads/...` (o Next faz rewrite para a API, por isso o URL é sempre do mesmo domínio).
- Erros da API chegam como `{ "error": "codigo" }` e o frontend converte em mensagens (`MESSAGES` em `utils.ts`).

## Endpoints principais
| Público | |
|---|---|
| `GET /api/public/site` | definições públicas + categorias |
| `GET /api/public/articles?category=&q=&limit=` | artigos publicados |
| `GET /api/public/articles/:slug` · `POST …/:slug/view` | artigo (rascunho só com token) · contar visita |
| `GET /api/public/videos?limit=` | vídeos da playlist (home) |
| `POST /api/public/subscribe` | newsletter `{ email, phone?, sms }` |

| Backoffice (`Authorization: Bearer`) | Perfis |
|---|---|
| `POST /api/auth/login` · `GET/PUT /api/auth/me` (perfil, foto, palavra-passe) | — |
| `/api/admin/articles` (CRUD, `POST :id/toggle-publish`) | todos (autor: só os seus) · publicar/eliminar: admin, editor |
| `/api/admin/categories` | ler: todos · escrever: admin, editor |
| `/api/admin/users` · `/api/admin/settings` | admin |
| `/api/admin/subscribers` (+ `/export` CSV) · `/api/admin/videos` | admin, editor |
| `/api/admin/stats` · `/authors` · `/sms-info` | staff |
| `POST /api/uploads` | staff |

## Tema claro/escuro
Segue automaticamente a definição do sistema (`prefers-color-scheme`), no site e no backoffice. As cores estão em variáveis CSS em `frontend/src/app/globals.css`.

## SMS
Em `backend/.env`: `SMS_PROVIDER=console` (por omissão, só imprime no terminal da API), `africastalking` ou `twilio` + credenciais. Ao publicar um artigo com “Enviar SMS” marcado, a API envia título + resumo + link a quem deu consentimento (uma vez por artigo). Modelo editável em Definições.

## Produção — a ter em conta
- `JWT_SECRET` forte; `SITE_URL` (backend e frontend) com o domínio real; `CORS_ORIGIN` com o domínio do site.
- `backend/uploads` precisa de disco persistente (ou troque por S3/Cloudinary em `routes/uploads.ts`).
- `npm run build && npm start` em ambos os projectos; `npm run migrate:deploy` antes de iniciar a API.

## Deploy com Docker (VPS)
```bash
cp .env.example .env && nano .env     # DOMAIN, SITE_URL, POSTGRES_PASSWORD, JWT_SECRET
./deploy.sh                           # build + arranque (db, api, web, caddy/HTTPS)
./deploy.sh seed                      # 1ª vez: cria categorias/contas demo (mudar passwords depois!)
./deploy.sh uploads                   # opcional: copiar backend/uploads local para o volume
./deploy.sh logs
```
O DNS do domínio tem de apontar para o IP do VPS e as portas 80/443 estar abertas. Desenvolvimento local: `docker compose -f docker-compose.dev.yml up -d`.
