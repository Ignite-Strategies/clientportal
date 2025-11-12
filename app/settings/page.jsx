'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          <Link
            href="/settings/password"
            className="block p-6 hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Update your account password
                </p>
              </div>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing</h3>
            <p className="text-sm text-gray-600">
              View invoices and payment history
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

