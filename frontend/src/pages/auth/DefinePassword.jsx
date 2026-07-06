// src/pages/DefinirPassword.jsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/services/api'; // o teu axios instance

export default function DefinirPassword() {
  const [form, setForm] = useState({ password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirm_password) {
      setError('As passwords não coincidem.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password deve ter mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/set-password/', form);
      setSuccess(res.data.message);
      setForm({ password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao definir password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow border">
      <h2 className="text-lg font-bold mb-1">Definir Password</h2>
      <p className="text-sm text-gray-500 mb-4">
        A tua conta foi criada via Google. Define uma password para poderes 
        também fazer login com email e password.
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">Nova Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="pl-9"
              required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div>
          <Label htmlFor="confirm_password">Confirmar Password</Label>
          <div className="relative mt-1">
            <Input
              id="confirm_password"
              type="password"
              placeholder="••••••••"
              value={form.confirm_password}
              onChange={e => setForm({ ...form, confirm_password: e.target.value })}
              className="pl-9"
              required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? 'A guardar...' : 'Definir Password'}
        </Button>
      </form>
    </div>
  );
}