/**
 * App — componente principal com sistema de rotas
 *
 * Estrutura de rotas:
 * - "/" → PaginaPublica (site público: home, acomodações, stories, info)
 * - "/admin/login" → PaginaLogin (tela de login do admin)
 * - "/admin/cadastro" → PaginaCadastro (cadastro de novo admin)
 * - "/admin/dashboard" → RotaProtegida > LayoutAdmin > PaginaDashboard
 * - "/admin/acomodacoes" → RotaProtegida > LayoutAdmin > PaginaGerenciarAcomodacoes
 * - "/admin/stories" → RotaProtegida > LayoutAdmin > PaginaPublicadorStories
 * - "/admin/notificacoes" → RotaProtegida > LayoutAdmin > PaginaNotificacoes
 *
 * As rotas /admin/* são protegidas por RotaProtegida, que redireciona
 * para /admin/login se o usuário não estiver autenticado.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaginaPublica from '@/paginas/PaginaPublica';
import PaginaLogin from '@/paginas/PaginaLogin';
import PaginaCadastro from '@/paginas/PaginaCadastro';
import PaginaDashboard from '@/paginas/PaginaDashboard';
import PaginaGerenciarAcomodacoes from '@/paginas/PaginaGerenciarAcomodacoes';
import PaginaPublicadorStories from '@/paginas/PaginaPublicadorStories';
import PaginaNotificacoes from '@/paginas/PaginaNotificacoes';
import RotaProtegida from '@/components/RotaProtegida';
import LayoutAdmin from '@/components/LayoutAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ====== Rotas públicas ====== */}
        <Route path="/" element={<PaginaPublica />} />

        {/* ====== Rotas administrativas ====== */}
        {/* Login e cadastro (não protegidos — qualquer um pode acessar) */}
        <Route path="/admin/login" element={<PaginaLogin />} />
        <Route path="/admin/cadastro" element={<PaginaCadastro />} />

        {/* Rotas protegidas (exigem login) — todas usam o LayoutAdmin */}
        <Route path="/admin/dashboard" element={
          <RotaProtegida><LayoutAdmin><PaginaDashboard /></LayoutAdmin></RotaProtegida>
        } />
        <Route path="/admin/acomodacoes" element={
          <RotaProtegida><LayoutAdmin><PaginaGerenciarAcomodacoes /></LayoutAdmin></RotaProtegida>
        } />
        <Route path="/admin/stories" element={
          <RotaProtegida><LayoutAdmin><PaginaPublicadorStories /></LayoutAdmin></RotaProtegida>
        } />
        <Route path="/admin/notificacoes" element={
          <RotaProtegida><LayoutAdmin><PaginaNotificacoes /></LayoutAdmin></RotaProtegida>
        } />

        {/* Rota coringa: redireciona para a home */}
        <Route path="*" element={<PaginaPublica />} />
      </Routes>
    </BrowserRouter>
  );
}
