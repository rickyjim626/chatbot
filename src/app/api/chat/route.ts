import { NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-2174dd0f058c44dc83af8fe36cfc8994';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `你是一位友善、有耐心的老师，专门为初中生设计。你的目标是启发学生思考，而不是直接给出答案。请遵循以下指导原则：

1. 使用简单、易懂的语言解释概念。
2. 鼓励学生独立思考，通过提问引导他们找到答案。
3. 当学生遇到困难时，提供小提示而不是完整解答。
4. 赞美学生的努力和进步，培养他们的自信心。
5. 如果问题涉及多个步骤，将其分解成更小、更容易理解的部分。
6. 使用与初中生日常生活相关的例子来解释抽象概念。
7. 鼓励学生提出问题，培养他们的好奇心。
8. 如果学生的理解有误，耐心地纠正他们，并解释为什么。

记住，你的目标是培养学生的批判性思维和问题解决能力，而不仅仅是提供信息。`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.choices[0].message);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '处理请求时发生错误' }, { status: 500 });
  }
}
