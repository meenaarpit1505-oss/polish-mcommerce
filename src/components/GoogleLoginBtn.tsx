"use client";

import React, { useEffect, useState } from "react";
import { Lock, AlertCircle } from "lucide-react";

interface GoogleLoginBtnProps {
  onSuccess: (userData: { id: string; email: string; name: string; image?: string | null }) => void;
  onError: (errorMsg: string) => void;
}

// Add TS global window interface declarations
declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleLoginBtn({ onSuccess, onError }: GoogleLoginBtnProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isAuthenticating, setIsProcessing] = useState(false);

  // 1. Dynamically mount native Google Identity scripts to prevent layout locking
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error("[Google Button] Failed to fetch external Google API client script.");
      onError("Nie udało się załadować biblioteki logowania Google.");
    };

    document.body.appendChild(script);

    return () => {
      // Avoid script duplicate mounting leaks
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onError]);

  // 2. Initialize and render button when script becomes available
  useEffect(() => {
    if (!isScriptLoaded || !window.google?.accounts?.id) return;

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
      if (!clientId) {
        console.warn("[Google Button] NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is missing.");
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          setIsProcessing(true);
          try {
            console.log("[Google Button] Token acquired, initiating backend validation handshake.");
            
            const handshakeRes = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: response.credential }),
            });

            const result = await handshakeRes.json();

            if (!handshakeRes.ok || !result.success) {
              throw new Error(result.error || "Handshake verification returned non-success code.");
            }

            console.log("[Google Button] Secure identity verified successfully by serverless api.");
            onSuccess(result.user);

          } catch (err: any) {
            console.error("[Google Button] Handshake error details:", err);
            onError("Autoryzacja serwera Google nie powiodła się. Spróbuj ponownie.");
          } finally {
            setIsProcessing(false);
          }
        },
        auto_select: false, // Prevents sudden intrusive shifts on high-intent conversion screens
      });

      // Render native branded button with custom layouts matches
      window.google.accounts.id.renderButton(
        document.getElementById("google-sso-iframe-anchor"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          shape: "circle"
        }
      );
    } catch (err) {
      console.error("[Google Button] Setup exception:", err);
    }
  }, [isScriptLoaded, onSuccess, onError]);

  return (
    <div className="w-full space-y-2 text-center">
      <div className="relative">
        {isAuthenticating && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-20 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">Weryfikowanie tożsamości...</span>
            </div>
          </div>
        )}

        {/* This anchor is targeted by the SDK to replace with localized iframe rendering */}
        <div 
          id="google-sso-iframe-anchor" 
          className="w-full min-h-11 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all active:scale-[0.99] overflow-hidden" 
        />
      </div>

      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
        <Lock className="h-3 w-3 text-emerald-500" />
        Szybkie logowanie zabezpieczone certyfikatem Google SSL
      </p>
    </div>
  );
}
