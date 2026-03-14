"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [dbPin, setDbPin] = useState<string | null>(null); // Database-la ulla PIN
  const [inputPin, setInputPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false); // First time user check
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // User-oda PIN database-la irukkannu check pannuvom
        const { data: profile } = await supabase
          .from('profiles')
          .select('security_pin')
          .eq('id', user.id)
          .single();

        if (profile?.security_pin) {
          setDbPin(profile.security_pin);
          setIsSettingPin(false);
        } else {
          setIsSettingPin(true); // PIN illa, so set panna sollanum
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handlePinAction = async (digit: string) => {
    if (inputPin.length < 4) {
      const newPin = inputPin + digit;
      setInputPin(newPin);

      if (newPin.length === 4) {
        if (isSettingPin) {
          // New PIN save panrom
          const { error } = await supabase
            .from('profiles')
            .insert([{ id: user.id, security_pin: newPin }]);
          
          if (!error) {
            setDbPin(newPin);
            setIsSettingPin(false);
            setInputPin('');
            setIsLocked(false);
            alert("PIN Set Successfully Mapla!");
          }
        } else {
          // Existing PIN check panrom
          if (newPin === dbPin) {
            setTimeout(() => setIsLocked(false), 300);
          } else {
            alert("Wrong PIN!");
            setInputPin('');
          }
        }
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0F172A] text-white font-black italic">LAVENLY...</div>;

  // --- Auth & Security Screens ---
  if (user && isLocked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A]">
        <div className="text-center mb-8">
          {isSettingPin ? <ShieldCheck className="mx-auto text-green-500 mb-4" size={48} /> : <Lock className="mx-auto text-purple-600 mb-4" size={48} />}
          <h2 className="text-2xl font-black italic text-white">{isSettingPin ? 'Set Your Secret PIN' : 'Lavenly Vault'}</h2>
          <p className="text-gray-400 text-xs font-bold mt-2">{isSettingPin ? 'Create a 4-digit PIN to secure your data' : 'Enter PIN to Unlock'}</p>
        </div>

        <div className="flex gap-4 mb-10">
          {[1, 2, 3, 4].map((dot) => (
            <div key={dot} className={`w-4 h-4 rounded-full border-2 border-purple-600 ${inputPin.length >= dot ? 'bg-purple-600' : ''}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'DEL'].map((num) => (
            <button
              key={num}
              onClick={() => {
                if (num === 'C') setInputPin('');
                else if (num === 'DEL') setInputPin(inputPin.slice(0, -1));
                else handlePinAction(num.toString());
              }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black bg-[#1E293B] text-white hover:bg-gray-700"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Main Dashboard Screen ---
  return (
    <main className="bg-[#0F172A] text-white h-screen p-8">
       <h1 className="text-3xl font-black italic">Welcome to your private vault!</h1>
       {/* Unga existing dashboard code-ah inga podunga mapla */}
    </main>
  );
}