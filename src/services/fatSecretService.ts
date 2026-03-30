import CryptoJS from 'crypto-js';

export interface FoodItemData {
  id: string;
  name: string;
  brand: string;
  servingDesc: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

// Map the strict user arguments precisely onto OAuth1 Consumer boundaries internally 
const CONSUMER_KEY = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID || '';
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET || '';

/**
 * Organic implementation of RFC 5849 / OAuth 1.0 explicitly supporting strict Fatsecret query arrays
 * Parses deep complex crypto string evaluations directly mitigating React Native Bridge requirements cleanly
 */
export function generateOAuth1Url(method: string, queryParams: any) {
  const httpMethod = 'GET';
  const baseUrl = 'https://platform.fatsecret.com/rest/server.api';

  const params: any = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_version: '1.0',
    method: method,
    format: 'json',
    ...queryParams
  };

  // Explicit Strict mapping: JS Native encodeURIComponent ignores specific reserved arrays [ ! ' ( ) * ] mapped heavily by OAuth 1.0 RFC standards
  const rfc3986Encode = (str: string) => encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

  // Execute parameter sort logically mapped explicitly
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map(k => `${rfc3986Encode(k)}=${rfc3986Encode(params[k])}`).join('&');

  // Compute absolute Base mathematical structural tracking structurally
  const signatureBase = `${httpMethod}&${rfc3986Encode(baseUrl)}&${rfc3986Encode(paramString)}`;
  const signatureKey = `${rfc3986Encode(CONSUMER_SECRET)}&`;

  // Calculate HMAC-SHA1 signature
  const hash = CryptoJS.HmacSHA1(signatureBase, signatureKey);
  const signature = CryptoJS.enc.Base64.stringify(hash);

  // Overwrite structurally mapping params array pushing organically
  params.oauth_signature = signature;

  // Create final mapped URI parameters
  const finalParamsStr = Object.keys(params)
    .sort() // Sort rigorously resolving tracking structures
    .map(k => `${rfc3986Encode(k)}=${rfc3986Encode(params[k])}`)
    .join('&');

  return `${baseUrl}?${finalParamsStr}`;
}

export const searchFoodRegistry = async (query: string): Promise<FoodItemData[]> => {
  if (!query || query.length < 3) return [];
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    console.warn("OAuth 1.0 Credentials strictly missing internally.");
    throw new Error("Missing Consumer Keys globally.");
  }

  // Generate structurally tracked absolute URL organically
  const requestUrl = generateOAuth1Url('foods.search', {
    search_expression: query,
    max_results: '5'
  });

  try {
    const resp = await fetch(requestUrl, { method: 'GET' });
    const data = await resp.json();

    // Explicit API bounds mapping internal tracker errors evaluating 401 exceptions cleanly natively
    if (data.error) {
      console.error("FatSecret OAuth 1.0 Sign Reject JSON: ", data);
      throw new Error(`FatSecret API Error: ${data.error.message || 'Signature Invalid'}`);
    }

    const items = data?.foods?.food || [];
    const foodArray = Array.isArray(items) ? items : [items];

    return foodArray.filter((item: any) => item).map((item: any) => {
      const desc = item.food_description || '';

      const calories = parseInt(desc.match(/Calories:\s*(\d+)kcal/)?.[1] || "0");
      const fats = parseFloat(desc.match(/Fat:\s*([0-9.]+)g/)?.[1] || "0");
      const carbs = parseFloat(desc.match(/Carbs:\s*([0-9.]+)g/)?.[1] || "0");
      const protein = parseFloat(desc.match(/Protein:\s*([0-9.]+)g/)?.[1] || "0");
      const servingDesc = desc.split('-')[0]?.trim() || "Per 1 portion";

      return {
        id: item.food_id,
        name: item.food_name,
        brand: item.brand_name || 'Generic Base',
        servingDesc,
        calories,
        fats,
        carbs,
        protein
      };
    });

  } catch (error) {
    console.error("FatSecret API Array Failure Engine: ", error);
    return [];
  }
};
