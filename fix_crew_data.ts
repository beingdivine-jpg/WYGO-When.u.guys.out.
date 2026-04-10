import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function fixCrewData() {
  const crewRef = doc(db, 'crews', CREW_ID);
  const crewSnap = await getDoc(crewRef);
  const crewData = crewSnap.data();
  
  if (!crewData?.activeSyncRoundId) {
    console.log('No active round found');
    return;
  }
  
  const roundRef = doc(db, 'crews', CREW_ID, 'syncRounds', crewData.activeSyncRoundId);
  const roundSnap = await getDoc(roundRef);
  const roundData = roundSnap.data();
  const startDate = roundData?.startDate.toDate();
  
  console.log(`Fixing markers for "${crewData.name}" starting from ${startDate.toISOString()}`);
  
  const responsesRef = collection(db, 'crews', CREW_ID, 'syncRounds', crewData.activeSyncRoundId, 'responses');
  const responsesSnap = await getDocs(responsesRef);
  
  for (const rDoc of responsesSnap.docs) {
    const data = rDoc.data();
    const oldAvailability = data.availability || {};
    const newAvailability: Record<string, string> = {};
    let changes = 0;
    
    Object.entries(oldAvailability).forEach(([id, status]) => {
      // Extract date from w-YYYY-MM-DD
      const dateStr = id.replace('w-', '');
      const [year, month, day] = dateStr.split('-').map(Number);
      
      // Create a UTC date for this weekend
      const weekendDate = new Date(Date.UTC(year, month - 1, day));
      
      // If the date is before the round start date (minus a small buffer for Friday start logic), prune it
      // The round starts April 10 (Friday). Any marker for March is definitely invalid.
      if (weekendDate.getTime() < startDate.getTime() - (24 * 60 * 60 * 1000)) {
        console.log(`  [Prune] ${rDoc.id}: removing ${id} (before round start)`);
        changes++;
      } else {
        // For now, these IDs are actually correctly formatted (w-YYYY-MM-DD),
        // we just need to ensure they match the NEW UTC generation.
        // My UTC generation for April 10th produces "w-2026-04-10".
        newAvailability[id] = status as string;
      }
    });
    
    if (changes > 0 || Object.keys(newAvailability).length !== Object.keys(oldAvailability).length) {
      console.log(`  [Update] Syncing ${data.displayName} - ${Object.keys(newAvailability).length} markers remains.`);
      await updateDoc(rDoc.ref, { availability: newAvailability });
    } else {
      console.log(`  [No Change] ${data.displayName} markers are clean.`);
    }
  }
  
  console.log('Migration Complete.');
}

fixCrewData();
