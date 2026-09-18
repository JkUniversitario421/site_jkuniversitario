import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { ProvedorTema } from '@/contexto/ContextoTema';
import { ProvedorAuth } from '@/contexto/ContextoAuth';
import '@/index.css';

/**
 * Ponto de entrada da aplicação.
 *
 * Ordem dos provedores (de fora para dentro):
 * 1. ProvedorTema — gerencia Claro/Escuro/P&B em toda a aplicação
 * 2. ProvedorAuth — gerencia login/sessão do admin em toda a aplicação
 * 3. App — rotas e páginas
 */

// ====== Registro do Service Worker (PWA) ======
// Registra o sw.js para habilitar cache offline, instalação do app
// e recebimento de notificações push.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Falha ao registrar Service Worker:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorTema>
      <ProvedorAuth>
        <App />
      </ProvedorAuth>
    </ProvedorTema>
  </StrictMode>
);
