import { useState } from 'react';
import { Brain, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import logoSena from '../assets/Logo sena.png';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { login } from '../lib/auth';

interface LoginProps {
  onLogin: () => void;
  onViewTerms: () => void;
}

export function Login({ onLogin, onViewTerms }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      await login({
        correoPersonal: email.trim(),
        password,
      });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      {/* Fondo decorativo suave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card principal */}
        <div
          className="bg-white backdrop-blur-xl overflow-hidden"
          style={{
            borderRadius: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.15)',
          }}
        >
          {/* Header del card */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-8 py-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-2xl bg-white/95 p-4 shadow-lg flex items-center gap-8">
                <img
                  src={logoSena}
                  alt="Logo SENA"
                  className="h-14 w-auto object-contain block"
                />
                <div
                  className="shrink-0"
                  style={{
                    width: '2px',
                    height: '3.5rem',
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 1px rgba(100, 116, 139, 0.3)',
                  }}
                />
                <Brain className="w-14 h-14 text-purple-600 shrink-0" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-1">HealthyMind</h1>
            <p className="text-white/90 text-sm">SENA Institucional</p>
            <p className="text-white/80 text-sm mt-2">Acceso para profesionales</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@sena.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-purple-200/50 bg-slate-50/50 focus-visible:ring-purple-500/50 focus-visible:border-purple-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-4 h-12 rounded-xl border-purple-200/50 bg-slate-50/50 focus-visible:ring-purple-500/50 focus-visible:border-purple-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 w-12 h-12 rounded-xl border border-purple-200/50 bg-slate-50/50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => alert('Contacta al administrador del SENA para recuperar tu contraseña. Línea: 018000 910 270')}
                className="text-xs text-purple-600 hover:text-purple-700 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-white font-medium group flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center leading-relaxed pt-2">
              Al iniciar sesión aceptas los{' '}
              <button
                type="button"
                onClick={onViewTerms}
                className="text-purple-600 hover:text-purple-700 hover:underline font-medium"
              >
                Términos y Condiciones
              </button>{' '}
              y la{' '}
              <button
                type="button"
                onClick={onViewTerms}
                className="text-purple-600 hover:text-purple-700 hover:underline font-medium"
              >
                Política de Tratamiento de Datos Personales
              </button>{' '}
              del SENA.
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Política de confidencialidad SOFIA Plus:{' '}
          <a
            href="https://portal.senasofiaplus.edu.co/index.php/seguridad/politica-de-confidencialidad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline"
          >
            portal.senasofiaplus.edu.co
          </a>
        </p>
      </div>
    </div>
  );
}
