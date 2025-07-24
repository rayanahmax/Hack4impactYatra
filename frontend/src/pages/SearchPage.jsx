import React, { useState, useEffect } from 'react';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
const GEMINI_SEARCH_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const SYSTEM_PROMPT = `
SYSTEM INSTRUCTIONS:
You are a professional Nepal tourism content generator. Your responses must be accurate, well-researched, and formatted as clean JSON without any conversational elements.

STRICT CONTENT RESTRICTIONS:
- ONLY respond to queries about Nepal tourism (places, attractions, travel information, cultural sites, activities)
- For any non-Nepal tourism topics, respond with: {"error": "This service only provides information about Nepal tourism destinations and travel"}
- Do not include emojis, casual language, or conversational phrases
- Do not start responses with phrases like "Here's your guide" or "I hope this helps"

RESPONSE FORMAT REQUIREMENTS:
- All responses must be valid JSON format
- Use professional, informative tone
- Include accurate, current information
- Verify all details before including them
- Structure content with clear sections

CURRENCY AND LOCALIZATION REQUIREMENTS:
- Convert budget estimates to the user's home country currency
- For unrecognized countries, use USD and include "currency_note"
- Never use CAD unless the user is specifically from Canada
- Use "estimated_budget" as the key (never "estimated_budget_cad")
- Include practical advice relevant to user's nationality

TRANSPORTATION ACCURACY:
- Only mention ride-sharing/transport apps actually available in Nepal (e.g., Pathao)
- Do NOT mention Uber, Lyft, or other unavailable services
- Include accurate local transportation options (local buses, micro-buses, taxis, private vehicles)

JSON STRUCTURE TEMPLATE:
{
  "destination": "destination_name",
  "personalized_greeting": "Welcome [USER_NAME], tailored introduction based on user background and interests",
  "overview": "brief_description",
  "location": {
    "distance_from_kathmandu": "distance_info",
    "transportation": ["accurate_local_transport_options"]
  },
  "entry_information": {
    "foreign_national_fee": "fee_in_npr_and_user_currency",
    "access_restrictions": "any_restrictions",
    "visiting_hours": "operating_hours"
  },
  "key_experiences": [
    {
      "activity": "activity_name",
      "timing": "best_time_to_visit",
      "description": "detailed_description"
    }
  ],
  "cultural_significance": "cultural_and_historical_context",
  "visitor_guidelines": [
    "guideline_1",
    "guideline_2",
    "guideline_3"
  ],
  "estimated_budget": {
    "entry_fee": "amount_in_user_currency",
    "transportation": "amount_range_in_user_currency",
    "guide_optional": "amount_range_in_user_currency",
    "total_estimate": "total_range_in_user_currency"
  },
  "currency_note": "Note: Amounts shown in USD as country-specific currency conversion unavailable" (only include if using USD for unrecognized country),
  "best_visiting_time": "recommended_time_period",
  "special_notes": "additional_important_information",
  "interest_alignment": {
    "applicable": true/false,
    "matching_activities": ["activity_1", "activity_2"] or null,
    "why_it_matches": "explanation_of_connection_mentioning_specific_interest" or null,
    "personalized_recommendation": "tailored advice based on user's specific background and interests" or null
  },
  "personal_connection": "explanation of why this destination will resonate with the user's background, interests, or travel style"
}

PERSONALIZATION REQUIREMENTS:
- Address user by name in personalized_greeting
- Reference user's country of origin, interests, and background where relevant
- Tailor recommendations based on user's specific profile
- Make connections between user's interests and destination features
- Use inclusive language that makes the user feel the content was created specifically for them
- Include practical advice relevant to user's background and nationality

INTEREST-BASED CONTENT RULES:
- Only include "interest_alignment" section if the destination genuinely offers activities/experiences that match the specified visitor interests
- Set "applicable": false if no meaningful connection exists
- Be honest about limitations - not every place suits every interest
- When interest alignment is applicable, specifically mention the user's interest in the explanation
- Examples of interest categories: adventure sports, spiritual experiences, cultural immersion, nature photography, trekking, wildlife, historical exploration, local cuisine, traditional crafts
- Only claim interest alignment if specific, verifiable activities exist at the destination
- Include personalized_recommendation only when interest alignment is applicable

VERIFICATION REQUIREMENTS:
- Verify all prices, timings, and access information
- Confirm transportation options are current and available in Nepal
- Validate cultural and historical information
- Check entry fees and restrictions
- Ensure budget estimates reflect current rates
- Only mention transportation services that actually operate in Nepal
`;

