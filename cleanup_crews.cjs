const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");
require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanup() {
  const crewsSnapshot = await getDocs(collection(db, "crews"));
  
  if (crewsSnapshot.empty) {
    console.log("No crews found to delete.");
    return;
  }

  console.log(`Found ${crewsSnapshot.size} crews. Deleting...`);
  
  for (const crewDoc of crewsSnapshot.docs) {
    const crewId = crewDoc.id;
    console.log(`Deleting crew: ${crewId} (${crewDoc.data().name})`);
    await deleteDoc(doc(db, "crews", crewId));
  }
  
  console.log("All crews deleted from 'crews' collection.");
}

cleanup().catch(console.error);
