import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDoc, getDocs, doc } from 'firebase/firestore';

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

const CREW_ID = 'KCn5pAwrNVcsuHOqUwme';

async function auditSpecificCrew() {
  const crewRef = doc(db, 'crews', CREW_ID);
  const crewSnap = await getDoc(crewRef);
  const crewData = crewSnap.data();
  
  if (!crewData) {
    console.log('Crew not found');
    return;
  }
  
  console.log('--- Crew Info ---');
  console.log('Name:', crewData.name);
  console.log('Active Round ID:', crewData.activeSyncRoundId);
  
  if (crewData.activeSyncRoundId) {
    const roundRef = doc(db, 'crews', CREW_ID, 'syncRounds', crewData.activeSyncRoundId);
    const roundSnap = await getDoc(roundRef);
    const roundData = roundSnap.data();
    console.log('--- Round Info ---');
    console.log('Start Date:', roundData?.startDate);
    
    // Check if startDate is a Timestamp and what its UTC components are
    if (roundData?.startDate?.toDate) {
       const d = roundData.startDate.toDate();
       console.log('Start Date (UTC):', d.toUTCString());
       console.log('Start Date (Local):', d.toString());
    }

    const responsesRef = collection(db, 'crews', CREW_ID, 'syncRounds', crewData.activeSyncRoundId, 'responses');
    const responsesSnap = await getDocs(responsesRef);
    console.log('--- Responses Found:', responsesSnap.size, '---');
    
    responsesSnap.forEach(r => {
      const data = r.data();
      const keys = Object.keys(data.availability || {}).sort();
      console.log(`User ${data.displayName} (${r.id}):`, keys.length, 'markers');
      console.log('ID Samples (First 5):', keys.slice(0, 5));
    });
  }
}

auditSpecificCrew();
