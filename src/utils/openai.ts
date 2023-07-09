const client = (key: string) => ({
  async transcribe(file: File) {
    const formData = new FormData();

    formData.append("model", "whisper-1");
    formData.append("file", file);

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",

      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${key}`,
        },
      }
    );
    return response.json();
  },

  async summarize(text: string) {
    const prompt = `Summarize the key points in this video transcript:
        
        ${text}
        `;

    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt,
        temperature: 1,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
    });
    return response.json();
  },
});

export default client;