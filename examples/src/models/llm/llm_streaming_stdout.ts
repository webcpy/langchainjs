import { OpenAI } from "@langchain/openai";

// 要启用流式传输，我们将streaming: true传递给LLM构造函数.
// 此外，我们还传递了一个handleLLMNewToken事件处理程序。
const chat = new OpenAI({
  streaming: true,
  callbacks: [
    {
      handleLLMNewToken(token: string) {
        process.stdout.write(token);
      },
    },
  ],
});

await chat.call("Write me a song about sparkling water.");
/*
Verse 1
Crystal clear and made with care
Sparkling water on my lips, so refreshing in the air
Fizzy bubbles, light and sweet
My favorite beverage I can’t help but repeat

Chorus
A toast to sparkling water, I’m feeling so alive
Let’s take a sip, and let’s take a drive
A toast to sparkling water, it’s the best I’ve had in my life
It’s the best way to start off the night

Verse 2
It’s the perfect drink to quench my thirst
It’s the best way to stay hydrated, it’s the first
A few ice cubes, a splash of lime
It will make any day feel sublime
...
*/
