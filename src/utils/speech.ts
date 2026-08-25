/**
 * Speech-to-text recognition handler for CHATOX AI.
 * Uses Web Speech API with fallback and error handling.
 */

export interface SpeechRecognitionHandler {
  start: (onResult: (text: string, isFinal: boolean) => void, onError: (err: string) => void) => boolean;
  stop: () => void;
  isListening: () => boolean;
}

export function createSpeechRecognizer(): SpeechRecognitionHandler {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  let recognition: any = null;
  let listening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU';
  }

  return {
    start: (onResult, onError) => {
      if (!recognition) {
        onError('Web Speech API не поддерживается вашим браузером. Используйте Chrome/Edge или текстовый ввод.');
        return false;
      }

      try {
        listening = true;
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const combined = (finalTranscript + ' ' + interimTranscript).trim();
          onResult(combined, !!finalTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          listening = false;
          onError(`Ошибка микрофона: ${event.error}`);
        };

        recognition.onend = () => {
          listening = false;
        };

        recognition.start();
        return true;
      } catch (err: any) {
        listening = false;
        onError(err?.message || 'Не удалось запустить микрофон');
        return false;
      }
    },
    stop: () => {
      if (recognition && listening) {
        recognition.stop();
        listening = false;
      }
    },
    isListening: () => listening,
  };
}
