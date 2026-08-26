import {
  Attachment,
  ChatMessage,
  DiscoveredModel,
  LocalPortConfig,
  ModelCustomConfig,
  NetworkProxyConfig,
  ProviderId,
} from '../types';
import { PROVIDERS_LIST } from '../data/defaultModels';

export interface ChatStreamParams {
  modelId: string;
  provider: ProviderId;
  messages: ChatMessage[];
  systemPrompt?: string;
  modelConfig?: ModelCustomConfig;
  localPortConfig?: LocalPortConfig;
  apiKeys: Record<string, string>;
  networkProxy?: NetworkProxyConfig;
  attachments?: Attachment[];
  onChunk: (text: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

const PROVIDER_NAMES: Record<string, string> = {
  google: 'Google Gemini',
  openai: 'OpenAI (ChatGPT)',
  anthropic: 'Anthropic (Claude)',
  deepseek: 'DeepSeek',
  groq: 'Groq Cloud',
  mistral: 'Mistral AI',
  openrouter: 'OpenRouter',
  together: 'Together AI',
  perplexity: 'Perplexity AI',
  xai: 'xAI (Grok)',
  alibaba: 'Alibaba Cloud (Qwen)',
  meta: 'Meta AI (Llama)',
  cohere: 'Cohere',
  custom: 'Локальная / Пользовательская модель',
};

const PROVIDER_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  together: 'https://api.together.xyz/v1/chat/completions',
  perplexity: 'https://api.perplexity.ai/chat/completions',
  xai: 'https://api.x.ai/v1/chat/completions',
  alibaba: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
  meta: 'https://api.meta.ai/v1/chat/completions',
  cohere: 'https://api.cohere.ai/v1/chat',
};

/**
 * Maps model ID to valid API endpoint model names.
 */
function resolveGoogleModel(modelId: string): string {
  return modelId.replace(/^models\//, '').trim();
}

/**
 * Checks if the current runtime environment is a mobile native app (Capacitor/Cordova)
 */
export function isNativeMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    !!(window as any).Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && !window.location.port)
  );
}

/**
 * Generates an informative, formatted warning when an API key is missing.
 */
function getMissingKeyMessage(provider: ProviderId, modelId: string): string {
  const pName = PROVIDER_NAMES[provider] || provider;
  return `⚠️ **Отсутствует API-ключ для ${pName}**\n\nВы выбрали модель **${modelId}**, но в приложении не указан ключ доступа.\n\n**Как настроить ключ:**\n1. Нажмите на значок **Настройки** (шестерёнка ⚙️ вверху экрана).\n2. Перейдите во вкладку **«ИИ-модели»**.\n3. Найдите раздел **${pName}** и вставьте ваш API-ключ.\n4. Закройте настройки и отправьте сообщение повторно!`;
}

/**
 * Unified stream execution:
 * 1. Validates API Key.
 * 2. On web with Node backend: tries `/api/chat` SSE stream.
 * 3. On Mobile Android / Standalone / Direct: directly executes via HTTPS REST API with robust SSE parsing and fallback.
 */
