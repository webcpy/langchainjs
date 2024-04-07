// 用于演示目的的临时内存中的向量存储
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";

const embeddings = new OpenAIEmbeddings();

const memoryVectorStore = new MemoryVectorStore(embeddings);

const examples = [
  {
    query: "healthy food",
    output: `galbi`,
  },
  {
    query: "healthy food",
    output: `schnitzel`,
  },
  {
    query: "foo",
    output: `bar`,
  },
];

const exampleSelector = new SemanticSimilarityExampleSelector({
  vectorStore: memoryVectorStore,
  k: 2,
  // 仅嵌入每个示例的“query”键
  inputKeys: ["query"],
});

for (const example of examples) {
  // 格式化并将示例添加到底层向量存储中
  await exampleSelector.addExample(example);
}

// 创建一个用于格式化示例的提示模板。

const examplePrompt = PromptTemplate.fromTemplate(`<example>
  <user_input>
    {query}
  </user_input>
  <output>
    {output}
  </output>
</example>`);

// 创建一个FewShotPromptTemplate，它将使用示例选择器。
const dynamicPrompt = new FewShotPromptTemplate({
  // 我们提供一个ExampleSelector而不是示例。
  exampleSelector,
  examplePrompt,
  prefix: `Answer the user's question, using the below examples as reference:`,
  suffix: "User question: {query}",
  inputVariables: ["query"],
});

const formattedValue = await dynamicPrompt.format({
  query: "What is a healthy food?",
});
console.log(formattedValue);

/*
Answer the user's question, using the below examples as reference:

<example>
  <user_input>
    healthy
  </user_input>
  <output>
    galbi
  </output>
</example>

<example>
  <user_input>
    healthy
  </user_input>
  <output>
    schnitzel
  </output>
</example>

User question: What is a healthy food?
*/

const model = new ChatOpenAI({});

const chain = dynamicPrompt.pipe(model);

const result = await chain.invoke({ query: "What is a healthy food?" });
console.log(result);
/*
  AIMessage {
    content: 'A healthy food can be galbi or schnitzel.',
    additional_kwargs: { function_call: undefined }
  }
*/