const API_URL = 'http://localhost:3000';


const CURRENCY_MAPPING = {
  'USA': 'USD',
  'United States': 'USD',
  'Canada': 'CAD',
  'UK': 'GBP',
  'United Kingdom': 'GBP',
  'Australia': 'AUD',
  'India': 'INR',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Japan': 'JPY',
  'China': 'CNY',
  'South Korea': 'KRW',
  'Singapore': 'SGD',
  'Thailand': 'THB',
  'Malaysia': 'MYR',
  'Philippines': 'PHP',
  'Indonesia': 'IDR',
  'Vietnam': 'VND',
  'Bangladesh': 'BDT',
  'Pakistan': 'PKR',
  'Sri Lanka': 'LKR'
};

function GuideDisplay({ data }) {
  if (!data) return null;
  
  let parsed;
  let raw = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      // Try to extract JSON block
      const firstBrace = data.indexOf('{');
      const lastBrace = data.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonBlock = data.substring(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(jsonBlock);
        } catch {
          
        }
      }
    }
  } else {
    parsed = data;
  }

  if (!parsed) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="text-red-600 font-semibold mb-2">Invalid JSON response</div>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{raw}</pre>
      </div>
    );
  }

  if (parsed.error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-md mt-6">
        <div className="text-red-700 font-semibold mb-2">Error</div>
        <p className="text-red-600">{parsed.error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-2xl font-bold text-blue-700 mb-2">{parsed.destination}</h3>
      <p className="italic text-lg mb-4 text-green-700">{parsed.personalized_greeting}</p>
      
      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Overview</h4>
        <p className="mt-2">{parsed.overview}</p>
      </section>

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Location</h4>
        <div className="mt-2">
          <p><strong>Distance from Kathmandu:</strong> {parsed.location?.distance_from_kathmandu}</p>
          <p><strong>Transportation:</strong> {parsed.location?.transportation?.join(', ')}</p>
        </div>
      </section>

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Entry Information</h4>
        <ul className="list-disc ml-6 mt-2">
          <li><strong>Foreign National Fee:</strong> {parsed.entry_information?.foreign_national_fee}</li>
          <li><strong>Access Restrictions:</strong> {parsed.entry_information?.access_restrictions}</li>
          <li><strong>Visiting Hours:</strong> {parsed.entry_information?.visiting_hours}</li>
        </ul>
      </section>

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Key Experiences</h4>
        <ul className="list-disc ml-6 mt-2">
          {parsed.key_experiences?.map((exp, i) => (
            <li key={i} className="mb-2">
              <strong>{exp.activity}</strong> <span className="text-sm text-gray-500">({exp.timing})</span>
              <div className="mt-1">{exp.description}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Cultural Significance</h4>
        <p className="mt-2">{parsed.cultural_significance}</p>
      </section>

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Visitor Guidelines</h4>
        <ul className="list-disc ml-6 mt-2">
          {parsed.visitor_guidelines?.map((g, i) => <li key={i}>{g}</li>)}
        </ul>
      </section>

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Estimated Budget</h4>
        <ul className="list-disc ml-6 mt-2">
          <li><strong>Entry Fee:</strong> {parsed.estimated_budget?.entry_fee}</li>
          <li><strong>Transportation:</strong> {parsed.estimated_budget?.transportation}</li>
          <li><strong>Guide (Optional):</strong> {parsed.estimated_budget?.guide_optional}</li>
          <li><strong>Total Estimate:</strong> {parsed.estimated_budget?.total_estimate}</li>
        </ul>
        {parsed.currency_note && (
          <p className="text-sm text-blue-600 mt-2 italic">{parsed.currency_note}</p>
        )}
      </section>

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Best Visiting Time</h4>
        <p className="mt-2">{parsed.best_visiting_time}</p>
      </section>

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Special Notes</h4>
        <p className="mt-2">{parsed.special_notes}</p>
      </section>

      {parsed.interest_alignment && (
        <section className="mb-4">
          <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Interest Alignment</h4>
          <div className="mt-2">
            <p><strong>Applicable:</strong> {parsed.interest_alignment.applicable ? 'Yes' : 'No'}</p>
            {parsed.interest_alignment.matching_activities && (
              <p><strong>Matching Activities:</strong> {parsed.interest_alignment.matching_activities.join(', ')}</p>
            )}
            {parsed.interest_alignment.why_it_matches && (
              <p><strong>Why it matches:</strong> {parsed.interest_alignment.why_it_matches}</p>
            )}
            {parsed.interest_alignment.personalized_recommendation && (
              <div className="bg-blue-50 p-3 rounded mt-2">
                <p><strong>Personalized Recommendation:</strong> {parsed.interest_alignment.personalized_recommendation}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mb-4">
        <h4 className="font-semibold text-gray-800 text-lg border-b pb-1">Personal Connection</h4>
        <p className="mt-2 bg-green-50 p-3 rounded">{parsed.personal_connection}</p>
      </section>
    </div>
  );
}

export default function SearchPage() {
  const [user, setUser] = useState({ name: '', country: '' });
  const [userInterests, setUserInterests] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [searchProgress, setSearchProgress] = useState('');
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);

  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const test = 'test';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const checkStorage = isLocalStorageAvailable();
    setStorageAvailable(checkStorage);
    
    if (!checkStorage) {
      // Set demo data when localStorage is not available (like in Claude artifacts)
      setUser({ name: 'Demo User', country: 'USA' });
      setUserInterests(['trekking', 'photography', 'cultural sites']);
      setError('Demo Mode: Using sample user data. In your deployed app, this will fetch real user data.');
      return;
    }

    const fetchUserAndInterests = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        setError('Please log in to access personalized content');
        return;
      }

      try {
        // Fetch user info
        const userRes = await fetch(`${API_URL}/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        setUser({ name: userData.name, country: userData.country });

        // Fetch user interests
        const intRes = await fetch(`${API_URL}/api/preference/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const interestData = await intRes.json();
        setUserInterests(interestData?.interest || []);
      } catch (err) {
        setError('Failed to fetch user info or interests');
      }
    };

    if (checkStorage) {
      fetchUserAndInterests();
    }
  }, []);

  const performGoogleSearch = async (searchQuery) => {
    const searchPayload = {
      contents: [{
        parts: [{ 
          text: `Search for current information about: ${searchQuery}. Provide recent, accurate details about entry fees, transportation options, operating hours, and current conditions. Focus on official and reliable sources.` 
        }]
      }],
      tools: [{
        googleSearchRetrieval: {
          searchQualities: ["HIGH_QUALITY"]
        }
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1500,
      }
    };

    try {
      const searchRes = await fetch(`${GEMINI_SEARCH_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchPayload)
      });

      const searchData = await searchRes.json();
      if (searchRes.ok && searchData?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return searchData.candidates[0].content.parts[0].text;
      }
      return null;
    } catch (err) {
      console.warn('Google Search failed:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    setError("");
    setResponse("");
    setLoading(true);
    setSearchProgress('');

    const interestsString = userInterests.length > 0 ? userInterests.join(', ') : 'general tourism';
    const userCurrency = CURRENCY_MAPPING[user.country] || 'USD';
    
    let searchResults = '';
    
    // Perform Google Search if enabled
    if (useGoogleSearch) {
      setSearchProgress('Searching for current information...');
      
      const searchQueries = [
        `${destination} Nepal entry fee 2024 2025 current prices`,
        `${destination} Nepal transportation how to reach 2024`,
        `${destination} Nepal visiting hours opening times current`,
        `${destination} Nepal travel guide recent information`
      ];

      const searchPromises = searchQueries.map(query => performGoogleSearch(query));
      const results = await Promise.all(searchPromises);
      
      searchResults = results.filter(result => result).join('\n\n');
      setSearchProgress('Generating personalized content...');
    }

    const enhancedPrompt = `${SYSTEM_PROMPT}

${searchResults ? `CURRENT SEARCH RESULTS FOR REFERENCE:
${searchResults}

Use this current information to verify and update details like entry fees, transportation options, and operating hours. Ensure all information is as current as possible.

` : ''}CURRENT REQUEST CONTEXT:
- User Name: ${user.name}
- User Country: ${user.country}
- User Currency: ${userCurrency}
- User Interests: ${interestsString}
- Current Location: ${currentLocation}
- Desired Destination: ${destination}

Based on the above instructions${searchResults ? ', current search results,' : ''} and format, provide detailed tourism information for ${user.name} from ${user.country} who is currently in ${currentLocation} and wants to visit ${destination} in Nepal. Their interests include: ${interestsString}.

CRITICAL REQUIREMENTS:
1. Convert all budget estimates to ${userCurrency} (${user.country}'s currency)
2. Only mention transportation apps/services that actually operate in Nepal (e.g., Pathao for ride-sharing, NOT Uber)
3. Only include interest_alignment section if ${destination} genuinely offers activities related to: ${interestsString}
4. If interest alignment is applicable, specifically mention the user's interests in the explanation
5. Use "estimated_budget" as the key (never "estimated_budget_cad")
6. Include accurate, verified information formatted as clean JSON without any conversational elements
${searchResults ? '7. Prioritize the current search results for up-to-date information on prices, hours, and access details' : ''}

Provide personalized content that makes ${user.name} feel this guide was created specifically for them as a ${user.country} traveler interested in ${interestsString}.`;

    const payload = {
      contents: [{
        parts: [{ text: enhancedPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 3000,
      }
    };

    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Failed to generate content. Please check your API key and try again.");
        setResponse(JSON.stringify(data, null, 2));
        setLoading(false);
        setSearchProgress('');
        return;
      }

      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      setResponse(output);
    } catch (err) {
      setError("Network error occurred. Please check your connection and try again.");
      setResponse(
        JSON.stringify({
          error: "Failed to fetch response from Gemini. Please check your API key and network connection.",
          details: typeof err === "object" && err !== null && "message" in err ? err.message : String(err)
        }, null, 2)
      );
    } finally {
      setLoading(false);
      setSearchProgress('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Nepal Tourism Content Generator
      </h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        {!storageAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
            <div className="text-yellow-800 font-semibold mb-1">Demo Mode Active</div>
            <p className="text-yellow-700 text-sm">
              localStorage is not available in this environment. Using sample user data for demonstration. 
              In your deployed application, real user authentication and data will be used.
            </p>
          </div>
        )}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Location:
            </label>
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Kathmandu, Delhi, London"
              required
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="useGoogleSearch"
              checked={useGoogleSearch}
              onChange={(e) => setUseGoogleSearch(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useGoogleSearch" className="text-sm font-medium text-gray-700">
              Use Google Search for current information (recommended)
            </label>
          </div>

          {searchProgress && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-700 text-sm">{searchProgress}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination in Nepal:
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Thamel, Pokhara, Everest Base Camp, Lumbini"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name:
            </label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => !storageAvailable && setUser(prev => ({ ...prev, name: e.target.value }))}
              disabled={storageAvailable}
              className={`w-full p-3 border border-gray-300 rounded-md ${
                storageAvailable ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder={storageAvailable ? "Loading user information..." : "Enter your name"}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country of Origin:
            </label>
            <input
              type="text"
              value={user.country}
              onChange={(e) => !storageAvailable && setUser(prev => ({ ...prev, country: e.target.value }))}
              disabled={storageAvailable}
              className={`w-full p-3 border border-gray-300 rounded-md ${
                storageAvailable ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder={storageAvailable ? "Loading user information..." : "e.g., USA, Canada, UK"}
            />
            {user.country && (
              <p className="text-sm text-blue-600 mt-1">
                Budget will be shown in {CURRENCY_MAPPING[user.country] || 'USD'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Interests:
            </label>
            <input
              type="text"
              value={userInterests.join(', ') || (storageAvailable ? 'Loading interests...' : '')}
              onChange={(e) => !storageAvailable && setUserInterests(e.target.value.split(',').map(i => i.trim()).filter(i => i))}
              disabled={storageAvailable}
              className={`w-full p-3 border border-gray-300 rounded-md ${
                storageAvailable ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder={storageAvailable ? "Loading interests..." : "e.g., trekking, photography, cultural sites"}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !destination || !currentLocation}
            className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors ${
              loading || !destination || !currentLocation
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading 
              ? (searchProgress || "Generating Personalized Guide...") 
              : `Generate ${useGoogleSearch ? 'Current ' : ''}Personalized Guide`
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <div className="text-red-700 font-semibold">Error:</div>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {useGoogleSearch && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <div className="text-green-700 font-semibold mb-1">Enhanced with Google Search</div>
          <p className="text-green-600 text-sm">
            This guide includes current information from Google Search for the most up-to-date entry fees, 
            transportation options, and operating hours.
          </p>
        </div>
      )}

      {response && <GuideDisplay data={response} />}
    </div>
  );
}
