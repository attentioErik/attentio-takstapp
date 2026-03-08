'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Shield, ShieldOff, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  isAdmin?: boolean | null;
  createdAt?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    isAdmin: false,
  });

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Feil');
      setUsers((prev) => [...prev, data.user]);
      setForm({ name: '', email: '', password: '', company: '', isAdmin: false });
      setShowForm(false);
      toast.success(`Bruker ${data.user.name} opprettet`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Kunne ikke opprette bruker');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Slett ${user.name}? Dette kan ikke angres.`)) return;
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    toast.success('Bruker slettet');
  };

  const toggleAdmin = async (user: AdminUser) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: !user.isAdmin }),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isAdmin: data.user.isAdmin } : u))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brukere</h1>
          <p className="text-muted-foreground mt-1">{users.length} brukere totalt</p>
        </div>
        <Button className="rounded-xl gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Ny bruker
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreate} className="bg-card rounded-2xl border p-6 space-y-4">
              <h2 className="font-semibold">Opprett ny bruker</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fullt navn *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ola Nordmann"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-postadresse *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="ola@firma.no"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passord *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Minst 8 tegn"
                      required
                      minLength={8}
                      className="rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Firma</Label>
                  <Input
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Takstfirma AS"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={(e) => setForm((p) => ({ ...p, isAdmin: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Administratortilgang</span>
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting} className="rounded-xl gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Oppretter...' : 'Opprett bruker'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl"
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User list */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            Laster brukere...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Ingen brukere</div>
        ) : (
          <div className="divide-y">
            {users.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user.name}</p>
                    {user.isAdmin && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {user.company && (
                    <p className="text-xs text-muted-foreground">{user.company}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block flex-shrink-0">
                  {user.createdAt ? formatDate(user.createdAt) : '–'}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => toggleAdmin(user)}
                    title={user.isAdmin ? 'Fjern admin' : 'Gjør til admin'}
                  >
                    {user.isAdmin ? (
                      <ShieldOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Shield className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
