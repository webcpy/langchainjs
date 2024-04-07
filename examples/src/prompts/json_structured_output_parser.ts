import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { HumanMessage } from "@langchain/core/messages";

// 实例化解析器：
const parser = new JsonOutputFunctionsParser();

// 定义函数架构：
const extractionFunctionSchema = {
  name: "extractor",
  description: "Extracts fields from the input.",
  parameters: {
    type: "object",
    properties: {
      tone: {
        type: "string",
        enum: ["positive", "negative"],
        description: "The overall tone of the input",
      },
      word_count: {
        type: "number",
        description: "The number of words in the input",
      },
      chat_response: {
        type: "string",
        description: "A response to the human's input",
      },
    },
    required: ["tone", "word_count", "chat_response"],
  },
};

// 实例化 ChatOpenAI 类：
const model = new ChatOpenAI({ modelName: "gpt-4" });

// 创建一个新的可运行对象，将函数绑定到模型，并将输出通过解析器进行处理
const runnable = model
  .bind({
    functions: [extractionFunctionSchema],
    function_call: { name: "extractor" },
  })
  .pipe(parser);

// 使用输入调用可运行实例
const result = await runnable.invoke([
  new HumanMessage("What a beautiful day!"),
]);

console.log({ result });

/**
{
  result: {
    tone: 'positive',
    word_count: 4,
    chat_response: "Indeed, it's a lovely day!"
  }
}
 */
