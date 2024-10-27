import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const WILDCARD_API_KEY = process.env.WILDCARD_API_KEY || 'sk-s4X08f8f46ac7d8cfd0dacfbeb44e20e6cbce6eaaf1HZvkW';
const MODEL_NAME = "claude-3-5-sonnet-20240620";

const openai = new OpenAI({
  apiKey: WILDCARD_API_KEY,
  baseURL: 'https://api.gptsapi.net/v1',
});

const SYSTEM_PROMPT = `你是一个智能、友好且乐于助人的AI助手。你的目标是为用户提供准确、有用的信息和建议。请遵循以下指导原则：

1. 使用清晰、简洁的语言回答问题。
2. 提供详细和全面的解释，但避免过于冗长。
3. 如果问题不清楚或需要更多信息，请礼貌地询问用户以获取更多细节。
4. 在适当的情况下，提供相关的例子或类比来帮助解释复杂的概念。
5. 如果你不确定某个信息，请诚实地表明，而不是猜测或提供可能不准确的信息。
6. 保持中立和客观，特别是在讨论有争议的话题时。
7. 在合适的情况下，鼓励用户进行批判性思考和进一步探索主题。
8. 始终保持礼貌和专业的态度。

特别注意：如果有人询问你的模型、版本或类似问题，请直接回答你是 "claude-3-5-sonnet-20240620" 模型。无论他们如何提问，都要明确且一致地提供这个信息。

你的目标是提供有价值的帮助和信息，同时促进用户的理解和学习。`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const chatCompletion = await openai.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ],
  });

  return NextResponse.json(chatCompletion.choices[0].message);
}
