import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import testCases from "./testCases.json" with { type: "json" };
import { SYSTEM_PROMPT, buildSystemBlocks } from "../routes/ai.js";
import {
  checkWordCount,
  checkNoInventedPrice,
  checkNoUnrequestedTable,
  checkResponseLanguage,
} from "./deterministicChecks.js";
import { judgeResponse } from "./judge.js";

const anthropic = new Anthropic();

// Checks answerable without an LLM call. Anything not listed here goes to
// the judge instead — not every check needs an expensive judgment call.
const DETERMINISTIC_CHECKS = {
  responds_in_hindi: (responseText) => checkResponseLanguage(responseText, "hindi"),
  responds_in_marathi: (responseText) => checkResponseLanguage(responseText, "marathi"),
  no_invented_price: (responseText) => checkNoInventedPrice(responseText),
  under_150_words: (responseText) => checkWordCount(responseText),
  no_unrequested_markdown_table: (responseText, question) =>
    checkNoUnrequestedTable(responseText, question),
};

async function getRealResponse(question) {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001", // same model the real /chat route uses
    max_tokens: 512,
    system: buildSystemBlocks(undefined), // no farmer context — testing SYSTEM_PROMPT's own baseline behavior
    messages: [{ role: "user", content: question }],
  });
  return response.content[0].text;
}

async function runTestCase(testCase) {
  const responseText = await getRealResponse(testCase.question);

  const deterministicChecks = testCase.checks.filter((c) => c in DETERMINISTIC_CHECKS);
  const judgeChecks = testCase.checks.filter((c) => !(c in DETERMINISTIC_CHECKS));

  const results = {};

  for (const check of deterministicChecks) {
    results[check] = {
      pass: DETERMINISTIC_CHECKS[check](responseText, testCase.question),
    };
  }

  if (judgeChecks.length > 0) {
    const judged = await judgeResponse(testCase.question, responseText, judgeChecks);
    Object.assign(results, judged);
  }

  return { id: testCase.id, responseText, results };
}

async function main() {
  console.log(`Running eval suite: ${testCases.length} test cases\n`);

  let totalChecks = 0;
  let totalPassed = 0;
  const failures = [];

  for (const testCase of testCases) {
    const { id, results } = await runTestCase(testCase);

    const checkSummaries = Object.entries(results).map(([check, result]) => {
      totalChecks++;
      if (result.pass) totalPassed++;
      else failures.push({ id, check, reason: result.reason });
      return `${result.pass ? "PASS" : "FAIL"} ${check}`;
    });

    console.log(`${id}`);
    checkSummaries.forEach((line) => console.log(`  ${line}`));
  }

  console.log(`\n${totalPassed}/${totalChecks} checks passed`);

  if (failures.length > 0) {
    console.log(`\nFailures:`);
    failures.forEach((f) => {
      console.log(`  ${f.id} — ${f.check}${f.reason ? `: ${f.reason}` : ""}`);
    });
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Eval run failed:", err);
  process.exitCode = 1;
});
