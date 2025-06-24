// functions/src/secureDataAccess.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

// Initialize admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

// Track access attempts
const accessLog = new Map<string, number>();
const blockedIPs = new Set<string>();

// Encryption key (store this in Firebase Functions config)
const ENCRYPTION_KEY = functions.config().security?.encryption_key || 'your-32-char-key-here';

export const getSecureData = functions.https.onCall(async (data, context) => {
  // 1. CHECK AUTHENTICATION
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const uid = context.auth.uid;
  const email = context.auth.token.email || '';
  const ip = context.rawRequest.ip;

  // 2. CHECK IF IP IS BLOCKED
  if (blockedIPs.has(ip)) {
    console.error(`Blocked IP attempted access: ${ip}`);
    throw new functions.https.HttpsError('permission-denied', 'Access denied');
  }

  // 3. RATE LIMITING
  const accessKey = `${uid}-${new Date().toISOString().split('T')[0]}`;
  const accessCount = accessLog.get(accessKey) || 0;
  
  if (accessCount > 10) { // Max 10 requests per day per user
    console.error(`Rate limit exceeded for user: ${email}`);
    blockedIPs.add(ip); // Block the IP
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded');
  }
  
  accessLog.set(accessKey, accessCount + 1);

  // 4. CHECK PASSWORD VERIFICATION
  // Verify user has completed password challenge (stored in Firestore)
  const userDoc = await admin.firestore().collection('verified_users').doc(uid).get();
  if (!userDoc.exists || !userDoc.data()?.passwordVerified) {
    throw new functions.https.HttpsError('permission-denied', 'Password verification required');
  }

  // 5. LOG ACCESS ATTEMPT
  await admin.firestore().collection('access_logs').add({
    uid,
    email,
    ip,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    dataRequested: data.fileType || 'all',
    userAgent: context.rawRequest.headers['user-agent']
  });

  try {
    // 6. LOAD DATA FROM STORAGE (Server-side only)
    const bucket = admin.storage().bucket();
    
    // Obfuscated file names
    const fileMap = {
      'utilities': 'data/a7b9c2d1.json',
      'respondent': 'data/e5f8a3b2.json', 
      'profile': 'data/c9d4e7f1.json'
    };

    const requestedFile = fileMap[data.fileType as keyof typeof fileMap];
    if (!requestedFile) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid file type');
    }

    const file = bucket.file(requestedFile);
    const [exists] = await file.exists();
    
    if (!exists) {
      throw new functions.https.HttpsError('not-found', 'Data not available');
    }

    // 7. DOWNLOAD AND PARSE DATA
    const [contents] = await file.download();
    let jsonData = JSON.parse(contents.toString());

    // 8. SANITIZE DATA - Remove any sensitive fields
    if (data.fileType === 'utilities') {
      // Remove any internal calculation methods or formulas
      delete jsonData.internalFormulas;
      delete jsonData.proprietaryWeights;
    }

    // 9. ADD WATERMARK
    jsonData._watermark = {
      uid,
      email,
      timestamp: new Date().toISOString(),
      signature: crypto.createHash('sha256').update(`${uid}-${email}-${Date.now()}`).digest('hex')
    };

    // 10. RETURN OBFUSCATED DATA
    return {
      success: true,
      data: jsonData,
      // Don't return actual file names or paths
      type: data.fileType
    };

  } catch (error) {
    console.error(`Data access error for ${email}:`, error);
    
    // Log suspicious activity
    await admin.firestore().collection('security_alerts').add({
      uid,
      email,
      ip,
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw new functions.https.HttpsError('internal', 'Unable to process request');
  }
});

// Function to verify password (called after password screen)
export const verifyPassword = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { email, password } = data;
  
  // Verify password
  if (password !== 'BEYOND Insights Rules') {
    // Log failed attempt
    await admin.firestore().collection('failed_passwords').add({
      uid: context.auth.uid,
      email,
      ip: context.rawRequest.ip,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw new functions.https.HttpsError('permission-denied', 'Invalid password');
  }

  // Mark user as verified
  await admin.firestore().collection('verified_users').doc(context.auth.uid).set({
    email,
    passwordVerified: true,
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    ip: context.rawRequest.ip
  });

  return { success: true };
});

// Cleanup function - run daily
export const cleanupOldData = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  // Clear rate limit counters
  accessLog.clear();
  
  // Remove old access logs (keep 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const oldLogs = await admin.firestore()
    .collection('access_logs')
    .where('timestamp', '<', thirtyDaysAgo)
    .get();
    
  const batch = admin.firestore().batch();
  oldLogs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  return null;
});