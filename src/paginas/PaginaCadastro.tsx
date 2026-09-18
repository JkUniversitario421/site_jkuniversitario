/**
 * Página PaginaCadastro — tela de cadastro de novo administrador
 *
 * Acessada pela rota /admin/cadastro.
 * Permite criar uma conta de administrador com e-mail e senha.
 * Após o cadastro, redireciona para o dashboard.
 *
 * IMPORTANTE: Em produção, recomenda-se restringir o cadastro com
 * um código de convite ou aprovando manualmente os usuários no painel
 * do Supabase. Por enquanto, qualquer pessoa com o link pode se cadastrar.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexto/ContextoAuth';
import SEO from '@/components/SEO';

export default function PaginaCadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  /** Envia o formulário de cadastro */
  async function tratarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    // Validação: senhas devem coincidir
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setEnviando(true);

    const { erro: erroCadastro } = await cadastrar(email, senha);

    if (erroCadastro) {
      setErro(erroCadastro);
      setEnviando(false);
      return;
    }

    // Cadastro bem-sucedido: redireciona para o dashboard
    navigate('/admin/dashboard');
  }

  return (
    <>
      <SEO titulo="Cadastro Admin - JK Universitário" descricao="Crie sua conta de administrador." />
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Logo e título */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primaria-600 text-white shadow-lg">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cadastro de Administrador</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crie sua conta para gerenciar a pousada</p>
          </div>

          {/* Card do formulário */}
          <form onSubmit={tratarSubmit} className="card-base p-6 space-y-4">
            {erro && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {erro}
              </div>
            )}

            {/* Campo e-mail */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">E-mail</label>
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
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-primaria-500 focus:ring-2 focus:ring-primaria-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-primaria-500 focus:ring-2 focus:ring-primaria-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <button type="submit" disabled={enviando} className="btn-primario w-full disabled:opacity-60">
              {enviando ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Cadastrando...</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Criar Conta</>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Já tem conta?{' '}
              <Link to="/admin/login" className="font-semibold text-destaque-600 hover:text-destaque-700 dark:text-destaque-400">
                Fazer login
              </Link>
            </p>
          </form>

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
