import OpenAI from 'openai';

export async function openai_get_reply(prompt: string, model: string, temperature: number, apiKey: string, baseUrl?: string): Promise<string|null> {
    // TODO: Does this do any setup? Would it be better to initialize this only once?
    const openaiOptions: any = {
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    };
    if (baseUrl && baseUrl.trim().length > 0) {
        openaiOptions.baseURL = baseUrl.trim();
    }
    const openai = new OpenAI(openaiOptions);

    const chatCompletion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: model,
          temperature: temperature
    });
    // TODO: Add method to activated debug output
    //console.log("LLMExtender result:", chatCompletion)
    return chatCompletion.choices[0].message.content;
}
