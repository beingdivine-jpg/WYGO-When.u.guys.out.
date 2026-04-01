import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

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
    
    // In Firestore, deleting a document doesn't delete its subcollections 
    // unless you recursively delete them. For a quick cleanup, we'll delete 
    // the main docs first.
    await deleteDoc(doc(db, "crews", crewId));
  }
  
  console.log("All crews deleted from 'crews' collection.");
}

cleanup().catch(console.error);
