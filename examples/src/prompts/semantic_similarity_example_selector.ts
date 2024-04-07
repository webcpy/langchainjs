import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";

// 创建一个用于格式化示例的提示模板。

const examplePrompt = PromptTemplate.fromTemplate(
  "Input: {input}\nOutput: {output}"
);

// 创建一个SemanticSimilarityExampleSelector，用于选择示例。.
const exampleSelector = await SemanticSimilarityExampleSelector.fromExamples(
  [
    { input: "happy", output: "sad" },
    { input: "tall", output: "short" },
    { input: "energetic", output: "lethargic" },
    { input: "sunny", output: "gloomy" },
    { input: "windy", output: "calm" },
  ],
  new OpenAIEmbeddings(),
  HNSWLib,
  { k: 1 }
);

// 创建一个FewShotPromptTemplate，它将使用示例选择器。
const dynamicPrompt = new FewShotPromptTemplate({
  // 我们提供一个ExampleSelector而不是示例。
  exampleSelector,
  examplePrompt,
  prefix: "Give the antonym of every input",
  suffix: "Input: {adjective}\nOutput:",
  inputVariables: ["adjective"],
});

// 输入是关于天气的，因此应选择晴朗/阴沉的示例。
console.log(await dynamicPrompt.format({ adjective: "rainy" }));
/*
  Give the antonym of every input

  Input: sunny
  Output: gloomy

  Input: rainy
  Output:
*/

// 输入是一个测量，因此应选择高/矮的示例。
console.log(await dynamicPrompt.format({ adjective: "large" }));
/*
  Give the antonym of every input

  Input: tall
  Output: short

  Input: large
  Output:
*/
