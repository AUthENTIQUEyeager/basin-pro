import { useState } from 'react';
import { useAuthStore } from '../stores/appStore';

export function LoginPage() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('amadou@al-baraka.bf');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');
    const ok = await login(email, password);
    if (!ok) setError('Email ou mot de passe incorrect.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 bg-[#7C5C3E] rounded-xl flex items-center justify-center">
              <i className="ti ti-package text-white text-lg" />
            </div>
            <span className="text-[22px] font-semibold text-[#141412] tracking-tight">BazinPro</span>
          </div>
          <p className="text-[13.5px] text-[#9E9C97]">Connectez-vous à votre boutique</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E4E2DE] rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full h-10 border border-[#E4E2DE] rounded-lg px-3 text-[13.5px] outline-none focus:border-[#7C5C3E] focus:shadow-[0_0_0_3px_#F5EDE4] transition-all"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium text-[#5A5854]">Mot de passe</label>
                <button type="button" className="text-[12px] text-[#7C5C3E] font-medium hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 border border-[#E4E2DE] rounded-lg px-3 pr-10 text-[13.5px] outline-none focus:border-[#7C5C3E] focus:shadow-[0_0_0_3px_#F5EDE4] transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9C97] hover:text-[#5A5854]"
                >
                  <i className={`ti ${showPwd ? 'ti-eye-off' : 'ti-eye'} text-sm`} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#FDF0EE] border border-[#F5C4B3] rounded-lg text-[12.5px] text-[#C0392B]">
                <i className="ti ti-alert-circle text-sm shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#7C5C3E] text-white rounded-lg text-[14px] font-medium hover:bg-[#6A4E34] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><i className="ti ti-loader-2 animate-spin text-sm" /> Connexion…</>
              ) : (
                <>Se connecter</>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[#F0EFED] text-center">
            <p className="text-[12px] text-[#9E9C97]">
              Problème de connexion ?{' '}
              <span className="text-[#7C5C3E] font-medium cursor-pointer hover:underline">Contactez le support</span>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 p-3.5 bg-[#F5EDE4] border border-[#E8D8C8] rounded-xl">
          <p className="text-[12px] text-[#7C5C3E] font-medium mb-0.5">Compte de démonstration</p>
          <p className="text-[11.5px] text-[#9E9C97]">Email pré-rempli · Entrez n'importe quel mot de passe</p>
        </div>

        <p className="text-center text-[11px] text-[#9E9C97] mt-6">
          BazinPro · Authentique Studio · Bobo-Dioulasso
        </p>
      </div>
    </div>
  );
}
