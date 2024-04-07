# 几个示例提示模板

几个示例提示是一种提示技术，它向大型语言模型（LLM）提供一组示例，然后要求LLM根据提供的示例生成一些文本。

一个示例是以下内容：

假设您希望您的LLM以特定格式回复。您可以向LLM提供一组问题答案对的示例，以便它知道如何回复。

```txt
以以下格式回复用户的问题：

问题：你叫什么名字？
答案：我的名字是约翰。

问题：你多大了？
答案：我今年25岁。

问题：你最喜欢的颜色是什么？
答案：
```

这里我们将最后一个`答案：`未定义，以便LLM可以填写。然后LLM将生成以下内容：

```txt
答案：我没有最喜欢的颜色；我没有偏好。
```

### 使用案例

在以下示例中，我们将LLM用于将问题重新表述为更一般的查询。

我们提供了两组具体问题和重新表述的一般问题的示例。`FewShotChatMessagePromptTemplate`将使用我们的示例，当调用`.format`时，我们将看到这些示例格式化为一个字符串，我们可以传递给LLM。

```typescript
import {
  ChatPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from "langchain/prompts";
```

```typescript
const examples = [
  {
    input: "The Police的成员能够进行合法逮捕吗？",
    output: "The Police的成员能做什么？",
  },
  {
    input: "Jan Sindel出生在哪个国家？",
    output: "Jan Sindel的个人历史是什么？",
  },
];
const examplePrompt = ChatPromptTemplate.fromTemplate(`人类: {input}
AI: {output}`);
const fewShotPrompt = new FewShotChatMessagePromptTemplate({
  examplePrompt,
  examples,
  inputVariables: [], // 没有输入变量
});
```

```typescript
const formattedPrompt = await fewShotPrompt.format({});
console.log(formattedPrompt);
```

```typescript
[
  HumanMessage {
    lc_namespace: [ 'langchain', 'schema' ],
    content: '人类: The Police的成员能够进行合法逮捕吗？\n' +
      'AI: The Police的成员能做什么？',
    additional_kwargs: {}
  },
  HumanMessage {
    lc_namespace: [ 'langchain', 'schema' ],
    content: "人类: Jan Sindel出生在哪个国家？\n" +
      "AI: Jan Sindel的个人历史是什么？",
    additional_kwargs: {}
  }
]
```

然后，如果我们将其与另一个问题一起使用，LLM将按我们想要的方式重新表述问题。

从"@mdx\_components/integration\_install\_tooltip.mdx"导入IntegrationInstallTooltip;

<IntegrationInstallTooltip></IntegrationInstallTooltip>

```bash npm2yarn
npm install @langchain/openai
```

```typescript
import { ChatOpenAI } from "@langchain/openai";
```

```typescript
const model = new ChatOpenAI({});
const examples = [
  {
    input: "The Police的成员能够进行合法逮捕吗？",
    output: "The Police的成员能做什么？",
  },
  {
    input: "Jan Sindel出生在哪个国家？",
    output: "Jan Sindel的个人历史是什么？",
  },
];
const examplePrompt = ChatPromptTemplate.fromTemplate(`人类: {input}
AI: {output}`);
const fewShotPrompt = new FewShotChatMessagePromptTemplate({
  prefix:
    "重新表述用户的查询，使用以下示例",
  suffix: "人类: {input}",
  examplePrompt,
  examples,
  inputVariables: ["input"],
});
const formattedPrompt = await fewShotPrompt.format({
  input: "法国的主要城市是什么？",
});

const response = await model.invoke(formattedPrompt);
console.log(response);
```

```typescript
AIMessage {
  lc_namespace: [ 'langchain', 'schema' ],
  content: '法国的首都是什么？',
  additional_kwargs: { function_call: undefined }
}
```

### 使用函数进行几个示例

您还可以使用函数进行部分提示。这种情况的用例是当您有一个您知道您总是希望以常见方式获取的变量时。一个很好的例子是日期或时间。想象一下，您有一个提示，您总是希望包含当前日期。您不能在提示中硬编码它，并且将其与其他输入变量一起传递可能很麻烦。在这种情况下，使用一个始终返回当前日期的函数对提示进行部分处理非常方便。

```typescript
const getCurrentDate = () => {
  return new Date().toISOString();
};

const prompt = new FewShotChatMessagePromptTemplate({
  template: "告诉我一个{形容词}关于{日期}的笑话",
  inputVariables: ["形容词", "日期"],
});

const partialPrompt = await prompt.partial({
  date: getCurrentDate,
});

const formattedPrompt = await partialPrompt.format({
  adjective: "有趣",
});

console.log(formattedPrompt);

// 告诉我一个有趣关于2023-07-13T00:54:59.287Z的笑话
```

