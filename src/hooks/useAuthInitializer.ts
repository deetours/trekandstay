import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAdventureStore } from '../store/adventureStore';

// Session timeout (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// Force logout on new browser sessions (set to true for always logout)
const FORCE_LOGOUT_ON_NEW_SESSION = false; // Change to true if you want users to always login on new sessions

export const useAuthInitializer = () => {
  const { setUser, setLoading, logout } = useAdventureStore();

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth not available');
      return;
    }

    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Force logout on new sessions if enabled
          if (FORCE_LOGOUT_ON_NEW_SESSION) {
            const lastSession = localStorage.getItem('lastAuthSession');
            const currentSession = Date.now().toString();
            
            if (!lastSession || lastSession !== sessionStorage.getItem('currentAuthSession')) {
              console.log('New session detected, forcing logout...');
              logout();
              setLoading(false);
              return;
            }
          }
          
          // Check if session has expired
          const lastSignIn = firebaseUser.metadata.lastSignInTime;
          if (lastSignIn) {
            const signInTime = new Date(lastSignIn).getTime();
            const now = Date.now();
            
            if (now - signInTime > SESSION_TIMEOUT) {
              console.log('Session expired, logging out...');
              logout();
              setLoading(false);
              return;
            }
          }
          
          // Store session info for new session detection
          const sessionId = Date.now().toString();
          localStorage.setItem('lastAuthSession', sessionId);
          sessionStorage.setItem('currentAuthSession', sessionId);
          
          // User is signed in
          console.log('Firebase user detected:', firebaseUser.email);
          
          let userData: Record<string, unknown> = {};
          
          // Try to get additional user data from Firestore with better error handling
          if (db) {
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                userData = userDoc.data();
                console.log('User data loaded from Firestore');
              } else {
                console.log('No user document found in Firestore, using basic data');
              }
            } catch (firestoreError) {
              console.warn('Could not fetch user data from Firestore (continuing with basic data):', firestoreError);
              // Continue with empty userData - this is not a blocking error
            }
          }

          // Set user in store
          const user = {
            id: firebaseUser.uid,
            name: String(firebaseUser.displayName || userData.name || (firebaseUser.email?.split('@')[0] ?? 'User')),
            email: firebaseUser.email || '',
            avatar: typeof userData.avatar === 'string' ? userData.avatar : (firebaseUser.photoURL || ''),
            adventurePoints: typeof userData.adventurePoints === 'number' ? userData.adventurePoints : 0,
            completedTrips: typeof userData.completedTrips === 'number' ? userData.completedTrips : 0,
            badges: Array.isArray(userData.badges) ? (userData.badges as string[]) : [],
            preferences: (() => {
              const prefs = userData.preferences as Record<string, unknown> | undefined;
              if (prefs) {
                return {
                  favoriteCategories: Array.isArray(prefs.favoriteCategories) ? prefs.favoriteCategories as string[] : [],
                  difficulty: Array.isArray(prefs.difficulty) ? prefs.difficulty as string[] : [],
                  budget: Array.isArray(prefs.budget) && prefs.budget.length === 2 &&
                    typeof prefs.budget[0] === 'number' && typeof prefs.budget[1] === 'number'
                    ? [prefs.budget[0] as number, prefs.budget[1] as number] as [number, number]
                    : [0, 0] as [number, number],
                  notifications: typeof prefs.notifications === 'boolean' ? prefs.notifications : true
                };
              }
              return {
                favoriteCategories: [],
                difficulty: [],
                budget: [0, 0] as [number, number],
                notifications: true
              };
            })(),
            isAdmin: userData.role === 'admin'
          };

          setUser(user);
          console.log('User set in store:', user.email, 'isAdmin:', user.isAdmin);
        } else {
          // User is signed out
          console.log('No Firebase user detected');
          setUser(null);
          // Clear session storage when user is signed out
          localStorage.removeItem('lastAuthSession');
          sessionStorage.removeItem('currentAuthSession');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        // Don't block the app for auth errors, just clear user state
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser, setLoading, logout]);
};