export async function sendChatMessageStream(params: ChatStreamParams): Promise<void> {
  const {
    modelId,
    provider,
    messages,
    systemPrompt,
    modelConfig,
    localPortConfig,
    apiKeys,
    attachments,
    onChunk,
    onError,
    onDone,
  } = params;

  const effectiveSystemPrompt = modelConfig?.systemPrompt?.trim() || systemPrompt?.trim() || '';
  const apiKey = apiKeys?.[provider]?.trim() || '';

  // 1. Check API Key presence (except for local/custom models)
  if (provider !== 'custom') {
    if (!apiKey) {
      onChunk(getMissingKeyMessage(provider, modelId));
      onDone();
      return;
    }
  }

  // 2. Try Node backend route ONLY if NOT running in native mobile Android/Capacitor
  if (!isNativeMobile()) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const serverRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          provider,
          messages,
          systemPrompt: effectiveSystemPrompt,
          modelConfig,
          localPortConfig,
          apiKeys,
          attachments,
        }),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      const contentType = serverRes?.headers.get('content-type') || '';
      // Only proceed with server response if it returned actual SSE stream
      if (serverRes && serverRes.ok && serverRes.body && contentType.includes('text/event-stream')) {
        const reader = serverRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let hasReceivedAnyText = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.substring(6));
                if (parsed.error) {
                  onError(parsed.error);
                  return;
                }
                if (parsed.text) {
                  hasReceivedAnyText = true;
                  onChunk(parsed.text);
                }
                if (parsed.done) {
                  onDone();
                  return;
                }
              } catch (e) {
                // ignore SSE parse chunk
              }
            }
          }
        }

        if (hasReceivedAnyText) {
          onDone();
          return;
        }
      }
    } catch (e) {
      // Continue to direct client-side fallback below
    }
  }

  // 3. Direct Client-side Execution (Essential for Android APK / Capacitor / Standalone)
  try {
    const proxyMode = params.networkProxy?.mode || 'mirror';
    const customGoogleUrl = params.networkProxy?.customGoogleMirrorUrl?.trim();

    // === 3A. Google Gemini Direct / Mirror REST ===
    if (provider === 'google' || modelId.startsWith('gemini')) {
      const resolvedModel = resolveGoogleModel(modelId);
      let baseUrl = 'https://generativelanguage.googleapis.com';

      if (proxyMode === 'custom' && customGoogleUrl) {
        baseUrl = customGoogleUrl.replace(/\/+$/, '');
      }

      const url = `${baseUrl}/v1beta/models/${resolvedModel}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

      const contents = (messages || []).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));

      // Add attachments to the last message if available
      if (attachments && attachments.length > 0 && contents.length > 0) {
        const lastMsg = contents[contents.length - 1];
        attachments.forEach((att) => {
          if (att.base64Data && att.type?.startsWith('image/')) {
            const base64Clean = att.base64Data.includes(',') ? att.base64Data.split(',')[1] : att.base64Data;
            lastMsg.parts.push({
              inline_data: {
                mime_type: att.type,
                data: base64Clean,
              },
            } as any);
          } else if (att.textData) {
            lastMsg.parts.push({
              text: `\n\n[Прикрепленный файл: ${att.name}]\n${att.textData}`,
            });
          }
        });
      }

      const bodyPayload: any = {
        contents,
      };

      if (effectiveSystemPrompt) {
        bodyPayload.systemInstruction = {
          parts: [{ text: effectiveSystemPrompt }],
        };
      }

      const generationConfig: any = {};
      if (modelConfig?.temperature !== undefined) generationConfig.temperature = modelConfig.temperature;
      if (modelConfig?.maxTokens !== undefined) generationConfig.maxOutputTokens = modelConfig.maxTokens;
      if (modelConfig?.topP !== undefined) generationConfig.topP = modelConfig.topP;

      if (Object.keys(generationConfig).length > 0) {
        bodyPayload.generationConfig = generationConfig;
      }

      // If mirror mode on web, also attempt /api/proxy/google
      if (proxyMode === 'mirror') {
        try {
          const proxyRes = await fetch('/api/proxy/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: resolvedModel,
              apiKey,
              body: bodyPayload,
              isStream: true,
            }),
          }).catch(() => null);

          if (proxyRes && proxyRes.ok && proxyRes.body) {
            const reader = proxyRes.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let hasReceived = false;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  try {
                    const parsed = JSON.parse(trimmed.substring(6));
                    if (parsed.error) {
                      onError(parsed.error);
                      return;
                    }
                    const candidates = parsed?.candidates || [];
                    for (const candidate of candidates) {
                      const parts = candidate?.content?.parts || [];
                      for (const part of parts) {
                        if (part.text) {
                          hasReceived = true;
                          onChunk(part.text);
                        }
                      }
                    }
                    if (parsed.done) {
                      onDone();
                      return;
                    }
                  } catch (e) {
                    // ignore partial json
                  }
                }
              }
            }

            if (hasReceived) {
              onDone();
              return;
            }
          }
        } catch (e) {
          // fallback to direct REST
        }
      }

      let geminiRes: Response | null = null;
      try {
        geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
      } catch (fetchErr: any) {
        onError(`⚠️ Не удалось связаться с серверами Google API (${fetchErr?.message || 'Сеть недоступна'}). Если вы находитесь в РФ, переключите режим на «Встроенное зеркало» в Настройках ⚙️ -> «Сеть и Зеркало» или включите VPN / Xbox DNS.`);
        return;
      }

      // If model not found (e.g. 404), fallback to widely available Gemini models
      if (!geminiRes.ok && (geminiRes.status === 404 || geminiRes.status === 400)) {
        const fallbacks = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
        for (const fb of fallbacks) {
          if (fb === resolvedModel) continue;
          const fallbackUrl = `${baseUrl}/v1beta/models/${fb}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
          const fallbackRes = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
          }).catch(() => null);

          if (fallbackRes && fallbackRes.ok) {
            geminiRes = fallbackRes;
            break;
          }
        }
      }

      if (!geminiRes || !geminiRes.ok) {
        const errJson = await geminiRes?.json().catch(() => ({}));
        const errMsg = (errJson as any)?.error?.message || (geminiRes ? `Google API HTTP ${geminiRes.status}: ${geminiRes.statusText}` : 'Ошибка соединения');
        
        const isGeoBlocked = errMsg.toLowerCase().includes('location') || errMsg.toLowerCase().includes('unsupported') || errMsg.toLowerCase().includes('region');
        if (isGeoBlocked) {
          onError(`⚠️ Геоблокировка Google API в вашем регионе (${errMsg}). Решение: откройте Настройки ⚙️ -> «Сеть и Зеркало» и выберите режим «Встроенное зеркало (РФ без VPN)» или активируйте Xbox DNS / VPN.`);
        } else {
          onError(`Ошибка Google Gemini: ${errMsg}`);
        }
        return;
      }

      let hasText = false;
      if (geminiRes.body) {
        const reader = geminiRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.substring(6));
                const candidates = parsed?.candidates || [];
                for (const candidate of candidates) {
                  const parts = candidate?.content?.parts || [];
                  for (const part of parts) {
                    if (part.text) {
                      hasText = true;
                      onChunk(part.text);
                    }
                  }
                }
              } catch (e) {
                // ignore partial JSON
              }
            }
          }
        }
      }

      // If stream didn't produce text, fallback to non-stream REST
      if (!hasText) {
        const nonStreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const nonStreamRes = await fetch(nonStreamUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
        if (nonStreamRes.ok) {
          const data: any = await nonStreamRes.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          for (const p of parts) {
            if (p.text) onChunk(p.text);
          }
        }
      }

      onDone();
      return;
    }

    // === 3B. Anthropic Claude Direct REST ===
    if (provider === 'anthropic') {
      const formattedMessages = (messages || []).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content || '',
      }));

      const bodyPayload: any = {
        model: modelId,
        messages: formattedMessages,
        max_tokens: modelConfig?.maxTokens || 4096,
      };

      if (effectiveSystemPrompt) {
        bodyPayload.system = effectiveSystemPrompt;
      }
      if (modelConfig?.temperature !== undefined) {
        bodyPayload.temperature = modelConfig.temperature;
      }

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!claudeRes.ok) {
        const errJson = await claudeRes.json().catch(() => ({}));
        const errMsg = (errJson as any)?.error?.message || `Anthropic HTTP ${claudeRes.status}`;
        onError(`Ошибка Anthropic: ${errMsg}`);
        return;
      }

      const data: any = await claudeRes.json();
      const text = data?.content?.[0]?.text || '';
      onChunk(text);
      onDone();
      return;
    }

    // === 3C. Local Models / Ollama / LM Studio (Custom Provider) ===
    if (provider === 'custom') {
      const host = localPortConfig?.host || '127.0.0.1';
      const port = localPortConfig?.port || 11434;
      const cleanHost = host.trim().replace(/^https?:\/\//, '');
      const cleanModelId = modelId.replace(/^local\//, '').replace(/^hf\//, '');

      const formattedMessages = (messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      if (effectiveSystemPrompt) {
        formattedMessages.unshift({ role: 'system', content: effectiveSystemPrompt });
      }

      // Try Ollama
      try {
        const localRes = await fetch(`http://${cleanHost}:${port}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: cleanModelId,
            messages: formattedMessages,
            stream: false,
            options: {
              temperature: modelConfig?.temperature,
              num_predict: modelConfig?.maxTokens,
              top_p: modelConfig?.topP,
            },
          }),
          signal: AbortSignal.timeout(300000),
        });

        if (localRes.ok) {
          const data: any = await localRes.json();
          const text = data?.message?.content || 'Ответ локальной модели получен.';
          onChunk(text);
          onDone();
          return;
        }
      } catch (err) {
        // try LM studio below
      }

      // Try OpenAI-compatible LM Studio / vLLM
      try {
        const lmStudioRes = await fetch(`http://${cleanHost}:${port}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: cleanModelId,
            messages: formattedMessages,
            temperature: modelConfig?.temperature,
            max_tokens: modelConfig?.maxTokens,
          }),
          signal: AbortSignal.timeout(300000),
        });

        if (lmStudioRes.ok) {
          const data: any = await lmStudioRes.json();
          const text = data?.choices?.[0]?.message?.content || 'Ответ локального сервера получен.';
          onChunk(text);
          onDone();
          return;
        }
      } catch (err: any) {
        onError(`Не удалось подключиться к локальному порту http://${cleanHost}:${port}. Убедитесь, что сервер Ollama / LM Studio запущен.`);
        return;
      }
    }

    // === 3D. OpenAI-Compatible Providers (OpenAI, DeepSeek, Groq, Mistral, OpenRouter, Together, Perplexity, xAI, Alibaba, Meta, Cohere) ===
    const targetUrl = PROVIDER_ENDPOINTS[provider] || 'https://api.openai.com/v1/chat/completions';

    const formattedMessages: any[] = [];
    if (effectiveSystemPrompt) {
      formattedMessages.push({ role: 'system', content: effectiveSystemPrompt });
    }

    (messages || []).forEach((m) => {
      formattedMessages.push({
        role: m.role,
        content: m.content || '',
      });
    });

    const bodyPayload: any = {
      model: modelId,
      messages: formattedMessages,
      stream: true,
    };

    if (modelConfig?.temperature !== undefined) bodyPayload.temperature = modelConfig.temperature;
    if (modelConfig?.maxTokens !== undefined) bodyPayload.max_tokens = modelConfig.maxTokens;
    if (modelConfig?.topP !== undefined) bodyPayload.top_p = modelConfig.topP;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const errMsg = (errJson as any)?.error?.message || `HTTP ${res.status} (${res.statusText})`;
      onError(`[${PROVIDER_NAMES[provider] || provider}] ${errMsg}`);
      return;
    }

    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6).trim();
            if (dataStr === '[DONE]') {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              const textChunk = parsed?.choices?.[0]?.delta?.content || parsed?.choices?.[0]?.text || '';
              if (textChunk) {
                onChunk(textChunk);
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
    } else {
      const data: any = await res.json();
      const text = data?.choices?.[0]?.message?.content || 'Ответ получен.';
      onChunk(text);
    }

    onDone();
  } catch (error: any) {
    onError(error?.message || 'Ошибка сети при обращении к ИИ-провайдеру');
  }
}

