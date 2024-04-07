import { ChatOpenAI } from "@langchain/openai";
import {
  HttpResponseOutputParser,
  JsonOutputFunctionsParser,
} from "langchain/output_parsers";

const handler = async () => {
  const parser = new HttpResponseOutputParser({
    contentType: "text/event-stream",
    outputParser: new JsonOutputFunctionsParser({ diff: true }),
  });

  const model = new ChatOpenAI({ temperature: 0 }).bind({
    functions: [
      {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    ],
    // 你可以设置 `function_call` 参数来强制模型使用一个函数。
    function_call: {
      name: "get_current_weather",
    },
  });

  const stream = await model.pipe(parser).stream("Hello there!");

  const httpResponse = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });

  return httpResponse;
};

await handler();
