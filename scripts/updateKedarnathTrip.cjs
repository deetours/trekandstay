// Script to upsert Kedarnath 7D spiritual journey trip with structured itinerary.
// Run: node scripts/updateKedarnathTrip.cjs

const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(keyPath)) {
  console.error('Missing serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(1);
}
if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    const serviceAccount = require(keyPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}
const db = admin.firestore();

const tripId = 'kedarnath-7d';

const structuredItinerary = {
  day_1: {
    date: 'Sept 27, 2025 (Saturday)',
    title: 'Bengaluru / Delhi → Haridwar',
    highlights: [
      'Depart ex Bengaluru / Delhi (as per package)',
      'Arrival Delhi/Haridwar transfer & hotel check‑in',
      'Evening Ganga Aarti (Har Ki Pauri – Haridwar)'
    ],
    activities: [
      { time: 'Morning / Noon', activity: 'Depart Origin', details: 'Flight / Train to Delhi OR direct connection to Haridwar' },
      { time: 'Evening', activity: 'Ganga Aarti', details: 'Witness sacred Ganga Aarti on the ghats' }
    ],
    trek_distance: '0 km',
    difficulty: 'None',
    meals: ['Dinner'],
    accommodation: 'Hotel – Haridwar / Rishikesh'
  },
  day_2: {
    date: 'Sept 28, 2025 (Sunday)',
    title: 'Haridwar → Guptkashi',
    highlights: [
      'Scenic Himalayan drive',
      'Confluence view at Devprayag (Alaknanda + Bhagirathi)',
      'Arrival & acclimatization at Guptkashi'
    ],
    activities: [
      { time: 'Morning', activity: 'Depart Haridwar', details: 'Drive towards Guptkashi via Devprayag' },
      { time: 'Midday', activity: 'Devprayag Halt', details: 'Photo stop at the holy confluence' },
      { time: 'Evening', activity: 'Check‑in', details: 'Hotel check‑in, rest, optional Ardh Narishwar Temple visit' }
    ],
    trek_distance: '0 km',
    difficulty: 'None',
    meals: ['Breakfast','Dinner'],
    accommodation: 'Hotel – Guptkashi'
  },
  day_3: {
    date: 'Sept 29, 2025 (Monday)',
    title: 'Guptkashi → Gaurikund → Kedarnath Base Camp',
    highlights: [
      'Transfer to Gaurikund (start point)',
      '16 km ascent to Kedarnath (trek / pony / doli)',
      'Evening Darshan at Kedarnath Temple (Jyotirlinga)'
    ],
    activities: [
      { time: 'Early Morning', activity: 'Drive', details: 'Guptkashi to Gaurikund' },
      { time: 'Morning', activity: 'Trek Start', details: 'Begin 16 km ascent (approx 6–8 hrs depending on pace)' },
      { time: 'Evening', activity: 'Temple Darshan', details: 'Seek blessings at Kedarnath Temple' }
    ],
    trek_distance: '16 km (ascent)',
    difficulty: 'Moderate',
    meals: ['Breakfast','Dinner'],
    accommodation: 'Camp / Guesthouse – Kedarnath Base'
  },
  day_4: {
    date: 'Sept 30, 2025 (Tuesday)',
    title: 'Kedarnath → Gaurikund → Guptkashi',
    highlights: [
      'Optional early Abhishek Puja',
      '16 km descent back to Gaurikund',
      'Drive return to Guptkashi & recovery'
    ],
    activities: [
      { time: 'Early Morning', activity: 'Temple Visit', details: 'Optional Abhishek / Sunrise darshan' },
      { time: 'Morning', activity: 'Descent Trek', details: '16 km descent to Gaurikund' },
      { time: 'Afternoon', activity: 'Drive', details: 'Transfer to Guptkashi & rest' }
    ],
    trek_distance: '16 km (descent)',
    difficulty: 'Moderate',
    meals: ['Breakfast','Dinner'],
    accommodation: 'Hotel – Guptkashi'
  },
  day_5: {
    date: 'Oct 1, 2025 (Wednesday)',
    title: 'Guptkashi → Rishikesh',
    highlights: [
      'Return Himalayan drive',
      'Neelkanth Mahadev Temple visit',
      'Evening leisure in Rishikesh (cafes / markets)'
    ],
    activities: [
      { time: 'Morning', activity: 'Depart', details: 'Drive towards Rishikesh' },
      { time: 'Afternoon', activity: 'Neelkanth Mahadev', details: 'Temple darshan en‑route / post arrival' },
      { time: 'Evening', activity: 'Explore', details: 'Local cafes, Ganga ghats, optional yoga' }
    ],
    trek_distance: '0 km',
    difficulty: 'None',
    meals: ['Breakfast','Dinner'],
    accommodation: 'Hotel – Rishikesh'
  },
  day_6: {
    date: 'Oct 2, 2025 (Thursday)',
    title: 'Rishikesh → Delhi / Bengaluru',
    highlights: [
      'Local sightseeing: Laxman Jhula, Ram Jhula, Beatles Ashram',
      'Departure for Delhi / flight to Bengaluru'
    ],
    activities: [
      { time: 'Morning', activity: 'Sightseeing', details: 'Iconic suspension bridges & ashrams' },
      { time: 'Afternoon', activity: 'Depart Rishikesh', details: 'Drive to Delhi, onward travel' }
    ],
    trek_distance: '0 km',
    difficulty: 'None',
    meals: ['Breakfast'],
    accommodation: 'Transit / Overnight Travel (for BLR option)'
  },
  day_7: {
    date: 'Oct 3, 2025 (Friday)',
    title: 'Arrival at Bengaluru',
    highlights: [ 'Trip concludes with spiritual & Himalayan memories' ],
    activities: [ { time: 'Morning / Noon', activity: 'Arrival', details: 'Reach Bengaluru – End of services' } ],
    trek_distance: '0 km',
    difficulty: 'None',
    meals: [],
    accommodation: 'Trip Ends'
  }
};

(async () => {
  try {
    const ref = db.collection('trips').doc(tripId);

    const payload = {
      name: 'Kedarnath – A Spiritual Journey',
      slug: tripId,
      location: 'Uttarakhand Himalayas',
      region: 'Garhwal',
      duration: '7D / 6N',
      dates: 'Sept 27 – Oct 3, 2025',
      nextDeparture: '2025-09-27',
      difficulty: 'Moderate (Trek days)',
      price: 14999, // Base (Delhi–Delhi)
      pricing_options: [
        { route: 'Delhi–Delhi', price: 14999 },
        { route: 'Bengaluru–Bengaluru (Train / Mixed)', price: 22999 },
        { route: 'Bengaluru–Bengaluru (Flight Option)', price: 27999 }
      ],
      bookingAdvance: 5000, // typical advance (can adjust later)
      contactNumber: '+91-9902937730',
      highlights: [
        'Ganga Aarti – Haridwar',
        'Devprayag Confluence',
        'Guptkashi stay',
        'Gaurikund Trek Start',
        'Kedarnath Temple Darshan',
        'Neelkanth Mahadev',
        'Rishikesh Sightseeing',
        'Laxman Jhula & Ram Jhula',
        'Beatles Ashram'
      ],
      spiritual_sites: [ 'Kedarnath Temple', 'Neelkanth Mahadev Temple', 'Ganga Aarti (Haridwar)', 'Devprayag Confluence' ],
      itinerary: structuredItinerary,
      total_trek_distance: '32 km',
      daily_trek_distances: { day_3: '16 km', day_4: '16 km' },
      inclusions: [
        'Breakfast & Dinner (as per itinerary)',
        'Shared accommodation (Hotels / Guesthouses / Camps)',
        'Local sightseeing as mentioned',
        'Travel coordinator / trek leader',
        'All surface transportation (Tempo Traveller / Bus)' ],
      exclusions: [
        'Lunches unless specified',
        'GST',
        'Helicopter / Pony / Doli charges',
        'Personal expenses & shopping',
        'Travel Insurance',
        'Anything not mentioned in inclusions' ],
      images: [ 'https://images.pexels.com/photos/19010047/pexels-photo-19010047.jpeg' ],
      tags: admin.firestore.FieldValue.arrayUnion('kedarnath','pilgrimage','himalayas','spiritual','7-days','uttarakhand'),
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await ref.set(payload, { merge: true });
    console.log('✅ Kedarnath trip upserted:', tripId);
  } catch (e) {
    console.error('Update failed:', e);
    process.exit(1);
  }
})();
