'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Smooth fade in animation
    const fadeTimer = setTimeout(() => setFadeIn(true), 50);

    let unsubscribe;
    const timer = setTimeout(async () => {
      try {
        // Dynamically import Firebase to avoid SSR issues
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        
        if (auth) {
          unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              router.replace('/welcome');
            } else {
              router.replace('/login');
            }
          });
        } else {
          // No auth available, go to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, just go to login
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    }, 1000); // 1000ms delay

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center relative transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
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

      {/* Handshake icon centered */}
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <svg
            className="h-24 w-24 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 18h1a2 2 0 0 0 0-4H5c-.6 0-1.1.2-1.4.6L3 14"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 12h2a2 2 0 1 1 0-4h-3c-.6 0-1.1.2-1.4.6L21 10"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 18h1a2 2 0 0 1 0-4h-3c-.6 0-1.1.2-1.4.6L21 10"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 14l4-4"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10l-4 4"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 12l-2 2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 12l2 2"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Client Portal
        </h1>
        <p className="text-lg text-gray-400">
          Your engagement hub
        </p>
      </div>
    </div>
  );
}
