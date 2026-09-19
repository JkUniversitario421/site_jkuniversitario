/**
 * Service Worker (sw.js) — gerencia cache, instalação PWA e notificações push
 *
 * Responsabilidades:
 * 1. Cache de arquivos estáticos para funcionamento offline
 * 2. Intercepta requisições e serve do cache quando possível (estratégia stale-while-revalidate)
 * 3. Recebe notificações push do servidor e exibe para o usuário
 * 4. Gerencia cliques em notificações (abre o app ou link específico)
 *
 * Este arquivo é registrado no main.tsx e vive na raiz /public
 * para que tenha escopo sobre todo o domínio.
 */

// ====== Nomes dos caches ======
const CACHE_ESTATICO = 'jk-universitario-v2';
const ARQUIVOS_PARA_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

// ====== Evento: Install (quando o SW é instalado) ======
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_ESTATICO).then((cache) => {
      return cache.addAll(ARQUIVOS_PARA_CACHE);
    })
  );
  // Ativa o SW imediatamente sem esperar recarga
  self.skipWaiting();
});

// ====== Evento: Activate (quando o SW é ativado) ======
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((listaCaches) => {
      return Promise.all(
        listaCaches
          .filter((nome) => nome !== CACHE_ESTATICO)
          .map((nome) => caches.delete(nome))
      );
    })
  );
  // Toma controle de todas as abas imediatamente
  self.clients.claim();
});

// ====== Evento: Fetch (intercepta requisições de rede) ======
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET (POST, PUT, etc. vão direto para a rede)
  if (event.request.method !== 'GET') return;

  // Ignora requisições para APIs do Firebase (Firestore, Auth e Storage para buscar sempre dados em tempo real)
  if (
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebasestorage.googleapis.com') ||
    event.request.url.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }

  // Ignora requisições para o Google Maps
  if (event.request.url.includes('google.com/maps')) return;

  // Estratégia stale-while-revalidate: serve do cache, atualiza em segundo plano
  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      const fetchPromessa = fetch(event.request)
        .then((respostaRede) => {
          // Clona a resposta antes de usar (stream só pode ser consumida uma vez)
          if (respostaRede && respostaRede.status === 200) {
            const clone = respostaRede.clone();
            caches.open(CACHE_ESTATICO).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return respostaRede;
        })
        .catch(() => {
          // Se a rede falhar e não tiver cache, mostra página offline básica
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });

      // Retorna do cache imediatamente se disponível, senão aguarda a rede
      return respostaCache || fetchPromessa;
    })
  );
});

// ====== Evento: Push (recebe notificação push do servidor) ======
self.addEventListener('push', (event) => {
  let dados = {
    titulo: 'JK Universitário',
    corpo: 'Nova atualização disponível.',
    link: '/',
  };

  // Tenta extrair dados do payload do push
  if (event.data) {
    try {
      dados = JSON.parse(event.data.text());
    } catch {
      // Se não for JSON, usa o texto como corpo
      dados.corpo = event.data.text();
    }
  }

  const opcoes = {
    body: dados.corpo,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: { link: dados.link || '/' },
    vibrate: [200, 100, 200],
    tag: 'jk-notificacao',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(dados.titulo, opcoes)
  );
});

// ====== Evento: Notificationclick (quando o usuário clica na notificação) ======
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const link = event.notification.data?.link || '/';

  // Abre o app na aba existente ou cria uma nova
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já há uma aba aberta, foca nela
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate?.(link);
          return client.focus();
        }
      }
      // Senão, abre uma nova aba
      if (self.clients.openWindow) {
        return self.clients.openWindow(link);
      }
    })
  );
});