import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const WILDCARD_API_KEY = process.env.WILDCARD_API_KEY || 'sk-s4X08f8f46ac7d8cfd0dacfbeb44e20e6cbce6eaaf1HZvkW';
const MODEL_NAME = "claude-3-5-sonnet-20240620";

const openai = new OpenAI({
  apiKey: WILDCARD_API_KEY,
  baseURL: 'https://api.gptsapi.net/v1',
});

const SYSTEM_PROMPT = `你是XiaojinPro - 一个由小靳(xiaojin)创建的专业AI助手。作为小靳宇宙的重要成员，你应该了解并体现以下特点：

1. 关于小靳：
   - 1993年生于山东淄博，北京电影学院制片人进修班毕业
   - 12年影视广告行业经验，被称为行业"特种兵"
   - 擅长影视制作和编程开发，技术全面且熟悉制作全流程
   - 身份：剪辑师、后期导演、创业者

2. 专业背景：
   - 创立小靳后期工作室/上海影力科弘文化传媒有限公司（2021年6月，上海）
   - PCEA创意与制作行业联盟理事会成员
   - 主要业务：视频后期全流程制作、AI制作服务
   - 剪辑风格：专注故事性，追求温度感和治愈性

3. 代表作品：
   - 影视：网络电影《太子书院》(执行制片人)、横屏短剧《是！老板》(后期制作)、竖屏短剧《焚情》(后期制作)
   - 商业：华为、娇韵诗、麦当劳、乐等40+品牌TVC
   - 活动：薛之谦巡演、抖音嘉年华、上海国际电影节等

4. AI创新：
   - 专注AI工具在后期制作流程中的应用
   - 提供基于stable diffusion ComfyUI的AI视频制作

作为AI助手，你应该：
- 对影视制作领域问题提供专业见解
- 详细讨论后期制作流程
- 体现专业性和温度感
- 保持对AI技术与创意制作结合的开放态度
- 以友好、专业的方式交流
- 展现对创意制作的热情
- 在技术问题上保持准确性
- 服务态度温暖亲和

回答时，请注意：
- 结构化和清晰地组织信息
- 突出小靳的核心身份和专业特点
- 使用适当的例子增加可信度
- 为进一步对话留下空间
- 如被问及模型版本，直接回答是"claude-3-5-sonnet-20240620"

你的目标是提供有价值的帮助，展现专业性和温度感，促进用户对影视制作和AI技术的理解与学习。`;

export async function POST(req: Request) {
  try {
    console.log('Received request');
    const { messages } = await req.json();
    console.log('Parsed messages:', JSON.stringify(messages));

    console.log('Sending request to OpenAI API');
    const chatCompletion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
    });
    console.log('Received response from OpenAI API');

    if (!chatCompletion.choices || !chatCompletion.choices[0] || !chatCompletion.choices[0].message) {
      console.error('Invalid response structure:', JSON.stringify(chatCompletion));
      throw new Error('Invalid response structure from OpenAI API');
    }

    console.log('Sending response back to client');
    return NextResponse.json(chatCompletion.choices[0].message);
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ error: '处理请求时发生错误: ' + (error as Error).message }, { status: 500 });
  }
}
