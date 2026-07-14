import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC9xt2TclymW1iUXInOmJQ4by_IR9sarZY',
  authDomain: 'blorbify-badfc.firebaseapp.com',
  projectId: 'blorbify-badfc',
  storageBucket: 'blorbify-badfc.firebasestorage.app',
  messagingSenderId: '719239512084',
  appId: '1:719239512084:web:8254af9126933fad4c6701',
  measurementId: 'G-D61S4HFMWD',
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
// Persists reads to IndexedDB so a shopper who already loaded a store/vendor
// once can browse it again offline — the storefront only ever does one-shot
// getDoc() reads, so this cache is what makes those replayable without a
// network connection.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }),
});

export { app, analytics, auth, db };
