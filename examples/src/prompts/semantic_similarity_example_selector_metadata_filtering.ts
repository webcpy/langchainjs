// 用于演示目的的临时内存中的向量存储
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";

const embeddings = new OpenAIEmbeddings();

const memoryVectorStore = new MemoryVectorStore(embeddings);

const examples = [
  {
    query: "healthy food",
    output: `lettuce`,
    food_type: "vegetable",
  },
  {
    query: "healthy food",
    output: `schnitzel`,
    food_type: "veal",
  },
  {
    query: "foo",
    output: `bar`,
    food_type: "baz",
  },
];

const exampleSelector = new SemanticSimilarityExampleSelector({
  vectorStore: memoryVectorStore,
  k: 2,
  // 仅嵌入每个示例的“query”键
  inputKeys: ["query"],
  // 过滤器类型将取决于您特定的向量存储
  // 查看您正在使用的特定向量存储的文档部分。
  filter: (doc: Document) => doc.metadata.food_type === "vegetable",
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
  suffix: "User question:\n{query}",
  inputVariables: ["query"],
});

const model = new ChatOpenAI({});

const chain = dynamicPrompt.pipe(model);

const result = await chain.invoke({
  query: "What is exactly one type of healthy food?",
});
console.log(result);
/*
  AIMessage {
    content: 'One type of healthy food is lettuce.',
    additional_kwargs: { function_call: undefined }
  }
*/
