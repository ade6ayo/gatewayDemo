import { type FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut, UserRound, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { fakeEmailForUsername, isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import type { Network, UserProfile } from '../../types';

const NETWORKS: Network[] = ['MTN', 'Glo', 'Airtel', '9mobile'];

interface Props {
  onClose: () => void;
  onViewSubmissions?: () => void;
}

export default function AvatarDrawer({ onClose, onViewSubmissions }: Props) {
  const { user, userProfile, setSession, setProfile, clear } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      userProfile: state.userProfile,
      setSession: state.setSession,
      setProfile: state.setProfile,
      clear: state.clear,
    })),
  );
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState<Network | ''>('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) { setError('Supabase environment variables are missing.'); return; }
    if (mode === 'signup' && !network) { setError('Please select your network.'); return; }

    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: fakeEmailForUsername(username),
          password,
        });
        if (authError) throw authError;
        if (!data.user) throw new Error('No user returned from signup.');

        const profile = {
          id: data.user.id,
          username: username.trim(),
          phone_number: phoneNumber.trim(),
          city: null,
          state: null,
          country: 'Nigeria',
          clues_solved: 0,
          network: network as Network,
          bank_account_number: bankAccountNumber.trim() || null,
          bank_account_name: bankAccountName.trim() || null,
        };
        const { error: profileError } = await supabase.from('profiles').insert(profile);
        if (profileError) throw profileError;
        setSession(data.session);
        setProfile(profile);
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: fakeEmailForUsername(username),
          password,
        });
        if (authError) throw authError;
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, phone_number, city, state, country, clues_solved, network, bank_account_number, bank_account_name')
          .eq('id', data.user.id)
          .single();
        if (profileError) throw profileError;
        setSession(data.session);
        setProfile(profile as UserProfile);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clear();
  };

  const maskedAccount = userProfile?.bank_account_number
    ? `****${userProfile.bank_account_number.slice(-4)}`
    : null;

  return (
    <motion.aside
      className="drawer drawer-right"
      initial={{ x: '105%' }}
      animate={{ x: 0 }}
      exit={{ x: '105%' }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="drawer-header">
        <h2>Profile</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close profile">
          <X size={19} />
        </button>
      </div>

      {user && userProfile ? (
        <div className="profile-panel">
          <div className="profile-avatar">
            {userProfile.username.slice(0, 2).toUpperCase()}
          </div>
          <h3>{userProfile.username}</h3>
          <p>{userProfile.phone_number}{userProfile.network ? ` · ${userProfile.network}` : ''}</p>
          {maskedAccount ? (
            <p style={{ fontSize: '0.84rem', color: 'oklch(0.42 0.035 74)' }}>
              {maskedAccount}{userProfile.bank_account_name ? ` · ${userProfile.bank_account_name}` : ''}
            </p>
          ) : null}
          <button
            type="button"
            className="profile-stat-btn"
            onClick={onViewSubmissions}
            disabled={!onViewSubmissions}
          >
            <span>Quests Solved</span>
            <span className="profile-stat-count">{userProfile.clues_solved}</span>
            <ChevronRight size={15} />
          </button>
          <button type="button" className="secondary-button" onClick={() => void signOut()}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      ) : (
        <>
          <div className="segmented">
            <button
              type="button"
              className={mode === 'signin' ? 'active' : ''}
              onClick={() => { setMode('signin'); setError(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          <form className="drawer-form" onSubmit={submit}>
            <label htmlFor="username">Username</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />

            {mode === 'signup' ? (
              <>
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  inputMode="tel"
                />
                <label htmlFor="network">Network <span style={{ color: 'oklch(0.55 0.12 28)' }}>*</span></label>
                <select
                  id="network"
                  className="network-select"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as Network)}
                  required
                >
                  <option value="" disabled>Select your network</option>
                  {NETWORKS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <label htmlFor="bank-account-number">Bank Account Number <span className="optional-label">(optional)</span></label>
                <input
                  id="bank-account-number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 0123456789"
                />
                <label htmlFor="bank-account-name">Account Name <span className="optional-label">(optional)</span></label>
                <input
                  id="bank-account-name"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Name on account"
                />
              </>
            ) : null}

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" className="primary-button" disabled={busy}>
              <UserRound size={17} />
              {busy ? 'Working' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </>
      )}
    </motion.aside>
  );
}
