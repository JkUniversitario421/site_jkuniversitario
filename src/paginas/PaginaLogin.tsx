/**
 * Página PaginaLogin — tela de login do administrador
 *
 * Acessada pela rota discreta /admin/login (sem links no site público).
 * Contém formulário de e-mail e senha.
 * Se o login for bem-sucedido, redireciona para /admin/dashboard.
 *
 * Também oferece um link para /admin/cadastro para criar uma nova conta
 * de administrador (necessário apenas na primeira vez).
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexto/ContextoAuth';
import SEO from '@/components/SEO';

export default function PaginaLogin() {
  const { entrar } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  /** Envia o formulário de login */
  async function tratarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const { erro: erroLogin } = await entrar(email, senha);

    if (erroLogin) {
      setErro(erroLogin);
      setEnviando(false);
      return;
    }

    // Login bem-sucedido: redireciona para o dashboard
    navigate('/admin/dashboard');
  }

  return (
    <>
      <SEO titulo="Login Admin - JK Universitário" descricao="Área administrativa do JK Universitário." />
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Logo e título */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primaria-600 text-white shadow-lg">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Área Administrativa</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">JK Universitário — Gestão da Pousada</p>
          </div>

          {/* Card do formulário */}
          <form onSubmit={tratarSubmit} className="card-base p-6 space-y-4">
            {/* Mensagem de erro */}
            {erro && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {erro}
              </div>
            )}

            {/* Campo e-mail */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jkuniversitario.com.br"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-primaria-500 focus:ring-2 focus:ring-primaria-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Campo senha */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-primaria-500 focus:ring-2 focus:ring-primaria-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={enviando}
              className="btn-primario w-full disabled:opacity-60"
            >
              {enviando ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Entrando...</>
              ) : (
                <>Entrar <ArrowRight className="h-4 w-4" /></>
              )}
            </button>

            {/* Link para cadastro */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Não tem conta?{' '}
              <Link to="/admin/cadastro" className="font-semibold text-destaque-600 hover:text-destaque-700 dark:text-destaque-400">
                Criar conta de administrador
              </Link>
            </p>
          </form>

          {/* Voltar para o site público */}
          <p className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ← Voltar para o site
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
