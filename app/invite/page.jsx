'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';

function InviteSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [settingUp, setSettingUp] = useState(false);
  const [token, setToken] = useState('');
  const [contactId, setContactId] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlContactId = searchParams.get('contactId');
    
    if (urlToken && urlContactId) {
      setToken(urlToken);
      setContactId(urlContactId);
    } else {
      setError('Invalid invite link. Please check your email for the correct link.');
    }
  }, [searchParams]);

  const handleSetup = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!token || !contactId) {
      setError('Invalid invite link');
      return;
    }

    setSettingUp(true);

    try {
      const response = await api.post('/api/auth/setup', {
        token,
        contactId,
        password,
      });

      if (response.data?.success) {
        // Store token and redirect to login
        localStorage.setItem('clientPortalToken', response.data.token);
        router.push('/dashboard');
      } else {
        setError(response.data?.error || 'Failed to set up password');
      }
    } catch (error) {
      console.error('Setup error:', error);
      setError(error.response?.data?.error || 'Failed to set up password. Please try again.');
    } finally {
      setSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Ignite Strategies"
              width={64}
              height={64}
              className="mx-auto mb-4 h-16 w-16 object-contain"
              priority
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Set Up Your Portal Access
            </h1>
            <p className="text-gray-600">
              Create a password to access your client portal
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="At least 8 characters"
                disabled={settingUp}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Confirm password"
                disabled={settingUp}
              />
            </div>
            <button
              type="submit"
              disabled={settingUp || !token || !contactId}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {settingUp ? 'Setting up...' : 'Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4" />
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    }>
      <InviteSetup />
    </Suspense>
  );
}