/**
 * Tests API key and discovers available models for a provider.
 */
export async function discoverProviderModels(
  provider: ProviderId,
  apiKey: string
): Promise<{ success: boolean; models?: DiscoveredModel[]; status: string; error?: string }> {
  const trimmedKey = apiKey?.trim();

  if (!trimmedKey && provider !== 'google') {
    return {
      success: false,
      status: 'API-ключ не указан',
      error: `Введите API-ключ для ${PROVIDER_NAMES[provider] || provider}`,
    };
  }

  // 1. Try server first (only if on web with active server)
  if (!isNativeMobile()) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const sRes = await fetch('/api/models/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: trimmedKey }),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeout);

      const contentType = sRes?.headers.get('content-type') || '';
      if (sRes && sRes.ok && contentType.includes('application/json')) {
        const data = await sRes.json();
        return data;
      }
    } catch (e) {
      // Continue to direct client check
    }
  }

  // 2. Direct client verification
  try {
    if (provider === 'google') {
      if (!trimmedKey) {
        return {
          success: false,
          status: 'API-ключ Google не указан',
          error: 'Вставьте ваш ключ Gemini API в поле Google',
        };
      }

      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(trimmedKey)}`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (listRes.ok) {
        const data: any = await listRes.json();
        const models = (data.models || [])
          .map((m: any) => (m.name || '').replace(/^models\//, ''))
          .filter(
            (id: string) =>
              id.startsWith('gemini') &&
              !id.includes('embedding') &&
              !id.includes('aqa') &&
              !id.includes('imagen')
          )
          .map((id: string) => ({ id, name: id }));

        return {
          success: true,
          models: models.length > 0 ? models : undefined,
          status: `Подключение к Gemini успешно! Найдено моделей: ${models.length}`,
        };
      } else {
        const errJson = await listRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${listRes.status}`;
        return {
          success: false,
          status: 'Ошибка ключа Google',
          error: `Google Gemini отклонил ключ: ${errMsg}`,
        };
      }
    }

    // Direct check for OpenAI-compatible providers
    const targetUrl = PROVIDER_ENDPOINTS[provider] || 'https://api.openai.com/v1/chat/completions';
    const testModel =
      provider === 'openai'
        ? 'gpt-4o-mini'
        : provider === 'groq'
        ? 'llama-3.3-70b-versatile'
        : provider === 'deepseek'
        ? 'deepseek-chat'
        : provider === 'mistral'
        ? 'mistral-small-latest'
        : provider === 'openrouter'
        ? 'openrouter/auto'
        : 'default';

    const testRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify({
        model: testModel,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (testRes.ok) {
      const presetProvider = PROVIDERS_LIST.find((p) => p.id === provider);
      const defaultModels = presetProvider?.defaultModels.map((m) => ({ id: m.id, name: m.name })) || [];

      return {
        success: true,
        models: defaultModels,
        status: `Ключ ${PROVIDER_NAMES[provider] || provider} подтвержден и готов к работе!`,
      };
    } else {
      const errJson = await testRes.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `HTTP ${testRes.status}`;
      return {
        success: false,
        status: 'Ошибка проверки ключа',
        error: errMsg,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      status: 'Ошибка подключения к провайдеру',
      error: err?.message || 'Не удалось выполнить запрос к серверу ИИ',
    };
  }
}

/**
 * Discovers models from local Ollama or LM Studio port.
 */
export async function discoverLocalPort(config: LocalPortConfig): Promise<{
  success: boolean;
  models?: DiscoveredModel[];
  status: string;
  error?: string;
}> {
  const host = config.host || '127.0.0.1';
  const port = config.port || 11434;
  const cleanHost = host.trim().replace(/^https?:\/\//, '');

  try {
    // 1. Try Ollama
    const ollamaRes = await fetch(`http://${cleanHost}:${port}/api/tags`, {
      signal: AbortSignal.timeout(4000),
    });

    if (ollamaRes.ok) {
      const data: any = await ollamaRes.json();
      const models = (data.models || []).map((m: any) => ({
        id: `local/${m.name || m.model}`,
        name: m.name || m.model,
      }));
      return {
        success: true,
        models,
        status: `Ollama подключена: найдено ${models.length} моделей`,
      };
    }
  } catch (e) {
    // try LM studio
  }

  try {
    // 2. Try LM Studio / OpenAI-compatible
    const lmRes = await fetch(`http://${cleanHost}:${port}/v1/models`, {
      signal: AbortSignal.timeout(4000),
    });

    if (lmRes.ok) {
      const data: any = await lmRes.json();
      const models = (data.data || []).map((m: any) => ({
        id: `local/${m.id || m.name}`,
        name: m.id || m.name,
      }));
      return {
        success: true,
        models,
        status: `Локальный сервер подключен: найдено ${models.length} моделей`,
      };
    }
  } catch (e) {
    // ignore
  }

  return {
    success: false,
    status: 'Сервер не обнаружен',
    error: `Порт ${port} на ${cleanHost} недоступен. Проверьте, запущен ли Ollama / LM Studio.`,
  };
}

/**
 * Tests mirror proxy latency and connectivity to bypass RU restrictions.
 */
export async function testMirrorLatency(customMirrorUrl?: string): Promise<{
  success: boolean;
  latencyMs?: number;
  status: string;
  error?: string;
}> {
  const start = Date.now();

  // If custom mirror URL specified, test it directly
  if (customMirrorUrl && customMirrorUrl.trim()) {
    try {
      const clean = customMirrorUrl.trim().replace(/\/+$/, '');
      const res = await fetch(`${clean}/v1beta/models`, {
        signal: AbortSignal.timeout(6000),
      });
      const latency = Date.now() - start;
      return {
        success: true,
        latencyMs: latency,
        status: `Пользовательское зеркало доступно! Пинг: ${latency} мс (HTTP ${res.status})`,
      };
    } catch (e: any) {
      return {
        success: false,
        status: 'Ошибка подключения к кастомному зеркалу',
        error: e?.message || 'Кастомный URL зеркала недоступен или блокирует CORS',
      };
    }
  }

  // Try server-side test endpoint
  try {
    const res = await fetch('/api/proxy/test-mirror', {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success ?? true,
        latencyMs: data.latencyMs ?? (Date.now() - start),
        status: data.status || `Облачное зеркало активно! Пинг: ${data.latencyMs || Date.now() - start} мс`,
        error: data.error,
      };
    }
  } catch (e) {
    // ignore
  }

  // Fallback direct check
  try {
    const directRes = await fetch('https://generativelanguage.googleapis.com', {
      mode: 'no-cors',
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    return {
      success: true,
      latencyMs: latency,
      status: `Прямое соединение активно (Пинг: ${latency} мс)`,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'Прямое соединение заблокировано в вашем регионе',
      error: 'Google API недоступен без зеркала/VPN. Рекомендуется включить «Встроенное зеркало».',
    };
  }
}
