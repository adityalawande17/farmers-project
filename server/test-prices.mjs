import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.DATA_GOV_API_KEY;
console.log('Key loaded:', key ? key.substring(0, 15) + '...' : '❌ NOT FOUND - check your .env file');

if (!key) process.exit(1);

console.log('\nTesting data.gov.in API...\n');

try {
  let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`;
  url += `?api-key=${key}`;
  url += `&format=json&limit=3`;
  url += `&filters%5BState%5D=Maharashtra`;
  url += `&filters%5BCommodity%5D=Tomato`;

  const res = await axios.get(url);

  console.log('✅ API works!');
  console.log('Total records available:', res.data.total);
  console.log('Records returned:', res.data.records?.length);
  console.log('\nSample record:');
  console.log(JSON.stringify(res.data.records?.[0], null, 2));

} catch (err) {
  console.log('❌ API Error:');
  console.log('Status:', err.response?.status);
  console.log('Message:', err.response?.data?.message || err.message);
  console.log('\nFull response:', JSON.stringify(err.response?.data, null, 2));
}
