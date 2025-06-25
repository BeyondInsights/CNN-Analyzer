'use server';

import { adminStorage } from '@/lib/firebaseAdmin';

export async function runSimulation(params: any) {
  const bucket = adminStorage.bucket();
  
  // Test if we can access storage
  const [files] = await bucket.getFiles({ prefix: 'data/' });
  console.log('Found files:', files.length);
  
  return {
    success: true,
    filesFound: files.length
  };
}
