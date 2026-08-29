import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing connection to URL:', url);

async function testSignup() {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const email = `testuser_${randomSuffix}@example.com`;
  const password = 'password123';

  const body = {
    email,
    password,
    data: {
      full_name: 'Test User',
    }
  };

  try {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': key || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Response Status:', res.status, res.statusText);
    const json = await res.json();
    console.log('Response JSON:', JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testSignup();
