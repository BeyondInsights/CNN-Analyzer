// Upload data files to Firebase Storage
import { storage } from '@/lib/firebaseClient';
import { ref, uploadBytes } from 'firebase/storage';

const dataFiles = [
  'a7b9c2d1.json',
  'c9d4e7f1.json',
  'modelParameters.json',
  'drnRates.json'
];

export async function uploadDataFiles() {
  const results = [];
  
  for (const filename of dataFiles) {
    try {
      // You'll need to provide the actual file content here
      // This is just a template - replace with your actual data
      const mockData = { message: `This is ${filename} data`, data: [] };
      const fileContent = JSON.stringify(mockData, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });
      
      const storageRef = ref(storage, `data/${filename}`);
      await uploadBytes(storageRef, blob);
      
      results.push({ filename, status: 'success' });
      console.log(`Uploaded ${filename} successfully`);
    } catch (error) {
      results.push({ filename, status: 'error', error });
      console.error(`Failed to upload ${filename}:`, error);
    }
  }
  
  return results;
}

export async function GET() {
  try {
    const results = await uploadDataFiles();
    return Response.json({ 
      success: true, 
      message: 'Data files upload completed',
      results 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}