### Few Shot vs Chat Few Shot

聊天式 Few Shot 和非聊天式 Few Shot 提示模板的作用方式相似。下面的示例将演示使用聊天式和非聊天式的区别以及它们的输出。

```typescript
import {
  FewShotPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from "langchain/prompts";
```

```typescript
const examples = [
  {
    input: "The Police的成员能够进行合法逮捕吗？",
    output: "The Police的成员能做什么？",
  },
  {
    input: "Jan Sindel出生在哪个国家？",
    output: "Jan Sindel的个人历史是什么？",
  },
];
const prompt = `Human: {input}
AI: {output}`;
const examplePromptTemplate = PromptTemplate.fromTemplate(prompt);
const exampleChatPromptTemplate = ChatPromptTemplate.fromTemplate(prompt);
const chatFewShotPrompt = new FewShotChatMessagePromptTemplate({
  examplePrompt: exampleChatPromptTemplate,
  examples,
  inputVariables: [], // 没有输入变量
});
const fewShotPrompt = new FewShotPromptTemplate({
  examplePrompt: examplePromptTemplate,
  examples,
  inputVariables: [], // 没有输入变量
});
```

```typescript
console.log("Chat Few Shot: ", await chatFewShotPrompt.formatMessages({}));
/**
Chat Few Shot:  [
  HumanMessage {
    lc_namespace: [ 'langchain', 'schema' ],
    content: 'Human: The Police的成员能够进行合法逮捕吗？\n' +
      'AI: The Police的成员能做什么？',
    additional_kwargs: {}
  },
  HumanMessage {
    lc_namespace: [ 'langchain', 'schema' ],
    content: "Human: Jan Sindel出生在哪个国家？\n" +
      "AI: Jan Sindel的个人历史是什么？",
    additional_kwargs: {}
  }
]
 */
```

```typescript
console.log("Few Shot: ", await fewShotPrompt.formatPromptValue({}));
/**
Few Shot:

Human: The Police的成员能够进行合法逮捕吗？
AI: The Police的成员能做什么？

Human: Jan Sindel出生在哪个国家？
AI: Jan Sindel的个人历史是什么？
 */
```

在这里，我们可以看到 `FewShotChatMessagePromptTemplate` 和 `FewShotPromptTemplate` 之间的主要区别：输入和输出值。

`FewShotChatMessagePromptTemplate` 通过接受一组示例的 `ChatPromptTemplate` 来工作，其输出是 `BaseMessage` 实例的列表。

另一方面，`FewShotPromptTemplate` 通过接受一个示例的 `PromptTemplate` 来工作，其输出是一个字符串。

## 使用非聊天模型

LangChain还为非聊天模型提供了一个用于少量提示格式化的类：`FewShotPromptTemplate`。API基本相同，但输出格式不同（聊天消息 vs 字符串）。

### 带有函数的部分

```typescript
import {
  ChatPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from "langchain/prompts";
```

```typescript
const examplePrompt = PromptTemplate.fromTemplate("{foo}{bar}");
const prompt = new FewShotPromptTemplate({
  prefix: "{foo}{bar}",
  examplePrompt,
  inputVariables: ["foo", "bar"],
});
const partialPrompt = await prompt.partial({
  foo: () => Promise.resolve("boo"),
});
const formatted = await partialPrompt.format({ bar: "baz" });
console.log(formatted);
```

```txt
boobaz\n
```

### 带有函数和示例选择器

```typescript
import {
  ChatPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from "langchain/prompts";
```

```typescript
const examplePrompt = PromptTemplate.fromTemplate("关于{x}的一个例子");
const exampleSelector = await LengthBasedExampleSelector.fromExamples(
  [{ x: "foo" }, { x: "bar" }],
  { examplePrompt, maxLength: 200 }
);
const prompt = new FewShotPromptTemplate({
  prefix: "{foo}{bar}",
  exampleSelector,
  examplePrompt,
  inputVariables: ["foo", "bar"],
});
const partialPrompt = await prompt.partial({
  foo: () => Promise.resolve("boo"),
});
const formatted = await partialPrompt.format({ bar: "baz" });
console.log(formatted);
```

```txt
boobaz
关于foo的一个例子
关于bar的一个例子
```

