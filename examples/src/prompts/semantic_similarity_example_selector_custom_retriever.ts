/* eslint-disable @typescript-eslint/no-non-null-assertion */

// 需要支持最大边际相关性搜索的向量存储
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";

const pinecone = new Pinecone();

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const pineconeVectorstore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  { pineconeIndex }
);

const pineconeMmrRetriever = pineconeVectorstore.asRetriever({
  searchType: "mmr",
  k: 2,
});

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
  vectorStoreRetriever: pineconeMmrRetriever,
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
    content: 'lettuce.',
    additional_kwargs: { function_call: undefined }
  }
*/
