import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAdventureStore } from '../store/adventureStore';

export const useAuthInitializer = () => {
  const { setUser, setLoading } = useAdventureStore();

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth not available');
      return;
    }

    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          console.log('Firebase user detected:', firebaseUser.email);
          
          let userData: Record<string, unknown> = {};
          
          // Try to get additional user data from Firestore
          if (db) {
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                userData = userDoc.data();
              }
            } catch (firestoreError) {
              console.warn('Could not fetch user data from Firestore:', firestoreError);
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
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser, setLoading]);
};
