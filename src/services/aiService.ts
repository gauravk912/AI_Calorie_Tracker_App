import { Platform } from 'react-native';
import * as Device from 'expo-device';

type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

interface ChatCompletionRequest {
  modelKind: 'text' | 'vision';
  systemPrompt?: string;
  userContent: string | ChatContentPart[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

interface ChatCompletionResponse {
  content: string;
  provider: 'ollama' | 'openai';
  model: string;
}

interface EndpointCandidate {
  source: string;
  url: string;
  headers: Record<string, string>;
}

interface ProviderConfig {
  provider: 'ollama' | 'openai';
  model: string;
  endpoints: EndpointCandidate[];
}

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const normalizeOllamaModelName = (value: string) => (value.includes(':') ? value : `${value}:latest`);

const normalizeOllamaBaseUrl = (value: string) => {
  const trimmed = stripTrailingSlash(value.trim());
  return trimmed.endsWith('/v1') ? trimmed.slice(0, -3) : trimmed;
};

const buildOllamaChatUrl = (baseUrl: string) => `${normalizeOllamaBaseUrl(baseUrl)}/v1/chat/completions`;

const appendUniqueCandidate = (candidates: EndpointCandidate[], candidate: EndpointCandidate | null) => {
  if (!candidate) return;

  const exists = candidates.some((entry) => entry.url === candidate.url);
  if (!exists) {
    candidates.push(candidate);
  }
};

const unwrapJsonBlock = (value: string) => {
  let normalized = value.trim();

  if (normalized.startsWith('```json')) {
    normalized = normalized.slice(7);
  } else if (normalized.startsWith('```')) {
    normalized = normalized.slice(3);
  }

  if (normalized.endsWith('```')) {
    normalized = normalized.slice(0, -3);
  }

  return normalized.trim();
};

const extractMessageContent = (payload: any) => {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        return '';
      })
      .join('')
      .trim();
  }

  return '';
};

const postJsonWithXhr = async (url: string, headers: Record<string, string>, body: Record<string, any>, timeoutMs: number) => {
  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = timeoutMs;

    xhr.onload = () => {
      const responseText = xhr.responseText || '';

      if (xhr.status < 200 || xhr.status >= 300) {
        const compactBody = responseText.trim().slice(0, 500);
        reject(
          new Error(
            `AI request failed with status ${xhr.status}.${compactBody ? ` Response: ${compactBody}` : ''}`
          )
        );
        return;
      }

      try {
        resolve(JSON.parse(responseText));
      } catch {
        reject(new Error('AI response could not be parsed as JSON.'));
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          'Network request failed. Check that your ngrok tunnel is online and forwarding to the Ollama server.'
        )
      );
    };

    xhr.ontimeout = () => {
      reject(
        new Error(
          'AI request timed out. The local model may be too slow, still loading, or unreachable through ngrok.'
        )
      );
    };

    xhr.open('POST', url, true);
    Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    xhr.send(JSON.stringify(body));
  });
};

