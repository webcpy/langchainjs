import { OpenAI } from "@langchain/openai";
import type { Serialized } from "@langchain/core/load/serializable";
import { LLMResult } from "@langchain/core/outputs";

// 我们可以将一系列 CallbackHandlers 传递给 LLM 构造函数，以获取各种事件的回调。
const model = new OpenAI({
  callbacks: [
    {
      handleLLMStart: async (llm: Serialized, prompts: string[]) => {
        console.log(JSON.stringify(llm, null, 2));
        console.log(JSON.stringify(prompts, null, 2));
      },
      handleLLMEnd: async (output: LLMResult) => {
        console.log(JSON.stringify(output, null, 2));
      },
      handleLLMError: async (err: Error) => {
        console.error(err);
      },
    },
  ],
});

await model.invoke(
  "What would be a good company name a company that makes colorful socks?"
);
// {
//     "name": "openai"
// }
// [
//     "What would be a good company name a company that makes colorful socks?"
// ]
// {
//   "generations": [
//     [
//         {
//             "text": "\n\nSocktastic Splashes.",
//             "generationInfo": {
//                 "finishReason": "stop",
//                 "logprobs": null
//             }
//         }
//     ]
//  ],
//   "llmOutput": {
//     "tokenUsage": {
//         "completionTokens": 9,
//          "promptTokens": 14,
//          "totalTokens": 23
//     }
//   }
// }
