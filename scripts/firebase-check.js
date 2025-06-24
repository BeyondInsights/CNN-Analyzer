const admin = require('firebase-admin');

async function checkFirebaseSetup() {
  console.log('🔍 Checking Firebase configuration...');
  
  try {
    // Check environment variables
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];
    
    const missing = requiredEnvVars.filter(env => !process.env[env]);
    if (missing.length > 0) {
      console.error('❌ Missing environment variables:', missing);
      return false;
    }
    
    // Test Firebase connection
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });
    }
    
    // Test Firestore connection
    const db = admin.firestore();
    await db.collection('test').limit(1).get();
    console.log('✅ Firestore connection: OK');
    
    // Test Storage connection
    const bucket = admin.storage().bucket();
    await bucket.getMetadata();
    console.log('✅ Storage connection: OK');
    
    console.log('🎉 Firebase setup is working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase setup error:', error.message);
    return false;
  }
}

checkFirebaseSetup();
