export async function perplexitySearch(
  query: string,
  signal?: AbortSignal
): Promise<{ content: string; citations: string[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY not configured");

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content:
            "You are a market research analyst. Provide factual, current market intelligence with specific data points where available.",
        },
        { role: "user", content: query },
      ],
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Perplexity ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content as string,
    citations: (data.citations ?? []) as string[],
  };
}
