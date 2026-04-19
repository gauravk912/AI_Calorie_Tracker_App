import AsyncStorage from '@react-native-async-storage/async-storage';

const FS_TOKEN_KEY = 'FS_OAUTH_TOKEN';
const FS_TOKEN_EXPIRY = 'FS_OAUTH_EXPIRY';

// Environment dependencies mapped securely explicitly
const CLIENT_ID = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET;

// Lightweight string encoder completely bypassing RN missing node modules seamlessly
const btoa = (input = '') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input;
  let output = '';
  for (let block = 0, charCode, i = 0, map = chars;
  str.charAt(i | 0) || (map = '=', i % 1);
  output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3/4);
    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  return output;
};

/**
 * Ensures securely authenticated tokens exist dynamically mapping into FatSecret bounds efficiently caching inside async bounds safely
 */
export const getFatSecretToken = async (): Promise<string> => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing EXPO_PUBLIC_FATSECRET_CLIENT_ID or CLIENT_SECRET natively inside .env constraints');
  }

  // Intercept and parse currently Cached arrays explicitly evaluating Unix time limits mathematically
  const cachedToken = await AsyncStorage.getItem(FS_TOKEN_KEY);
  const cachedExpiry = await AsyncStorage.getItem(FS_TOKEN_EXPIRY);

  if (cachedToken && cachedExpiry) {
    const expiresAt = parseInt(cachedExpiry, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now < expiresAt - 300) { // Keep a strict 5-minute safety buffer against expiry drops logically
      return cachedToken;
    }
  }

  // Payload authorization sequence cleanly handling basic Base64 boundaries
  const authHeader = `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`;
  const response = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=basic'
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("FatSecret Token Swap Error:", errText);
    throw new Error(`FatSecret OAuth Error: ${response.status}`);
  }

  const data = await response.json();
  const { access_token, expires_in } = data;

  // Storing structural timestamp limits dynamically correctly mapping Unix time sequences 
  const newExpiry = Math.floor(Date.now() / 1000) + parseInt(expires_in, 10);
  
  await AsyncStorage.setItem(FS_TOKEN_KEY, access_token);
  await AsyncStorage.setItem(FS_TOKEN_EXPIRY, newExpiry.toString());

  return access_token;
};

/**
 * Securely searches external platform strings gracefully tracking native boundaries
 */
export const searchFoods = async (searchExpression: string) => {
  const token = await getFatSecretToken();
  const url = `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(searchExpression)}&format=json&max_results=5`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    console.error("FatSecret Data Error:", response.status);
    throw new Error(`API Error executing foods.search - ${response.status}`);
  }

  const result = await response.json();
  
  if (result.error) {
    console.warn("FatSecret Native API Error Extracted:", result.error);
    throw new Error(`FatSecret API Error [${result.error.code}]: ${result.error.message}`);
  }
  
  if (result.foods && result.foods.food) {
    // Platform API organically returns an object rather than an array if only 1 item exists logically
    const foods = Array.isArray(result.foods.food) ? result.foods.food : [result.foods.food];
    return foods;
  }
  
  return []; // Fallback exactly mapping empty objects securely
};
