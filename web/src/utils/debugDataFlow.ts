export function debugDataFlow(step: string, data: any) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 ${step}`);
    if (DEBUG_MODE) console.log('Timestamp:', new Date().toISOString());
    if (DEBUG_MODE) console.log('Data:', JSON.stringify(data, null, 2));
    console.groupEnd();
  }
}
