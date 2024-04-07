import { ChatOpenAI } from "@langchain/openai";

const chat = new ChatOpenAI({
  maxTokens: 25,
});

// 传入一个human message。还可以接受原始字符串，它会自动转换。
// 被推断为human message.
const stream = await chat.stream([["human", "Tell me a joke about bears."]]);

for await (const chunk of stream) {
  console.log(chunk);
}
/*
AIMessageChunk {
  content: '',
  additional_kwargs: {}
}
AIMessageChunk {
  content: 'Why',
  additional_kwargs: {}
}
AIMessageChunk {
  content: ' did',
  additional_kwargs: {}
}
AIMessageChunk {
  content: ' the',
  additional_kwargs: {}
}
AIMessageChunk {
  content: ' bear',
  additional_kwargs: {}
}
AIMessageChunk {
  content: ' bring',
  additional_kwargs: {}
}
AIMessageChunk {
  content: ' a',
  additional_kwargs: {}
}
...
*/
