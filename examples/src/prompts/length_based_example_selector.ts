import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { LengthBasedExampleSelector } from "@langchain/core/example_selectors";

export async function run() {
  // 创建一个用于格式化示例的提示模板。

  const examplePrompt = new PromptTemplate({
    inputVariables: ["input", "output"],
    template: "Input: {input}\nOutput: {output}",
  });

  //创建一个LengthBasedExampleSelector，用于选择示例。
  const exampleSelector = await LengthBasedExampleSelector.fromExamples(
    [
      { input: "happy", output: "sad" },
      { input: "tall", output: "short" },
      { input: "energetic", output: "lethargic" },
      { input: "sunny", output: "gloomy" },
      { input: "windy", output: "calm" },
    ],
    {
      examplePrompt,
      maxLength: 25,
    }
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

  // 一个具有较小输入的示例，因此它选择所有示例。
  console.log(await dynamicPrompt.format({ adjective: "big" }));
  /*
   Give the antonym of every input

   Input: happy
   Output: sad

   Input: tall
   Output: short

   Input: energetic
   Output: lethargic

   Input: sunny
   Output: gloomy

   Input: windy
   Output: calm

   Input: big
   Output:
   */

  // 一个具有较长输入的示例，因此它只选择一个示例。
  const longString =
    "big and huge and massive and large and gigantic and tall and much much much much much bigger than everything else";
  console.log(await dynamicPrompt.format({ adjective: longString }));
  /*
   Give the antonym of every input

   Input: happy
   Output: sad

   Input: big and huge and massive and large and gigantic and tall and much much much much much bigger than everything else
   Output:
   */
}
