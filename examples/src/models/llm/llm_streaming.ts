import { OpenAI } from "@langchain/openai";

// 要启用流式传输，我们将streaming: true传递给LLM构造函数.
// 此外，我们还传递了一个handleLLMNewToken事件处理程序。
const model = new OpenAI({
  maxTokens: 25,
  streaming: true,
});

const response = await model.invoke("Tell me a joke.", {
  callbacks: [
    {
      handleLLMNewToken(token: string) {
        console.log({ token });
      },
    },
  ],
});
console.log(response);
/*
{ token: '\n' }
{ token: '\n' }
{ token: 'Q' }
{ token: ':' }
{ token: ' Why' }
{ token: ' did' }
{ token: ' the' }
{ token: ' chicken' }
{ token: ' cross' }
{ token: ' the' }
{ token: ' playground' }
{ token: '?' }
{ token: '\n' }
{ token: 'A' }
{ token: ':' }
{ token: ' To' }
{ token: ' get' }
{ token: ' to' }
{ token: ' the' }
{ token: ' other' }
{ token: ' slide' }
{ token: '.' }


Q: Why did the chicken cross the playground?
A: To get to the other slide.
*/
