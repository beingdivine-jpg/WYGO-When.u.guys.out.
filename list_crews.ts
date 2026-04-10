import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBHNy7tlLhTItUfkKNwlPFmkE0omsynbW8",
  authDomain: "wygo-3429f.firebaseapp.com",
  projectId: "wygo-3429f",
  storageBucket: "wygo-3429f.firebasestorage.app",
  messagingSenderId: "496558509877",
  appId: "1:496558509877:web:aab8dce03713ab9e55067c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listCrews() {
  const crewsRef = collection(db, 'crews');
  const snapshot = await getDocs(crewsRef);
  console.log(`Found ${snapshot.size} crews:`);
  snapshot.forEach(doc => {
    console.log(`- ${doc.data().name} (${doc.id})`);
  });
}

listCrews();
