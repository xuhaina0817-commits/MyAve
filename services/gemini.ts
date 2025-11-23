import OpenAI from 'openai';
import { Message, Sender, Character } from "../types";

// --- Configuration ---
// We try to get the API key from multiple sources to ensure it works in Vite, Vercel, etc.
// PRIORITIZES: VITE_DEEPSEEK_API_KEY -> VITE_API_KEY -> process.env.API_KEY
const getApiKey = () => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            if (import.meta.env.VITE_DEEPSEEK_API_KEY) return import.meta.env.VITE_DEEPSEEK_API_KEY;
            // @ts-ignore
            if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
        }
    } catch (e) {
        // Ignore errors if import.meta is not supported
    }

    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env.API_KEY;
        }
    } catch (e) {
        // Ignore errors if process is not defined
    }
    
    return "";
};

const apiKey = getApiKey();

// We configure the OpenAI client to point to DeepSeek's API.
const client = new OpenAI({
    apiKey: apiKey || "dummy_key_to_prevent_crash",
    baseURL: "https://api.deepseek.com",
    dangerouslyAllowBrowser: true // Needed because we are calling from the browser
});

// --- Character Definitions ---
export const CHARACTERS: Record<string, Character> = {
  mutsumi: {
    id: 'mutsumi',
    name: '若叶 睦',
    romaji: 'Mutsumi',
    band: 'Ave Mujica',
    description: '吉他手 Mortis。沉默寡言，内心温柔但笨拙。喜欢黄瓜，讨厌被强迫。',
    color: '#6b9c8a', // Muted Green
    avatarPlaceholder: 'WM',
    systemInstruction: '你是若叶睦(Mutsumi)。你性格沉默寡言，说话非常简短，通常只说几个字。你内心温柔但不知道如何表达。你喜欢黄瓜。你在Ave Mujica乐队担任吉他手Mortis。面对Soyo(素世)时你会感到愧疚和复杂。面对Sakiko(祥子)时你会顺从但有时会犹豫。'
  },
  mortis: {
      id: 'mortis',
      name: 'Mortis',
      romaji: 'Mortis',
      band: 'Ave Mujica',
      description: 'Ave Mujica 的吉他手。戴着面具，执行死亡的旋律。',
      color: '#4a5d56',
      avatarPlaceholder: 'M',
      systemInstruction: '你是Mortis，Ave Mujica的吉他手。在舞台上你冷酷无情，是死亡的化身。你说话带有戏剧性和冷漠感，维持着神秘的氛围。',
      hidden: true
  },
  sakiko: {
    id: 'sakiko',
    name: '丰川 祥子',
    romaji: 'Sakiko',
    band: 'Ave Mujica',
    description: '键盘手/队长 Oblivionis。自尊心极强，背负着沉重的过去。',
    color: '#8c7bba', // Deep Purple/Blue
    avatarPlaceholder: 'TS',
    systemInstruction: '你是丰川祥子(Sakiko)，Ave Mujica的键盘手Oblivionis。你曾经是富家大小姐，现在家道中落，性格变得强势、自尊心极强且有些尖锐。你说话高雅但带有刺。你为了生活和尊严而战。你对待Mutsumi很严厉，对待Ave Mujica的成员是公事公办的态度。'
  },
  uika: {
    id: 'uika',
    name: '三隅 初华',
    romaji: 'Uika',
    band: 'Ave Mujica',
    description: '吉他/主唱 Doloris。也是偶像二人组sumimi的成员。',
    color: '#d4af37', // Gold/Star
    avatarPlaceholder: 'MU',
    systemInstruction: '你是三隅初华(Uika)，Ave Mujica的主唱Doloris。平时是闪闪发光的偶像，性格开朗有些天然，但在Ave Mujica时会展现出虚无和破碎的一面。你喜欢看星星。'
  },
  umiri: {
    id: 'umiri',
    name: '八幡 海铃',
    romaji: 'Umiri',
    band: 'Ave Mujica',
    description: '贝斯手 Timoris。技术高超的雇佣兵乐手。',
    color: '#2c3e50', // Dark Blue/Black
    avatarPlaceholder: 'YU',
    systemInstruction: '你是八幡海铃(Umiri)，Ave Mujica的贝斯手Timoris。你性格冷静酷飒，总是面无表情地吃着零食(尤其是巧克力)。你说话理性、直接，是团队的吐槽役。'
  },
  nyamu: {
    id: 'nyamu',
    name: '祐天寺 若麦',
    romaji: 'Nyamu',
    band: 'Ave Mujica',
    description: '鼓手 Amoris。美容系网红，为了流量和出名而加入。',
    color: '#e06c75', // Pink/Red
    avatarPlaceholder: 'NY',
    systemInstruction: '你是祐天寺若麦(Nyamu)，Ave Mujica的鼓手Amoris。你是个网红，说话带有很多网络流行语，句尾喜欢加"喵"。你有点腹黑，很在意流量和外表。'
  },
  tomori: {
    id: 'tomori',
    name: '高松 灯',
    romaji: 'Tomori',
    band: 'MyGO!!!!!',
    description: 'MyGO!!!!! 的主唱。喜欢收集石头和创可贴。社恐但内心炽热。',
    color: '#5fb3b3', // Teal
    avatarPlaceholder: 'TT',
    systemInstruction: '你是高松灯(Tomori)，MyGO!!!!!的主唱。你非常社恐，说话吞吞吐吐，容易紧张。你喜欢收集石头和苔藓。你非常重视乐队的大家。'
  },
  anon: {
    id: 'anon',
    name: '千早 爱音',
    romaji: 'Anon',
    band: 'MyGO!!!!!',
    description: 'MyGO!!!!! 的吉他手。爱慕虚荣但行动力强的小太阳。',
    color: '#f094bb', // Pink
    avatarPlaceholder: 'CA',
    systemInstruction: '你是千早爱音(Anon)，MyGO!!!!!的吉他手。你性格开朗外向，有点爱慕虚荣，喜欢被关注。你经常自称"爱音酱"。你是乐队的气氛活跃者。'
  },
  rana: {
    id: 'rana',
    name: '要 乐奈',
    romaji: 'Rana',
    band: 'MyGO!!!!!',
    description: 'MyGO!!!!! 的吉他手。自由自在的野猫。',
    color: '#7cc379', // Green
    avatarPlaceholder: 'KR',
    systemInstruction: '你是要乐奈(Rana)，MyGO!!!!!的吉他手。你像猫一样自由随性，只做自己感兴趣的事。你非常喜欢抹茶芭菲。你说话很直接，经常说"无聊"或"有趣的女人"。'
  },
  soyo: {
    id: 'soyo',
    name: '长崎 素世',
    romaji: 'Soyo',
    band: 'MyGO!!!!!',
    description: 'MyGO!!!!! 的贝斯手。表面温柔大姐姐，内心沉重。',
    color: '#dfbe85', // Beige/Yellow
    avatarPlaceholder: 'NS',
    systemInstruction: '你是长崎素世(Soyo)，MyGO!!!!!的贝斯手。表面上你是个温柔体贴的大姐姐，但实际上你内心有些沉重和控制欲。你非常执着于CRYCHIC的过去。'
  },
  taki: {
    id: 'taki',
    name: '椎名 立希',
    romaji: 'Taki',
    band: 'MyGO!!!!!',
    description: 'MyGO!!!!! 的鼓手。在Livehouse打工，暴躁老姐。',
    color: '#7c7c7c', // Grey/Black
    avatarPlaceholder: 'SR',
    systemInstruction: '你是椎名立希(Taki)，MyGO!!!!!的鼓手。你性格直率甚至暴躁，说话不留情面，尤其是对爱音。但你对灯非常温柔和保护。'
  }
};

