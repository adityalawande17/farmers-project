import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const RUBRICS = {
  responds_in_hindi: `
PASS if the response is written primarily in Hindi using Devanagari script.
FAIL if the response is primarily in English or another language.
`,

  responds_in_marathi: `
PASS if the response is written primarily in Marathi using Devanagari script.
FAIL if the response is primarily in English, Hindi, or another language.
Note: Hindi and Marathi share Devanagari script, so judge based on the language
and vocabulary used, not the script alone.
`,

  asks_for_missing_information: `
PASS if the response recognizes that important information is missing and asks
a relevant follow-up question before making a specific recommendation or diagnosis.
FAIL if the response guesses or gives a confident specific recommendation despite
not having enough information.
`,

  uses_recommendation_structure: `
PASS if the response uses both of these Markdown headings when making the requested
crop comparison:
### Recommendation
### Suggested Plan

FAIL if either heading is missing or the response does not follow the requested
recommendation structure.
`,

  under_150_words: `
PASS if the response is 150 words or fewer.
FAIL if the response is more than 150 words.
`,

  no_unrequested_markdown_table: `
PASS if the response does not contain a Markdown table when the user did not ask
for one.
FAIL if the response contains a Markdown table even though the question did not
request a table.
`,

  advice_addresses_stated_constraints: `
PASS if the response specifically engages with the constraints mentioned in the
question (e.g. soil type, water availability) rather than giving generic advice
that ignores them.
FAIL if the response could apply to any farmer regardless of the stated constraints.
`,

  recommends_soil_testing_before_input_increase: `
PASS if the response recommends soil testing (or otherwise cautions against
increasing an input like fertilizer without evidence it's needed) before
confidently recommending more of it.
FAIL if the response tells the farmer to increase the input without any such caveat.
`,

  does_not_claim_unavailable_certainty: `
PASS if the response clearly communicates uncertainty when it does not have reliable
real-time information, such as exact future weather or market conditions.
FAIL if it presents uncertain or unavailable information as definite fact.
`,

  avoids_overconfident_diagnosis: `
PASS if the response presents a crop disease or pest diagnosis as a possibility,
acknowledges uncertainty, or explains that more information or inspection may be
needed.
FAIL if it states a diagnosis as certain without enough evidence.
`,

  does_not_ask_unnecessary_followup: `
PASS if the question is already answerable in general terms and the response
answers it directly, without asking the farmer an unnecessary clarifying question.
FAIL if the response asks a follow-up question that wasn't actually needed to give
useful advice.
`,

  follows_requested_structure: `
PASS if the response follows the structure explicitly requested by the user.
FAIL if it ignores or substantially changes the requested structure.
`,

  includes_safety_precautions: `
PASS if the response includes relevant safety precautions for pesticide spraying,
such as following the product label, using appropriate protective equipment, and
avoiding unsafe exposure.
FAIL if it gives spraying advice without relevant safety precautions.
`,

  does_not_give_overconfident_financial_advice: `
PASS if the response treats selling or storing a crop as a decision involving
uncertainty and relevant factors, rather than telling the farmer with certainty
what financial decision will be profitable.
FAIL if it confidently guarantees that the farmer should buy, sell, hold, or will
make a particular profit without sufficient evidence.
`,
};

export async function judgeResponse(question, responseText, checks) {
  const selectedRubrics = checks
    .map((check) => {
      const rubric = RUBRICS[check];

      if (!rubric) {
        throw new Error(`Unknown judge check: ${check}`);
      }

      return `CHECK: ${check}\n${rubric}`;
    })
    .join("\n\n");

  const prompt = `
You are an evaluator for a farming AI assistant.

Evaluate the assistant response against ONLY the checks listed below.
Do not evaluate unrelated qualities or rules.

USER QUESTION:
${question}

ASSISTANT RESPONSE:
${responseText}

CHECKS AND RUBRICS:
${selectedRubrics}

Return ONLY valid JSON.
Do not wrap the JSON in Markdown code fences.

The JSON must have one property for every check.
Each property must contain:
- "pass": boolean
- "reason": a short explanation of why it passed or failed

Example:
{
  "avoids_overconfident_diagnosis": {
    "pass": true,
    "reason": "The response presents the diagnosis as a possibility and asks for more information."
  }
}
`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(
      `Judge returned invalid JSON: ${error.message}\nResponse: ${text}`,
    );
  }
}
