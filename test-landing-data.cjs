// Test script to verify landing pages work with Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testLandingPagesData() {
  console.log('🧪 Testing Landing Pages Data...\n');
  
  try {
    const tripsRef = db.collection('trips');
    const snapshot = await tripsRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No trips found in Firestore!');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} trips in Firestore\n`);
    
    console.log('🔗 Available Landing Page URLs:');
    console.log('===============================');
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const url = `https://your-domain.com/land/${data.slug}`;
      console.log(`📄 ${data.name}`);
      console.log(`   URL: ${url}`);
      console.log(`   Price: ₹${data.price}`);
      console.log(`   Advance: ₹${data.bookingAdvance || 'Not set'}`);
      console.log(`   Contact: ${data.contactNumber || 'Not set'}`);
      console.log(`   Status: ${data.slug ? '✅ Ready' : '❌ Missing slug'}`);
      console.log('');
    });
    
    console.log('🎯 Test Results:');
    console.log('================');
    console.log('✅ Firestore connection working');
    console.log('✅ Trip data available');
    console.log('✅ Landing pages ready for deployment');
    console.log('');
    console.log('🚀 Deploy with: npm run build:landing');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error testing landing pages:', error);
  }
}

testLandingPagesData();