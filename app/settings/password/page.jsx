'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Dynamic import for Firebase to avoid SSR issues
let updatePassword, reauthenticateWithCredential, EmailAuthProvider, auth;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);

  // Load Firebase on client side only
  useEffect(() => {
    const loadFirebase = async () => {
      try {
        const firebaseAuth = await import('firebase/auth');
        const firebaseLib = await import('@/lib/firebase');
        updatePassword = firebaseAuth.updatePassword;
        reauthenticateWithCredential = firebaseAuth.reauthenticateWithCredential;
        EmailAuthProvider = firebaseAuth.EmailAuthProvider;
        auth = firebaseLib.auth;
        setFirebaseLoaded(true);
      } catch (err) {
        console.error('Failed to load Firebase:', err);
        setError('Failed to load authentication. Please refresh the page.');
      }
    };
    loadFirebase();
  }, []);

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!firebaseLoaded) {
      setError('Authentication not ready. Please wait...');
      return;
    }

    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setUpdating(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('Not authenticated');
      }

      // Re-authenticate with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Password change error:', error);
      setError(error.message || 'Failed to change password. Please check your current password.');
    } finally {
      setUpdating(false);
    }
  };

  if (!firebaseLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 py-8 relative">
      {/* Ignite logo - top right corner */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Ignite"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          priority
        />
        <span className="text-sm font-semibold text-gray-300">Ignite</span>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Change Password</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-gray-800 border border-gray-600 px-4 py-3 text-sm text-gray-300">
              Password changed successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-gray-800 border border-gray-600 text-white px-4 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder:text-gray-500"
                placeholder="Enter current password"
                disabled={updating}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 text-white px-4 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder:text-gray-500"
                placeholder="At least 8 characters"
                disabled={updating}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 text-white px-4 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder:text-gray-500"
                placeholder="Confirm new password"
                disabled={updating}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-500 px-5 py-2 text-sm font-semibold text-white transition"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-500 px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
