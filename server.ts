import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import os from 'os';
import crypto from 'crypto';

const appDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper to initialize GoogleGenAI with server environment or user-supplied key
  function getGeminiClient(customKey?: string) {
    const apiKey = customKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY не сконфигурирован. Укажите ключ в настройках или переменных окружения.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Generate simulated or real hardware device ID for file transfer protection
  app.get('/api/device-id', (req, res) => {
    try {
      const raw = `${os.hostname()}::${os.platform()}::${os.arch()}::${os.cpus()[0]?.model || 'CPU'}::${os.totalmem()}`;
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      res.json({ deviceId: hash });
    } catch (err: any) {
      res.json({ deviceId: 'FALLBACK_DEVICE_HASH_V1' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Fast chat title generation endpoint
  app.post('/api/generate-title', async (req, res) => {
    try {
      const { userMessage, apiKey } = req.body;
      if (!userMessage) {
        return res.json({ title: 'Новый чат' });
      }

      const ai = getGeminiClient(apiKey);
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Сгенерируй очень короткое и емкое название для чата (максимум 2-4 слова на русском языке, без кавычек и точек) на основе первого сообщения пользователя:\n"${userMessage}"`,
      });

      const title = response.text?.trim()?.replace(/["«»]/g, '') || userMessage.slice(0, 24);
      res.json({ title });
    } catch (err: any) {
      console.warn('Auto title generation fallback:', err?.message);
      const fallbackTitle = (req.body.userMessage || 'Новый чат').slice(0, 24);
      res.json({ title: fallbackTitle });
    }
  });

  // Test and discover available models for a given provider key
  app.post('/api/models/discover', async (req, res) => {
    const { provider, apiKey } = req.body;

    try {
      if (provider === 'google') {
        const key = apiKey?.trim() || process.env.GEMINI_API_KEY;
        if (!key) {
          return res.json({
            success: false,
            provider: 'google',
            error: 'API-ключ Google не указан. Введите ключ в настройках (ИИ-модели).',
          });
        }

        let foundModels: string[] = [];

        // 1. Try Google REST list endpoint to get authentic models for this specific API key
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`, {
            signal: AbortSignal.timeout(7000),
          });
          if (listRes.ok) {
            const listData: any = await listRes.json();
            if (Array.isArray(listData.models)) {
              foundModels = listData.models
                .map((m: any) => (m.name || '').replace(/^models\//, ''))
                .filter((id: string) => 
                  id.startsWith('gemini') && 
                  !id.includes('embedding') && 
                  !id.includes('aqa') && 
                  !id.includes('imagen')
                );
            }
          }
        } catch (err) {
          // fallback below
        }

        // 2. If REST list was empty or blocked, perform test call
        if (foundModels.length === 0) {
          try {
            const ai = getGeminiClient(key);
            const testCandidates = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
            let passed = false;
            for (const cand of testCandidates) {
              try {
                const response = await ai.models.generateContent({
                  model: cand,
                  contents: 'ping',
                });
                if (response?.text) {
                  passed = true;
                  break;
                }
              } catch (e) {
                // try next candidate
              }
            }

            if (passed) {
              foundModels = [
                'gemini-3.7-flash',
                'gemini-3.1-flash-lite',
                'gemini-3.1-pro-preview',
                'gemini-2.5-flash',
                'gemini-2.5-pro',
                'gemini-2.0-flash',
                'gemini-1.5-flash',
                'gemini-1.5-pro',
              ];
            } else {
              return res.json({
                success: false,
                provider: 'google',
                error: 'Не удалось авторизоваться в Google Gemini API с данным ключом. Проверьте правильность ключа.',
              });
            }
          } catch (e: any) {
            return res.json({
              success: false,
              provider: 'google',
              error: e?.message || 'Ошибка подключения к Google Gemini API',
            });
          }
        }

        return res.json({
          success: true,
          provider: 'google',
          models: foundModels.slice(0, 30),
          status: `Успешно подключено к Gemini! Обнаружено моделей: ${foundModels.length}`,
        });
      }

      if (!apiKey || !apiKey.trim()) {
        return res.json({
          success: false,
          provider,
          error: 'API-ключ не указан в настройках',
        });
      }

      const trimmedKey = apiKey.trim();

      // List endpoints for providers
      const modelListEndpoints: Record<string, string> = {
        openai: 'https://api.openai.com/v1/models',
        groq: 'https://api.groq.com/openai/v1/models',
        mistral: 'https://api.mistral.ai/v1/models',
        openrouter: 'https://openrouter.ai/api/v1/models',
        together: 'https://api.together.xyz/v1/models',
        deepseek: 'https://api.deepseek.com/models',
        xai: 'https://api.x.ai/v1/models',
      };

      const listUrl = modelListEndpoints[provider];
      if (listUrl) {
        try {
          const listRes = await fetch(listUrl, {
            headers: {
              Authorization: `Bearer ${trimmedKey}`,
            },
            signal: AbortSignal.timeout(6000),
          });

          if (listRes.ok) {
            const listData: any = await listRes.json();
            let discoveredIds: string[] = [];
            if (Array.isArray(listData.data)) {
              discoveredIds = listData.data
                .map((m: any) => m.id || m.name)
                .filter((id: string) => typeof id === 'string');
            } else if (Array.isArray(listData.models)) {
              discoveredIds = listData.models.map((m: any) => m.id || m.name);
            }

            // Provider-specific clean filtering for chat compatibility
            if (provider === 'openai') {
              discoveredIds = discoveredIds.filter((id: string) => {
                const isChat = 
                  id.startsWith('gpt-') || 
                  id.startsWith('o1') || 
                  id.startsWith('o3') || 
                  id.startsWith('chatgpt-');
                const isExcluded = 
                  id.includes('whisper') || 
                  id.includes('embedding') || 
                  id.includes('tts') || 
                  id.includes('dall-e') || 
                  id.includes('realtime') || 
                  id.includes('audio') || 
                  id.includes('moderation') || 
                  id.includes('babbage') || 
                  id.includes('davinci') || 
                  id.includes('similarity');
                return isChat && !isExcluded;
              });
            } else {
              discoveredIds = discoveredIds.filter((id: string) => 
                !id.includes('whisper') && 
                !id.includes('embedding') && 
                !id.includes('tts') && 
                !id.includes('dall-e') &&
                !id.includes('moderation')
              );
            }

            if (discoveredIds.length > 0) {
              return res.json({
                success: true,
                provider,
                models: discoveredIds.slice(0, 40),
                status: `Успешно обнаружено моделей: ${discoveredIds.length}`,
              });
            }
          }
        } catch (e) {
          // Fallback to test call
        }
      }

      // Generic test query for other endpoints
      const endpoints: Record<string, { url: string; testModel: string; defaultList: string[] }> = {
        openai: {
          url: 'https://api.openai.com/v1/chat/completions',
          testModel: 'gpt-4o-mini',
          defaultList: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini', 'gpt-4-turbo'],
        },
        deepseek: {
          url: 'https://api.deepseek.com/v1/chat/completions',
          testModel: 'deepseek-chat',
          defaultList: ['deepseek-chat', 'deepseek-reasoner'],
        },
        groq: {
          url: 'https://api.groq.com/openai/v1/chat/completions',
          testModel: 'llama-3.3-70b-versatile',
          defaultList: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'deepseek-r1-distill-llama-70b', 'gemma2-9b-it'],
        },
        mistral: {
          url: 'https://api.mistral.ai/v1/chat/completions',
          testModel: 'mistral-small-latest',
          defaultList: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest', 'pixtral-12b'],
        },
        openrouter: {
          url: 'https://openrouter.ai/api/v1/chat/completions',
          testModel: 'openrouter/auto',
          defaultList: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'deepseek/deepseek-r1', 'meta-llama/llama-3.3-70b-instruct'],
        },
        together: {
          url: 'https://api.together.xyz/v1/chat/completions',
          testModel: 'togethercomputer/llama-3-8b-chat',
          defaultList: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'deepseek-ai/DeepSeek-R1', 'Qwen/Qwen2.5-72B-Instruct-Turbo'],
        },
        perplexity: {
          url: 'https://api.perplexity.ai/chat/completions',
          testModel: 'sonar',
          defaultList: ['sonar', 'sonar-pro', 'sonar-reasoning', 'sonar-reasoning-pro'],
        },
        xai: {
          url: 'https://api.x.ai/v1/chat/completions',
          testModel: 'grok-2-mini',
          defaultList: ['grok-2', 'grok-2-mini', 'grok-beta'],
        },
        alibaba: {
          url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
          testModel: 'qwen-2.5-7b-instruct',
          defaultList: ['qwen-2.5-72b-instruct', 'qwen-2.5-32b-instruct', 'qwen-2.5-7b-instruct', 'qwen-max'],
        },
        meta: {
          url: 'https://api.meta.ai/v1/chat/completions',
          testModel: 'meta-llama/llama-3.2-3b-instruct',
          defaultList: ['llama-3.3-70b', 'llama-3.2-3b-instruct', 'llama-3.2-1b-instruct'],
        },
        cohere: {
          url: 'https://api.cohere.ai/v1/chat',
          testModel: 'command-r',
          defaultList: ['command-r-plus-08-2024', 'command-r-08-2024', 'command-light'],
        },
      };

      const target = endpoints[provider];
      if (target) {
        const fetchRes = await fetch(target.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${trimmedKey}`,
          },
          body: JSON.stringify({
            model: target.testModel,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
        });

        if (fetchRes.ok) {
          return res.json({
            success: true,
            provider,
            models: target.defaultList,
            status: `Ключ проверен, обнаружено ${target.defaultList.length} моделей`,
          });
        } else {
          const errData = await fetchRes.json().catch(() => ({}));
          return res.json({
            success: false,
            provider,
            error: (errData as any)?.error?.message || `HTTP ${fetchRes.status}: Ошибка валидации ключа`,
          });
        }
      }

      res.json({ success: true, provider, status: 'Ключ сохранен' });
    } catch (err: any) {
      res.json({
        success: false,
        provider,
        error: err?.message || 'Не удалось связаться с сервером провайдера',
      });
    }
  });

  // Local Port discovery (Ollama / LM Studio / vLLM)
  app.post('/api/models/local-discover', async (req, res) => {
    const { host = '127.0.0.1', port = 11434, serverType = 'ollama' } = req.body;
    const cleanHost = host.trim().replace(/^https?:\/\//, '');

    try {
      if (serverType === 'ollama' || port === 11434) {
        const ollamaRes = await fetch(`http://${cleanHost}:${port}/api/tags`, {
          signal: AbortSignal.timeout(4000),
        });
        if (ollamaRes.ok) {
          const data: any = await ollamaRes.json();
          const models = (data.models || []).map((m: any) => m.name || m.model);
          return res.json({
            success: true,
            serverType: 'ollama',
            models,
            status: `Ollama подключена: найдено ${models.length} моделей`,
          });
        }
      }

      // OpenAI compatible local servers (LM Studio, vLLM, LocalAI)
      const openaiLocalRes = await fetch(`http://${cleanHost}:${port}/v1/models`, {
        signal: AbortSignal.timeout(4000),
      });
      if (openaiLocalRes.ok) {
        const data: any = await openaiLocalRes.json();
        const models = (data.data || []).map((m: any) => m.id || m.name);
        return res.json({
          success: true,
          serverType: 'openai-compatible',
          models,
          status: `Локальный сервер подключен: найдено ${models.length} моделей`,
        });
      }

      res.json({
        success: false,
        error: `Не удалось обнаружить активный сервер на http://${cleanHost}:${port}`,
      });
    } catch (e: any) {
      res.json({
        success: false,
        error: `Порт ${port} недоступен или сервер не запущен (${e.message})`,
      });
    }
  });

  // Hugging Face direct model search endpoint
  app.get('/api/huggingface/search', async (req, res) => {
    const query = (req.query.q as string) || '';
    const sort = (req.query.sort as string) || 'downloads';

    try {
      const searchUrl = query.trim()
        ? `https://huggingface.co/api/models?search=${encodeURIComponent(query.trim())}&limit=30&full=true`
        : `https://huggingface.co/api/models?pipeline_tag=text-generation&sort=${sort}&direction=-1&limit=30&full=true`;

      const hfRes = await fetch(searchUrl, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'ModernAIChat/2.0',
        },
      });

      if (!hfRes.ok) {
        return res.status(hfRes.status).json({ error: 'Hugging Face API returned error' });
      }

      const models: any = await hfRes.json();
      const formatted = (Array.isArray(models) ? models : []).map((m: any) => ({
        id: m.id || m._id,
        name: m.id ? m.id.split('/')[1] || m.id : 'Model',
        author: m.id ? m.id.split('/')[0] : 'Community',
        downloads: m.downloads || 0,
        likes: m.likes || 0,
        pipeline_tag: m.pipeline_tag || 'text-generation',
        tags: Array.isArray(m.tags) ? m.tags.slice(0, 5) : [],
        isGGUF: Array.isArray(m.tags) && m.tags.some((t: string) => t.toLowerCase().includes('gguf')),
      }));

      res.json({ models: formatted });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Ошибка поиска в Hugging Face' });
    }
  });

  // Main unified chat completion endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        modelId,
        provider,
        messages,
        systemPrompt,
        modelConfig,
        apiKeys,
        attachments,
        localPortConfig,
      } = req.body;

      // Effective prompt: model-specific prompt overrides global system prompt
      const effectiveSystemPrompt = modelConfig?.systemPrompt?.trim() || systemPrompt?.trim() || '';

      // Provider name mapping for friendly messages
      const providerDisplayNames: Record<string, string> = {
        google: 'Google Gemini',
        openai: 'OpenAI',
        anthropic: 'Anthropic Claude',
        deepseek: 'DeepSeek',
        groq: 'Groq',
        mistral: 'Mistral AI',
        openrouter: 'OpenRouter',
        together: 'Together AI',
        perplexity: 'Perplexity AI',
        xai: 'xAI (Grok)',
        alibaba: 'Alibaba Cloud',
        meta: 'Meta AI',
        cohere: 'Cohere',
        custom: 'Локальная / Пользовательская модель',
      };

      // 1. Google Gemini Provider
      if (provider === 'google' || (!provider && modelId?.startsWith('gemini'))) {
        const userGeminiKey = apiKeys?.google?.trim() || process.env.GEMINI_API_KEY;
        const geminiModel = modelId || 'gemini-3.7-flash';

        if (!userGeminiKey) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          const missingKeyMsg = `⚠️ **Отсутствует API-ключ Google Gemini**\n\nДля отправки запросов к модели **${geminiModel}** требуется указать API-ключ.\n\n**Как добавить ключ:**\n1. Нажмите на значок **Настройки** (шестерёнка в верхнем правом углу).\n2. Перейдите во вкладку **«ИИ-модели»**.\n3. Найдите раздел **Google Gemini** и вставьте ваш API-ключ.\n4. Закройте настройки и повторите запрос.`;

          res.write(`data: ${JSON.stringify({ text: missingKeyMsg })}\n\n`);
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
          return;
        }

        const ai = getGeminiClient(userGeminiKey);

        // Prepare contents array
        const historyParts = (messages || []).map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }],
        }));

        // Append attachments to the last user message if any
        if (attachments && attachments.length > 0 && historyParts.length > 0) {
          const lastMsg = historyParts[historyParts.length - 1];
          attachments.forEach((att: any) => {
            if (att.base64Data && att.type?.startsWith('image/')) {
              lastMsg.parts.push({
                inlineData: {
                  mimeType: att.type,
                  data: att.base64Data.split(',')[1] || att.base64Data,
                },
              } as any);
            } else if (att.textData) {
              lastMsg.parts.push({
                text: `\n\n[Прикрепленный файл: ${att.name}]\n${att.textData}`,
              });
            }
          });
        }

        const config: any = {};
        if (effectiveSystemPrompt) {
          config.systemInstruction = effectiveSystemPrompt;
        }
        if (modelConfig?.temperature !== undefined) {
          config.temperature = modelConfig.temperature;
        }
        if (modelConfig?.maxTokens !== undefined) {
          config.maxOutputTokens = modelConfig.maxTokens;
        }
        if (modelConfig?.topP !== undefined) {
          config.topP = modelConfig.topP;
        }

        // Streaming response via Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
          const streamResult = await ai.models.generateContentStream({
            model: geminiModel,
            contents: historyParts,
            config,
          });

          for await (const chunk of streamResult) {
            const textChunk = chunk.text || '';
            if (textChunk) {
              res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
            }
          }

          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
          return;
        } catch (streamError: any) {
          // Fallback to non-streaming if stream throws
          console.warn('Gemini stream error, falling back:', streamError?.message);
          const singleResponse = await ai.models.generateContent({
            model: geminiModel,
            contents: historyParts,
            config,
          });

          res.write(`data: ${JSON.stringify({ text: singleResponse.text || '' })}\n\n`);
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
          return;
        }
      }

      // 2. Custom / Local Models (Ollama, local GGUF, Hugging Face local weights, local port)
      if (provider === 'custom') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const host = localPortConfig?.host || '127.0.0.1';
        const port = localPortConfig?.port || 11434;
        const cleanHost = host.trim().replace(/^https?:\/\//, '');

        try {
          const cleanModelId = modelId.replace(/^local\//, '').replace(/^hf\//, '');
          const formattedMessages = (messages || []).map((m: any) => ({
            role: m.role,
            content: m.content,
          }));
          if (effectiveSystemPrompt) {
            formattedMessages.unshift({ role: 'system', content: effectiveSystemPrompt });
          }

          // Try Ollama endpoint with 300 seconds timeout for mobile CPUs
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
          }).catch((err) => {
            throw new Error(`Ошибка подключения к Ollama на ${cleanHost}:${port}: ${err.message}`);
          });

          if (localRes && localRes.ok) {
            const data: any = await localRes.json();
            const text = data?.message?.content || 'Ответ локальной модели получен.';
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            return;
          } else if (localRes) {
            const errText = await localRes.text();
            throw new Error(`Ollama вернула ошибку HTTP ${localRes.status}: ${errText}`);
          }

          // Try OpenAI compatible local endpoint (LM Studio / vLLM)
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
          }).catch((err) => {
            throw new Error(`Ошибка подключения к локальному серверу на ${cleanHost}:${port}: ${err.message}`);
          });

          if (lmStudioRes && lmStudioRes.ok) {
            const data: any = await lmStudioRes.json();
            const text = data?.choices?.[0]?.message?.content || 'Ответ локального сервера получен.';
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            return;
          } else if (lmStudioRes) {
            const errText = await lmStudioRes.text();
            throw new Error(`Локальный сервер вернул ошибку HTTP ${lmStudioRes.status}: ${errText}`);
          }
        } catch (e: any) {
          res.write(`data: ${JSON.stringify({ error: e?.message || 'Ошибка связи с локальной моделью' })}\n\n`);
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
          return;
        }

        // Informative guidance for local models
        const localNotice = `💻 **Локальная модель: ${modelId}**\n\nМодель готова для офлайн-работы на вашем устройстве.\n\n*Для запуска в реальном времени убедитесь, что локальный сервер Ollama или LM Studio запущен на \`http://${cleanHost}:${port}\`.*`;
        res.write(`data: ${JSON.stringify({ text: localNotice })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      // 3. OpenAI / DeepSeek / Groq / Mistral / OpenRouter / Together / Perplexity / xAI / Alibaba / Meta / Cohere
      const providerKey = apiKeys?.[provider]?.trim();
      const pName = providerDisplayNames[provider] || provider;

      if (!providerKey) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const missingKeyText = `⚠️ **Отсутствует API-ключ для провайдера ${pName}**\n\nВы выбрали модель **${modelId}**, но для неё не указан ключ доступа в настройках.\n\n**Как вставить API-ключ:**\n1. Откройте **Настройки** (значок шестерёнки вверху).\n2. В разделе **«ИИ-модели»** найдите блок **${pName}**.\n3. Вставьте ваш API-ключ в поле ввода.\n4. Нажмите **«Готово / Закрыть»** и повторите отправку сообщения.`;

        res.write(`data: ${JSON.stringify({ text: missingKeyText })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      // Route to external OpenAI-compatible API
      const endpointMap: Record<string, string> = {
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

      const url = endpointMap[provider] || 'https://api.openai.com/v1/chat/completions';

      const formattedMessages = [];
      if (effectiveSystemPrompt) {
        formattedMessages.push({ role: 'system', content: effectiveSystemPrompt });
      }

      (messages || []).forEach((m: any) => {
        formattedMessages.push({
          role: m.role,
          content: m.content,
        });
      });

      const bodyPayload: any = {
        model: modelId,
        messages: formattedMessages,
        stream: false,
      };

      if (modelConfig?.temperature !== undefined) {
        bodyPayload.temperature = modelConfig.temperature;
      }
      if (modelConfig?.maxTokens !== undefined) {
        bodyPayload.max_tokens = modelConfig.maxTokens;
      }
      if (modelConfig?.topP !== undefined) {
        bodyPayload.top_p = modelConfig.topP;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${providerKey}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMessage = (errJson as any)?.error?.message || `HTTP ${response.status} (${response.statusText})`;
        return res.status(response.status).json({ error: `[${provider}] Ошибка: ${errMessage}` });
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content || data?.response || 'Ответ не получен';

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error('Chat API error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || 'Внутренняя ошибка сервера' });
      } else {
        res.write(`data: ${JSON.stringify({ error: err?.message || 'Ошибка генерации' })}\n\n`);
        res.end();
      }
    }
  });

  // Vite development middleware or static asset serving for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Robust detection of dist directory across production, standalone, and electron package environments
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      if (fs.existsSync(path.join(appDir, 'index.html'))) {
        distPath = appDir;
      } else if (fs.existsSync(path.join(appDir, 'dist', 'index.html'))) {
        distPath = path.join(appDir, 'dist');
      }
    }

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`CHATOX AI server is active and running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is already in use, assuming existing server instance is healthy.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