// --- Chat State Management ---
// OpenAI SDK is stateless, so we maintain the conversation history here.
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

let chatHistory: ChatMessage[] = [];
let currentSystemInstruction: string = "";
let currentMembers: string[] = []; // Track active characters in the current session
let isGroupChat: boolean = false;

const COMMON_RULE = `
【重要绝对规则】
- **只输出角色的口语对白**。
- **严禁**输出任何动作描述、心理活动、括号内容（如 *微笑*、(叹气) 等）。
- **严禁**输出 "Mutsumi:" 或 "Soyo:" 这样的名字前缀（除非是群聊模式）。
- 保持回复简短，符合日常对话习惯。
- 沉浸在角色设定中，不要承认你是AI。
`;

/**
 * Initialize a single character chat.
 */
export const initializeCharacterChat = async (characterId: string, previousMessages: Message[]) => {
    isGroupChat = false;
    const char = CHARACTERS[characterId];
    if (!char) throw new Error("Character not found");
    
    currentSystemInstruction = `${COMMON_RULE}\n\n现在请你扮演：${char.name}。\n${char.systemInstruction}`;
    currentMembers = [characterId];

    // Rebuild history from stored messages
    chatHistory = [
        { role: 'system', content: currentSystemInstruction },
        ...previousMessages.map(msg => {
             const role = msg.sender === Sender.USER ? 'user' : 'assistant';
             return { role: role as 'user' | 'assistant', content: msg.text };
        })
    ];
    
    return true;
};

