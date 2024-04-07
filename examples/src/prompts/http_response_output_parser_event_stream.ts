import { ChatOpenAI } from "@langchain/openai";
import { HttpResponseOutputParser } from "langchain/output_parsers";

const handler = async () => {
  const parser = new HttpResponseOutputParser({
    contentType: "text/event-stream",
  });

  const model = new ChatOpenAI({ temperature: 0 });

  // 避免处理换行符，将值字符串化
  // 应在使用时使用JSON.parse()进行解析。
  const stream = await model.pipe(parser).stream("Hello there!");

  const httpResponse = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });

  return httpResponse;
};

await handler();
