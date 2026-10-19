import { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminGuard({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);

  const reject = useCallback(async (message: string) => {
    await supabase.auth.signOut();
    setAccepted(false);
    setPassword('');
    setError(message);
    setShake((value) => value + 1);
  }, []);

  const verifyAdmin = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc('is_admin');
    if (rpcError) {
      await reject('Could not verify admin access.');
      return;
    }
    if (data === true) {
      setAccepted(true);
      setError('');
      return;
    }
    await reject('That account is not an admin.');
  }, [reject]);

  useEffect(() => {
    const restore = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await verifyAdmin();
      setChecking(false);
    };
    void restore();
  }, [verifyAdmin]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setPassword('');
      setError('Incorrect email or password.');
      setShake((value) => value + 1);
    } else {
      await verifyAdmin();
    }
    setBusy(false);
  };

  if (checking) return null;
  if (accepted) return children;

  return (
    <main className="admin-gate">
      <motion.form
        key={shake}
        initial={{ x: 0 }}
        animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.36 }}
        className="admin-gate-form"
        onSubmit={submit}
      >
        <label htmlFor="admin-email">Admin sign in</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoFocus
        />
        <div className="admin-password-row">
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="submit" aria-label="Enter admin console" disabled={busy}>
            <ArrowRight size={18} />
          </button>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
      </motion.form>
    </main>
  );
}
