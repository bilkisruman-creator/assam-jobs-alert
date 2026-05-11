'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
        toast.success('Subscribed successfully!');
      } else {
        const data = await res.json();
        setStatus('error');
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch {
      setStatus('error');
      toast.error('Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <CheckCircle className="h-5 w-5" />
        <p className="text-sm font-medium">Subscribed! Check your email for confirmation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        className={status === 'error' ? 'border-red-500' : ''}
      />
      <Button type="submit" disabled={loading} className="shrink-0">
        {loading ? (
          '...'
        ) : (
          <>
            <Send className="h-4 w-4 mr-1.5" />
            Subscribe
          </>
        )}
      </Button>
    </form>
  );
}
