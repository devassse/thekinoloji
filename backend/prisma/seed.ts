/* Idempotent seed: safe to run several times (never overwrites what you edited). */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/defaults";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600e3);

const BODY =
  "<p>A indústria tecnológica vive um dos momentos de maior transformação das últimas décadas. Novos produtos, novas plataformas e novos hábitos de consumo estão a redefinir a forma como trabalhamos, aprendemos e nos divertimos.</p>" +
  "<h2>O que muda na prática</h2>" +
  "<p>Para o utilizador comum, o impacto sente-se no desempenho, na autonomia e no preço. Para as empresas, abre-se espaço a novos modelos de negócio e a ganhos de produtividade que há poucos anos pareciam improváveis.</p>" +
  "<p>Em Moçambique, a expansão da conectividade móvel e a adopção de serviços digitais criam um terreno particularmente fértil para a inovação local.</p>" +
  "<h2>E agora?</h2>" +
  "<p>Os próximos meses serão decisivos. Vamos continuar a acompanhar de perto e a trazer-lhe análises claras, sem jargão desnecessário.</p>";

const USERS = [
  { key: "admin", name: "Administrador", email: "admin@thekinoloji.co.mz", role: "admin", pw: "admin123", avatar: "https://i.pravatar.cc/120?img=12" },
  { key: "joao", name: "João Devson", email: "joao@thekinoloji.co.mz", role: "editor", pw: "editor123", avatar: "https://i.pravatar.cc/120?img=15" },
  { key: "manuel", name: "Manuel Novela", email: "manuel@thekinoloji.co.mz", role: "author", pw: "author123", avatar: "https://i.pravatar.cc/120?img=33" },
  { key: "ana", name: "Ana Macuácua", email: "ana@thekinoloji.co.mz", role: "author", pw: "author123", avatar: "https://i.pravatar.cc/120?img=47" },
] as const;

const CATEGORIES = [
  ["Tecnologia", "tecnologia", "#1e6bff"], ["IA", "ia", "#0ea5e9"], ["Reviews", "reviews", "#6366f1"], ["Jogos", "jogos", "#7c3aed"],
  ["Gadgets", "gadgets", "#9333ea"], ["Internet", "internet", "#0891b2"], ["Ciência", "ciencia", "#2563eb"], ["Tutoriais", "tutoriais", "#059669"],
] as const;

// [title, excerpt, category slug, unsplash id, tags, author key, views, hours ago, featured]
const ARTICLES: [string, string, string, string, string[], string, number, number, boolean][] = [
  ["Apple lança novos MacBook Pro com chips M5: mais potência, mais eficiência", "A Apple apresentou oficialmente a nova geração do MacBook Pro, agora com os chips M5, prometendo um salto de desempenho e maior autonomia.", "tecnologia", "photo-1517336714731-489689fd1ca8", ["Apple", "Hardware"], "joao", 4210, 2, true],
  ["Samsung Galaxy S26 Ultra: vale a pena em 2026?", "Testámos o novo topo de gama da Samsung durante duas semanas. Câmara, bateria e inteligência artificial em análise.", "reviews", "photo-1511707171634-5f897ff02aa9", ["Android", "Samsung"], "manuel", 3180, 2, false],
  ["PlayStation 6: tudo o que sabemos até agora", "Rumores, patentes e declarações oficiais: o que já se conhece sobre a próxima consola da Sony.", "jogos", "photo-1606144042614-b2417e99c4e3", ["Gaming", "Hardware"], "ana", 2890, 4, false],
  ["Como a IA está a transformar o futuro do trabalho", "Automação, copilotos e novas profissões: o que muda para quem trabalha em escritório.", "ia", "photo-1677442136019-21780ecad995", ["IA", "Trabalho"], "manuel", 2540, 6, false],
  ["A revolução dos veículos eléctricos em 2026", "Preços mais baixos, mais autonomia e uma rede de carregamento em expansão.", "tecnologia", "photo-1593941707882-a5bba14938c7", ["Eléctricos", "Futuro"], "joao", 1900, 8, false],
  ["iPhone 17: o que esperar da nova geração da Apple", "Design, câmaras e um novo chip: reunimos tudo o que se sabe sobre o próximo iPhone.", "gadgets", "photo-1592750475338-74b7b21085ab", ["iPhone", "Apple"], "ana", 1500, 3, false],
  ["Melhores routers Wi-Fi 6 e 7 para a sua casa em 2026", "Cobertura, velocidade e preço: o guia para escolher o router certo.", "internet", "photo-1606904825846-647eb07f5be2", ["Internet", "Hardware"], "manuel", 900, 4, false],
  ["Auriculares sem fios: guia completo para 2026", "Cancelamento de ruído, qualidade de som e autonomia nos modelos que realmente valem a pena.", "gadgets", "photo-1505740420928-5e560c06d30e", ["Gadgets", "Áudio"], "ana", 870, 5, false],
  ["Novo estudo revela sinais de vida em exoplaneta", "Astrónomos detectaram assinaturas químicas intrigantes na atmosfera de um planeta distante.", "ciencia", "photo-1462331940025-496dfbfc7564", ["Ciência", "Espaço"], "joao", 1200, 7, false],
  ["Como ser mais produtivo com a tecnologia", "Dez ferramentas e hábitos simples para ganhar horas na sua semana.", "tutoriais", "photo-1498050108023-c5249f4df085", ["Software", "Produtividade"], "manuel", 760, 8, false],
  ["A IA já não é o futuro, é o presente: como está a mudar o nosso dia a dia", "Do trabalho à educação, a inteligência artificial já faz parte da nossa rotina. Veja como ela está a transformar o mundo.", "ia", "photo-1485827404703-89b55fcc595e", ["IA", "Futuro"], "joao", 3300, 6, true],
  ["Armazenamento na nuvem: qual o melhor para si?", "Comparámos preços, segurança e funcionalidades dos principais serviços.", "tecnologia", "photo-1544197150-b99a580bb7a8", ["Software", "Internet"], "ana", 640, 6, false],
  ["5G em Moçambique: o que já mudou e o que vem aí", "Cobertura, preços de dados e o que esperar nos próximos anos.", "internet", "photo-1451187580459-43490279c0fa", ["Internet", "Moçambique"], "manuel", 1750, 8, false],
  ["Como configurar o seu ambiente de desenvolvimento", "Do editor ao terminal: um setup limpo e rápido para começar a programar hoje.", "tutoriais", "photo-1461749280684-dccba630e2f6", ["Python", "JavaScript", "Software"], "joao", 700, 10, false],
  ["Como a tecnologia está a moldar o futuro das cidades", "Sensores, mobilidade partilhada e dados abertos nas cidades inteligentes.", "tecnologia", "photo-1480714378408-67cf0d13bc1b", ["Futuro", "Internet"], "ana", 500, 8, false],
  ["O metaverso além dos jogos: novas oportunidades", "Educação, saúde e trabalho remoto em realidade virtual.", "jogos", "photo-1593508512255-86ab42a8e620", ["Gaming", "Futuro"], "manuel", 480, 12, false],
  ["Os melhores smartwatches de 2026", "Saúde, desporto e notificações: os relógios inteligentes que dominam o mercado.", "gadgets", "photo-1523275335684-37898b6baf30", ["Gadgets", "Android"], "ana", 410, 14, false],
  ["Missão a Marte: os próximos passos da exploração espacial", "Janelas de lançamento, tecnologia e desafios da primeira missão tripulada.", "ciencia", "photo-1446776811953-b23d57bd21aa", ["Ciência", "Espaço"], "joao", 390, 96, false],
];