const getProviderConfig = (modelKind: 'text' | 'vision') => {
  const rawNgrokBaseUrl = process.env.EXPO_PUBLIC_OLLAMA_BASE_URL || '';
  const rawLocalBaseUrl = process.env.EXPO_PUBLIC_OLLAMA_LOCAL_BASE_URL || '';
  const rawLanBaseUrl = process.env.EXPO_PUBLIC_OLLAMA_LAN_BASE_URL || '';
  const hasNgrokUrl = /^https?:\/\//.test(normalizeOllamaBaseUrl(rawNgrokBaseUrl));
  const hasLocalUrl = /^https?:\/\//.test(normalizeOllamaBaseUrl(rawLocalBaseUrl));
  const hasLanUrl = /^https?:\/\//.test(normalizeOllamaBaseUrl(rawLanBaseUrl));

  if (hasNgrokUrl || hasLocalUrl || hasLanUrl) {
    const model =
      modelKind === 'vision'
        ? normalizeOllamaModelName(process.env.EXPO_PUBLIC_OLLAMA_VISION_MODEL || 'moondream:latest')
        : normalizeOllamaModelName(process.env.EXPO_PUBLIC_OLLAMA_TEXT_MODEL || 'llama3.2:1b');

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Bypass-Tunnel-Reminder': 'true',
    } as Record<string, string>;

    const endpoints: EndpointCandidate[] = [];
    const isVirtualDevice = Device.isDevice === false;

    if (hasLocalUrl) {
      appendUniqueCandidate(endpoints, {
        source: 'local env',
        url: buildOllamaChatUrl(rawLocalBaseUrl),
        headers: defaultHeaders,
      });
    }

    if (isVirtualDevice || Platform.OS === 'web') {
      if (Platform.OS === 'android') {
        appendUniqueCandidate(endpoints, {
          source: 'android emulator localhost',
          url: buildOllamaChatUrl('http://10.0.2.2:11434'),
          headers: defaultHeaders,
        });
      } else {
        appendUniqueCandidate(endpoints, {
          source: 'simulator localhost',
          url: buildOllamaChatUrl('http://127.0.0.1:11434'),
          headers: defaultHeaders,
        });
        appendUniqueCandidate(endpoints, {
          source: 'simulator localhost alias',
          url: buildOllamaChatUrl('http://localhost:11434'),
          headers: defaultHeaders,
        });
      }
    }

    if (hasLanUrl) {
      appendUniqueCandidate(endpoints, {
        source: 'lan env',
        url: buildOllamaChatUrl(rawLanBaseUrl),
        headers: defaultHeaders,
      });
    }

    if (hasNgrokUrl) {
      appendUniqueCandidate(endpoints, {
        source: 'ngrok env',
        url: buildOllamaChatUrl(rawNgrokBaseUrl),
        headers: defaultHeaders,
      });
    }

    return {
      provider: 'ollama' as const,
      model,
      endpoints,
    } satisfies ProviderConfig;
  }

  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'No AI provider is configured. Add EXPO_PUBLIC_OLLAMA_BASE_URL for your ngrok tunnel or set EXPO_PUBLIC_OPENAI_API_KEY as a fallback.'
    );
  }

  const model = modelKind === 'vision' ? 'gpt-4o' : 'gpt-4o';

  return {
    provider: 'openai' as const,
    model,
    endpoints: [
      {
        source: 'openai',
        url: OPENAI_CHAT_COMPLETIONS_URL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        } as Record<string, string>,
      },
    ],
  } satisfies ProviderConfig;
};

export const requestChatCompletion = async ({
  modelKind,
  systemPrompt,
  userContent,
  maxTokens = 400,
  temperature,
  jsonMode = false,
  timeoutMs = 180000,
}: ChatCompletionRequest): Promise<ChatCompletionResponse> => {
  const config = getProviderConfig(modelKind);

  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: userContent },
  ];

  const payload: Record<string, any> = {
    model: config.model,
    messages,
    max_tokens: maxTokens,
  };

  if (typeof temperature === 'number') {
    payload.temperature = temperature;
  }

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const errors: string[] = [];

  for (const endpoint of config.endpoints) {
    try {
      const response = await postJsonWithXhr(endpoint.url, endpoint.headers, payload, timeoutMs);
      const content = extractMessageContent(response);

      if (!content) {
        throw new Error('AI response did not include any message content.');
      }

      return {
        content,
        provider: config.provider,
        model: config.model,
      };
    } catch (error: any) {
      errors.push(`${endpoint.source}: ${error?.message || String(error)}`);

      const isHttpError = typeof error?.message === 'string' && error.message.startsWith('AI request failed with status');
      if (isHttpError) {
        throw error;
      }
    }
  }

  throw new Error(
    `Unable to reach the configured AI endpoint. Tried ${config.endpoints.map((endpoint) => endpoint.source).join(', ')}. ${errors.join(' | ')}`
  );
};

export const requestJsonCompletion = async <T>(request: ChatCompletionRequest): Promise<T> => {
  const response = await requestChatCompletion({ ...request, jsonMode: true });

  try {
    return JSON.parse(unwrapJsonBlock(response.content)) as T;
  } catch {
    throw new Error(`AI returned invalid JSON: ${response.content}`);
  }
};
