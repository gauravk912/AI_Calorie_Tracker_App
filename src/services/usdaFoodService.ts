// USDA FoodData Central Engine - 100% Free seamlessly proxy-free networking

// We use the Native DEMO_KEY temporarily strictly resolving standard JSON arrays safely until limits apply implicitly.
const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY';

export const searchFoodsUSDA = async (searchExpression: string) => {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(searchExpression)}&pageSize=15`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    console.warn("USDA API Extraction Error:", errText);
    throw new Error(`Food Database Request Blocked [${response.status}]: ${errText.substring(0, 50)}`);
  }

  const result = await response.json();
  
  if (result.foods) {
    return result.foods;
  }
  
  return []; 
};
