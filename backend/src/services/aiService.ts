import Groq from 'groq-sdk';
import { AppError } from '../utils/AppError.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const model = process.env.GROQ_CHAT_MODEL ?? 'llama-3.1-8b-instant';

type Message = { role: 'user' | 'assistant' | 'system'; content: string };

const BASE_SYSTEM =
  'Ты — вежливый помощник компании NeuralAI, которая внедряет AI-решения в бизнес. Отвечай кратко, по-русски. Предлагай оставить заявку или перейти в раздел контактов, если нужна консультация.';

export async function chatWithAI(
  messages: Message[],
  systemContext?: string
): Promise<string> {
  if (!GROQ_API_KEY?.trim()) {
    return 'Чат временно недоступен. Настройте GROQ_API_KEY на сервере для работы с ИИ. Вы можете оставить заявку в разделе «Контакты».';
  }
  const systemContent = systemContext
    ? `${BASE_SYSTEM}\n\nКонтекст: пользователь интересуется кейсом/услугой. ${systemContext} Отвечай в контексте этого кейса и предлагай оформить заказ этой услуги через форму ниже.`
    : BASE_SYSTEM;
  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemContent },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text ?? 'Не удалось получить ответ. Попробуйте ещё раз.';
  } catch (err) {
    console.error('Groq API error:', err);
    throw new AppError(
      (err as Error).message?.includes('rate')
        ? 'Слишком много запросов. Подождите минуту.'
        : 'Ошибка ИИ. Попробуйте позже.',
      503
    );
  }
}
