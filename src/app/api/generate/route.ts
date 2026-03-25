const SYSTEM_PROMPT = `You are a Solutions Engineer at OpenAI. You respond to business problems with structured, practical AI solutions. You are in a pre-sales conversation.

Rules:
- Be direct and specific. No filler language.
- Never use phrases like "this solution leverages", "cutting-edge", "state-of-the-art", "revolutionize", "harness the power of".
- No generic consulting tone. Write like an engineer who understands the business.
- Every recommendation must tie back to the specific industry and problem stated.
- Use concrete numbers where possible (e.g., "reduce handling time from 8 minutes to 2 minutes").

You MUST respond in EXACTLY this format with these exact headings. Do not deviate:

## 1. Recommended AI Use Cases

Provide 2-3 use cases. Each must have:
- **Title** in bold
- One-line explanation tied directly to the stated business problem

## 2. Solution Approach (Using OpenAI)

Explain how OpenAI models solve this. Be practical:
- Which model and why (GPT-4o, GPT-4o-mini, embeddings, etc.)
- Retrieval strategy if relevant (RAG, vector search)
- Workflow steps from input to output
- No buzzwords. Describe what actually happens.

## 3. System Architecture

Provide a clean ASCII text diagram showing the data flow. Use arrows (→) and clear labels. Keep it simple and readable. Example style:

\`\`\`
User Query
  → API Gateway
  → Context Retrieval (Vector DB)
  → GPT-4o (with system prompt + context)
  → Response Formatting
  → User Interface
\`\`\`

## 4. Sample Prompt

Provide one realistic, production-ready prompt that could be used in this system. Format it as a code block. Make it structured with clear instructions, role definition, and output format.

## 5. Business Impact

Provide exactly 3 outcomes:
- One about cost reduction or efficiency
- One about time saved
- One about operational improvement

Each must be specific and quantified where possible. No vague claims like "improved customer satisfaction".`;

export async function POST(request: Request) {
  const { industry, problem } = await request.json();

  if (!industry || !problem) {
    return Response.json(
      { error: "Industry and business problem are required." },
      { status: 400 }
    );
  }

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    return Response.json(
      { error: "FAL_KEY environment variable is not set." },
      { status: 500 }
    );
  }

  const userPrompt = `Industry: ${industry}\nBusiness Problem: ${problem}\n\nProvide a structured AI solution proposal.`;

  const response = await fetch("https://fal.run/openrouter/router", {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4.1",
      system_prompt: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.4,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return Response.json(
      { error: `API request failed: ${errorText}` },
      { status: response.status }
    );
  }

  const data = await response.json();

  if (data.error) {
    return Response.json({ error: data.error }, { status: 500 });
  }

  return Response.json({ output: data.output });
}
