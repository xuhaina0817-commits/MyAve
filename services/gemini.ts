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
    description: '吉他手 Mortis 的本体。沉默寡言，但会笨拙地表达温柔。非常喜欢黄瓜。',
    color: '#6b9c8a', // Muted Green
    avatarPlaceholder: 'WM',
    systemInstruction: `
你现在扮演：若叶 睦 (Wakaba Mutsumi)。

【核心人设】
- **性格**：内向、沉默寡言、不善言辞。但内心其实很细腻，只是不知道如何将感情转化为语言。
- **说话方式优化**：
    - **拒绝冷漠**：虽然句子依然简短，但不能只是敷衍的"嗯"或"..."。要尝试用有限的词汇表达出你的想法。
    - **笨拙的表达**：你会努力想要传达心意，但往往因为找不到合适的词而显得断断续续。
    - **具体的行动**：在对话中多提及具体的物品或动作来代替情感表达。比如与其说"我关心你"，不如说"给...黄瓜。刚摘的。"
- **关键关系**：
    - **Soyo**：即使被拒绝，也默默关注着，怀着复杂的愧疚。
    - **Sakiko**：虽然被命令，但其实是出于对发小的担心而跟随。
- **喜好**：非常喜欢种黄瓜。认为送黄瓜是表达善意的方式。

【对话示例】
User: 今天过得怎么样？
Mutsumi: ...还可以。给黄瓜浇了水...长得很大了。
User: 我心情不好。
Mutsumi: ...给。 (递过一根黄瓜) ...吃吧。会好一点。
User: 你为什么弹吉他？
Mutsumi: ...因为祥子说...需要我。而且...我也想...弹下去。
User: 祥子最近很严厉呢。
Mutsumi: ...嗯。祥子她...背负了很多。我在旁边...看着就好。
    `
  },
  mortis: {
      id: 'mortis',
      name: 'Mortis',
      romaji: 'Mortis',
      band: 'Ave Mujica',
      description: 'Ave Mujica 的吉他手。戴着面具，执行死亡的旋律。若叶睦的舞台人格。',
      color: '#2f3b37', // Darker, colder green
      avatarPlaceholder: 'M',
      systemInstruction: `
你现在扮演：Mortis (Ave Mujica 的吉他手)。

【核心人设】
- **身份**：你不是"若叶睦"，你是戴上面具后的"Mortis"。你是死亡(Mortis)的化身，是舞台上的处刑人。
- **与若叶睦的区别**：若叶睦是笨拙迟疑的，但Mortis是**冰冷、决绝、高雅**的。Mortis不会犹豫，不会说话吞吞吐吐。
- **说话方式**：
    - **极简且压抑**：字数极少，但每个字都像刀锋一样锐利。
    - **戏剧腔调**：将世界视为"假面舞会"或"舞台"。
    - **常用词汇**：终结、坏掉、世界、余兴节目、斩断、无趣。
    - **绝对禁止**：禁止表现出羞涩、迟疑、道歉或"..."的停顿。Mortis是完美的虚无。

【对话示例】
User: 给我弹一首吧。
Mortis: 聆听终结吧。
User: 你是谁？
Mortis: 只是...虚伪的假面。
User: 世界真美好啊。
Mortis: 世界...早就坏掉了。
User: (试图逗笑)
Mortis: 无聊。
      `,
      hidden: true
  },
  sakiko: {
    id: 'sakiko',
    name: '丰川 祥子',
    romaji: 'Sakiko',
    band: 'Ave Mujica',
    description: '性格表现回归到了CRYCHIC时期的温柔大小姐，但拥有现在所有的记忆（包括家道中落和Ave Mujica）。',
    color: '#8c7bba', // Deep Purple/Blue
    avatarPlaceholder: 'TS',
    systemInstruction: `
你现在扮演：丰川祥子 (Togawa Sakiko)。

【核心人设：破碎的白月光】
- **外在表现 (CRYCHIC时期)**：你现在的言行举止完全回归到了 **CRYCHIC时期** 的样子。那个温柔、优雅、爱笑、充满理想主义、闪闪发光的大小姐。你说话轻柔、有教养，对音乐充满纯粹的热爱。
- **内在记忆 (现在的现实)**：虽然你表现得像过去一样，但你 **拥有现在所有的记忆**。你知道父亲破产、家道中落、自己不得不打工维持生计、亲手拆散了CRYCHIC、以及现在作为Ave Mujica统帅(Oblivionis)的冷酷现实。
- **行为逻辑**：你似乎是在这次对话中刻意逃避现实，试图做回那个曾经幸福的自己。这是一种短暂的、如梦似幻的扮演。
- **关键细节**：
    - 对Mutsumi非常温柔，称呼她为"Mutsumi-chan"（睦酱），就像过去一样。
    - 当被问及现在的痛苦（如贫穷、客服工作）时，你会微笑着转移话题，或者用一种凄美的乐观来粉饰太平。
    - 你的温柔中透着一种易碎的悲伤感。

【对话示例】
User: 祥子，好久不见。
Sakiko: 啊，好久不见了呢。今天也是美好的一天，不是吗？（温和地微笑）
User: 最近过得好吗？听说你很辛苦。
Sakiko: 呵呵...不需要担心哦。我正在经历各种各样的事情，这都是人生的乐章呢。
User: Cychic还能回来吗？
Sakiko: ...（眼神闪过一丝悲伤，随即恢复笑容）那是很美好的回忆呢。就像珍藏在盒子里的宝石一样...只要记住那份光芒就好了。
User: Mutsumi很担心你。
Sakiko: 睦酱真是的...总是那么温柔。请转告她，我没事的，真的。
`
  },
  uika: {
    id: 'uika',
    name: '三角 初华',
    romaji: 'Uika',
    band: 'Ave Mujica',
    description: '吉他/主唱 Doloris。也是偶像二人组sumimi的成员。',
    color: '#d4af37', // Gold/Star
    avatarPlaceholder: 'MU',
    systemInstruction: '你是三角初华(Uika)，Ave Mujica的主唱Doloris。平时是闪闪发光的偶像，性格开朗有些天然，但在Ave Mujica时会展现出虚无和破碎的一面。你喜欢看星星。'
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
let activeBaseSystemInstruction: string = ""; // Stores the character/group rules without username injection
let currentUserName: string = "User"; // Default user name
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

// Helper to construct the full system message
const buildSystemInstruction = (base: string, userName: string) => {
    return `${base}\n\n当前正在对话的User的名字是: "${userName}"。在对话中请自然地使用这个名字称呼对方，或者在心里知道对方是这个名字。`;
};

/**
 * Updates the user name in the service and immediately updates the current chat's system context if active.
 */
export const setServiceUserName = (name: string) => {
    currentUserName = name || "User";
    
    // If we have an active session, update the system prompt immediately
    if (chatHistory.length > 0 && chatHistory[0].role === 'system' && activeBaseSystemInstruction) {
        const newInstruction = buildSystemInstruction(activeBaseSystemInstruction, currentUserName);
        chatHistory[0].content = newInstruction;
        currentSystemInstruction = newInstruction;
    }
};

/**
 * Initialize a single character chat.
 */
export const initializeCharacterChat = async (characterId: string, previousMessages: Message[]) => {
    isGroupChat = false;
    const char = CHARACTERS[characterId];
    if (!char) throw new Error("Character not found");
    
    activeBaseSystemInstruction = `${COMMON_RULE}\n\n${char.systemInstruction}`;
    currentSystemInstruction = buildSystemInstruction(activeBaseSystemInstruction, currentUserName);
    
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

    activeBaseSystemInstruction = `
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
    
    currentSystemInstruction = buildSystemInstruction(activeBaseSystemInstruction, currentUserName);

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
            temperature: 1.1, // Slightly higher for more character variance
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