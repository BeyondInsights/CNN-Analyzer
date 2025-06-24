export function debugDataFlow(step: string, data: any) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 ${step}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', JSON.stringify(data, null, 2));
    console.groupEnd();
  }
}