// extra (secondary) categories by index in ARTICLES
const EXTRA_CATS: Record<number, string[]> = { 1: ["gadgets"], 3: ["tecnologia"], 10: ["tecnologia"], 12: ["tecnologia"] };

// sample playlist — replace these in the backoffice (Vídeos)
const VIDEOS = [
  ["Como criar um site moderno com HTML, CSS e JavaScript", "UB1O30fR-EE", "12:48"],
  ["Melhores notebooks para 2026: qual escolher?", "hdI2bqOjy3c", "10:32"],
  ["Inteligência Artificial: o que vem por aí?", "PkZNo7MFNFg", "08:45"],
  ["Dicas para melhorar o desempenho do seu PC", "rfscVS0vtbw", "07:12"],
  ["O futuro dos jogos: tecnologias que vão revolucionar a indústria", "w7ejDZ8SWv8", "12:48"],
] as const;

async function main() {
  const users: Record<string, string> = {};
  for (const [i, u] of USERS.entries()) {
    const row = await prisma.user.upsert({
      where: { email: u.email }, update: {},
      create: { name: u.name, email: u.email, role: u.role, avatar: u.avatar, passwordHash: await bcrypt.hash(u.pw, 10), createdAt: hoursAgo(24 * (90 - i * 20)) },
    });
    users[u.key] = row.id;
  }

  const cats: Record<string, string> = {};
  for (const [i, [name, slug, color]] of CATEGORIES.entries()) {
    const row = await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug, color, createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)) } });
    cats[slug] = row.id;
  }

  for (const [idx, [title, excerpt, cat, photo, tags, author, views, h, featured]] of ARTICLES.entries()) {
    const slug = slugify(title).slice(0, 80);
    const row = await prisma.article.upsert({
      where: { slug }, update: {},
      create: { title, slug, excerpt, content: `<p>${excerpt}</p>${BODY}`, image: img(photo), tags, status: "published", featured, views, categoryId: cats[cat], authorId: users[author], createdAt: hoursAgo(h) },
    });
    const extras = (EXTRA_CATS[idx] ?? []).map((c) => ({ articleId: row.id, categoryId: cats[c] }));
    if (extras.length) await prisma.articleCategory.createMany({ data: extras, skipDuplicates: true });
  }
  await prisma.article.upsert({
    where: { slug: "guia-de-ciberseguranca-para-pequenas-empresas" }, update: {},
    create: { title: "Guia de cibersegurança para pequenas empresas", slug: "guia-de-ciberseguranca-para-pequenas-empresas", excerpt: "Rascunho: boas práticas essenciais para proteger dados e contas.", content: `<p>Rascunho.</p>${BODY}`, image: img("photo-1550751827-4bd374c3f58b"), tags: ["Segurança"], status: "draft", categoryId: cats["tutoriais"], authorId: users["manuel"], createdAt: hoursAgo(1) },
  });

  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, ...DEFAULT_SETTINGS } });

  if ((await prisma.video.count()) === 0) {
    for (const [i, [title, youtubeId, duration]] of VIDEOS.entries()) {
      await prisma.video.create({ data: { title, youtubeId, duration, createdAt: hoursAgo(i + 1) } });
    }
  }

  // two sample subscribers so you can try the SMS flow (SMS_PROVIDER=console just prints the message)
  await prisma.subscriber.upsert({ where: { email: "leitor1@example.com" }, update: {}, create: { email: "leitor1@example.com", phone: "+258841234567", smsConsent: true } });
  await prisma.subscriber.upsert({ where: { email: "leitor2@example.com" }, update: {}, create: { email: "leitor2@example.com" } });

  console.log("Seed concluído. Admin: admin@thekinoloji.co.mz / admin123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