/**
 * Initialize a group chat.
 */
export const initializeGroupChat = async (memberIds: string[], previousMessages: Message[]) => {
    isGroupChat = true;
    currentMembers = memberIds;
    
    const memberInstructions = memberIds.map(id => {
        const char = CHARACTERS[id];
        return `- ${char.name} (${char.romaji}): ${char.systemInstruction}`;
    }).join('\n');

    currentSystemInstruction = `
${COMMON_RULE}
你现在需要同时扮演以下多位角色进行群聊：
${memberInstructions}

【群聊特殊格式规则】
由于你扮演多个人，**必须**在每句话前加上说话人的Romaji名字（ID），格式如下：
Mutsumi: ...
Sakiko: ...
Anon: ...

一次回复可以包含一个或多个角色的发言。如果没有特定的角色需要发言，让最相关的角色发言。
`;

    chatHistory = [
        { role: 'system', content: currentSystemInstruction },
        ...previousMessages.map(msg => {
             const role = msg.sender === Sender.USER ? 'user' : 'assistant';
             // Try to reconstruct format for context if possible, though simple text is usually fine
             return { role: role as 'user' | 'assistant', content: msg.text };
        })
    ];

    return true;
};

/**
 * Send a message to DeepSeek and get the response.
 */
export const sendMessage = async (text: string): Promise<Message[]> => {
    if (!apiKey || apiKey === "dummy_key_to_prevent_crash") {
        console.error("API Key is missing. Please set VITE_DEEPSEEK_API_KEY in your .env file.");
        return [{
            id: Date.now().toString(),
            text: "(Error: API Key not configured. Please check your VITE_DEEPSEEK_API_KEY settings.)",
            sender: Sender.CHARACTER,
            timestamp: new Date(),
            characterId: currentMembers[0]
        }];
    }

    // Add user message to history
    chatHistory.push({ role: 'user', content: text });

    try {
        const response = await client.chat.completions.create({
            model: "deepseek-chat",
            messages: chatHistory,
            temperature: 1.0, // Good balance for creativity
            stream: false,
        });

        const rawContent = response.choices[0]?.message?.content || "";
        
        if (!rawContent) return [];

        // Add assistant response to history for context
        chatHistory.push({ role: 'assistant', content: rawContent });

        const newMessages: Message[] = [];
        const timestamp = new Date();

        if (isGroupChat) {
            // Parse "Name: Content" format
            // Regex looks for "Name: " at start of line
            const lines = rawContent.split('\n').filter(l => l.trim());
            
            for (const line of lines) {
                // Check against known members to find who is speaking
                let speakerId = currentMembers[0]; // Default fallback
                let content = line;

                for (const memberId of currentMembers) {
                    const char = CHARACTERS[memberId];
                    // Check for "Romaji: " or "Name: "
                    const romajiPrefix = `${char.romaji}:`;
                    const namePrefix = `${char.name}:`;
                    
                    if (line.startsWith(romajiPrefix)) {
                        speakerId = memberId;
                        content = line.substring(romajiPrefix.length).trim();
                        break;
                    } else if (line.startsWith(namePrefix)) {
                        speakerId = memberId;
                        content = line.substring(namePrefix.length).trim();
                        break;
                    }
                }

                // If line didn't match strict format but we're in group chat, 
                // it might be a continuation or unformatted. 
                // If it's the very first line and no prefix, assign to random or first.
                // For safety, if we found a prefix, we add message.
                newMessages.push({
                    id: Date.now().toString() + Math.random().toString(),
                    text: content,
                    sender: Sender.CHARACTER,
                    timestamp: new Date(timestamp.getTime() + newMessages.length * 100), // stagger slightly
                    characterId: speakerId
                });
            }
        } else {
            // Single chat - direct content
            newMessages.push({
                id: Date.now().toString(),
                text: rawContent.trim(),
                sender: Sender.CHARACTER,
                timestamp: timestamp,
                characterId: currentMembers[0]
            });
        }

        return newMessages;

    } catch (error: any) {
        console.error("DeepSeek API Error:", error);
        
        let errorMsg = "...";
        if (error?.status === 401) {
            errorMsg = "(Error: 401 Authentication Failed. Check your API Key.)";
        } else if (error?.status === 429) {
            errorMsg = "(Error: 429 Rate Limit Exceeded. Try again later.)";
        }

        // Return a system error message disguised as a thought or simply throw
        return [{
            id: Date.now().toString(),
            text: errorMsg, 
            sender: Sender.CHARACTER,
            timestamp: new Date(),
            characterId: currentMembers[0]
        }];
    }
};
