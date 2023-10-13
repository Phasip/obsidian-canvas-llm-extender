import OpenAI from 'openai';

export async function openai_get_reply(prompt: string, model: string, temperature: number, apiKey: string): Promise<string|null> {
    // TODO: Does this do any setup? Would it be better to initialize this only once?
    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    const chatCompletion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: model,
          temperature: temperature
    });
    console.log("LLMExtender result:", chatCompletion)
    return chatCompletion.choices[0].message.content;
}