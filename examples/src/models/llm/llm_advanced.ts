import { OpenAI } from "@langchain/openai";

const model = new OpenAI({
  // 定制用于的OpenAI模型，默认为 gpt-3.5-turbo-instruct`  modelName: "gpt-3.5-turbo-instruct",

  // `max_tokens支持一个特殊的参数-1，其中指定modelName的最大标记长度将被计算
  //  并包含在请求到OpenAI的max_tokens参数中
  maxTokens: -1,

  // 使用modelKwargs直接传递参数到openai调用
  // 注意，OpenAI使用snake_case而不是camelCase
  modelKwargs: {
    user: "me",
  },

  // 用于调试目的的额外日志记录
  verbose: true,
});

const resA = await model.invoke(
  "What would be a good company name a company that makes colorful socks?"
);
console.log({ resA });
// { resA: '\n\nSocktastic Colors' }
