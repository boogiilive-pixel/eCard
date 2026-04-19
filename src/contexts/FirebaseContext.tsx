import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, Company } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  company: Company | null;
  loading: boolean;
  isAdmin: boolean;
  isCompanyAdmin: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setCompany(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'profiles', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const pData = { id: docSnap.id, ...docSnap.data() } as UserProfile;
        setProfile(pData);

        if (pData.company_id) {
          const unsubscribeCompany = onSnapshot(doc(db, 'companies', pData.company_id), (compSnap) => {
            if (compSnap.exists()) {
              setCompany({ id: compSnap.id, ...compSnap.data() } as Company);
            } else {
              setCompany(null);
            }
          });
          return () => unsubscribeCompany();
        } else {
          setCompany(null);
        }
      } else {
        setProfile(null);
        setCompany(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  const isAdmin = profile?.role === 'admin' || user?.email === 'boogiilive@gmail.com';
  const isCompanyAdmin = profile?.is_company_admin || false;

  return (
    <FirebaseContext.Provider value={{ user, profile, company, loading, isAdmin, isCompanyAdmin }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
