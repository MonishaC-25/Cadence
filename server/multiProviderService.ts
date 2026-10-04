/**
 * Multi-Provider AI Fallback Engine
 * 
 * Provides a resilient multi-tier fallback architecture:
 * 1. Google Gemini API (Tier 1 Primary - gemini-3.8-flash, gemini-3.1-flash-lite)
 * 2. OpenAI API (Tier 2 - gpt-4o, gpt-4o-mini)
 * 3. Groq Cloud API (Tier 3 - 100% Free high-speed llama-3.3-70b-versatile)
 * 4. OpenRouter Free Tier (Tier 4 - meta-llama/llama-3.2-3b-instruct:free, mistral:free)
 * 5. Hugging Face Serverless (Tier 5 - Mistral-7B-Instruct-v0.3)
 * 6. Cohere Free Trial (Tier 6 - Command-R)
 * 7. Deterministic Local NLP Engine (Tier 7 - 100% Offline Guaranteed)
 */

export interface ProviderStatus {
  id: string;
  name: string;
  tier: string;
  cost: string;
  configured: boolean;
}

/**
 * 1. Call OpenAI API (Tier 2 Provider)
 */
export async function callOpenAIApi(
  prompt: string,
  systemPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'MY_OPENAI_API_KEY') {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText.slice(0, 150)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI API');
  return text;
}

/**
 * 2. Call Groq Cloud API (Tier 3 Provider - 100% Free Tier, 14,400 req/day)
 */
export async function callGroqApi(
  prompt: string,
  systemPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY') {
    throw new Error('Groq free API key not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      temperature: 0.2,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq free API error (${response.status}): ${errorText.slice(0, 150)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq free API');
  return text;
}

/**
 * 3. Call OpenRouter Free Models API (Tier 4 Provider - 100% Free :free models)
 */
export async function callOpenRouterFreeApi(
  prompt: string,
  systemPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'MY_OPENROUTER_API_KEY') {
    throw new Error('OpenRouter API key not configured (free at openrouter.ai)');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://cadence.build',
      'X-Title': 'Cadence AI Meeting Intelligence',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter Free API error (${response.status}): ${errorText.slice(0, 150)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenRouter Free API');
  return text;
}

/**
 * 4. Call Hugging Face Serverless Inference API (Tier 5 Provider - Free community tier)
 */
export async function callHuggingFaceApi(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || apiKey === 'MY_HUGGINGFACE_API_KEY') {
    throw new Error('Hugging Face free API token not configured (free at huggingface.co)');
  }

  const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HuggingFace Free API error (${response.status}): ${errorText.slice(0, 150)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Hugging Face Free API');
  return text;
}

/**
 * 5. Call Cohere Free Trial API (Tier 6 Provider - Command-R)
 */
export async function callCohereFreeApi(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey || apiKey === 'MY_COHERE_API_KEY') {
    throw new Error('Cohere free API key not configured (free trial at cohere.com)');
  }

  const response = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'command-r-08-2024',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cohere Free API error (${response.status}): ${errorText.slice(0, 150)}`);
  }

  const data = await response.json();
  const text = data?.message?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Cohere Free API');
  return text;
}

/**
 * Get available providers status for UI inspection
 */
export function getAvailableProviders(): ProviderStatus[] {
  return [
    {
      id: 'gemini',
      name: 'Google Gemini (Primary Engine)',
      tier: 'Tier 1: Free Tier (gemini-3.8-flash & 3.1-flash-lite)',
      cost: 'Free tier available (AI Studio)',
      configured: Boolean(process.env.GEMINI_API_KEY),
    },
    {
      id: 'openai',
      name: 'OpenAI API (Fallback 1)',
      tier: 'Tier 2: (gpt-4o / gpt-4o-mini)',
      cost: 'OpenAI Developer API',
      configured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'MY_OPENAI_API_KEY'),
    },
    {
      id: 'groq',
      name: 'Groq Cloud Llama 3.3 (Fallback 2)',
      tier: 'Tier 3: 100% Free Forever Tier (14,400 calls/day)',
      cost: '100% Free (console.groq.com)',
      configured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'MY_GROQ_API_KEY'),
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Free Models (Fallback 3)',
      tier: 'Tier 4: 100% Free Tier (meta-llama/llama-3.2:free, mistral:free)',
      cost: '100% Free (openrouter.ai)',
      configured: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'MY_OPENROUTER_API_KEY'),
    },
    {
      id: 'huggingface',
      name: 'Hugging Face Inference (Fallback 4)',
      tier: 'Tier 5: Serverless Free Tier (Mistral-7B-Instruct / Qwen)',
      cost: '100% Free (huggingface.co)',
      configured: Boolean(process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'MY_HUGGINGFACE_API_KEY'),
    },
    {
      id: 'cohere',
      name: 'Cohere Trial API (Fallback 5)',
      tier: 'Tier 6: Free Trial Developer Tier (Command-R)',
      cost: 'Free developer tier (cohere.com)',
      configured: Boolean(process.env.COHERE_API_KEY && process.env.COHERE_API_KEY !== 'MY_COHERE_API_KEY'),
    },
    {
      id: 'heuristic',
      name: 'Deterministic Heuristic NLP Engine (Fallback 6)',
      tier: 'Tier 7: Local Offline NLP Engine',
      cost: '100% Free & Always-On (No API key needed)',
      configured: true,
    },
  ];
}
