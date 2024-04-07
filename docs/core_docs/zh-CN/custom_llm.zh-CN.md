---
sidebar_position: 3
---
# 自定义LLM

本笔记介绍如何创建一个自定义LLM包装器，以便您可以使用自己的LLM或与LangChain直接支持的包装器不同的包装器。

在扩展[`LLM`类](https://api.js.langchain.com/classes/langchain_core_language_models_llms.LLM.html)之后，自定义LLM需要实现以下几个必需的内容：

- 一个 `_call` 方法，接受一个字符串和调用选项（包括诸如`stop`序列之类的内容），并返回一个字符串。
- 一个 `_llmType` 方法，返回一个字符串。仅用于日志记录目的。

您还可以实现以下可选方法：

- 一个 `_streamResponseChunks` 方法，返回一个`AsyncIterator`并产生[`GenerationChunks`](https://api.js.langchain.com/classes/langchain_core_outputs.GenerationChunk.html)。这允许LLM支持流式输出。

让我们实现一个非常简单的自定义LLM，它只是回显输入的前`n`个字符。

```typescript
import { LLM, type BaseLLMParams } from "@langchain/core/language_models/llms";
import type { CallbackManagerForLLMRun } from "langchain/callbacks";
import { GenerationChunk } from "langchain/schema";

export interface CustomLLMInput extends BaseLLMParams {
  n: number;
}

export class CustomLLM extends LLM {
  n: number;

  constructor(fields: CustomLLMInput) {
    super(fields);
    this.n = fields.n;
  }

  _llmType() {
    return "custom";
  }

  async _call(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager: CallbackManagerForLLMRun
  ): Promise<string> {
    // 在调用内部运行时，传递`runManager?.getChild()`以启用跟踪
    // await subRunnable.invoke(params, runManager?.getChild());
    return prompt.slice(0, this.n);
  }

  async *_streamResponseChunks(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<GenerationChunk> {
    // 在调用内部运行时，传递`runManager?.getChild()`以启用跟踪
    // await subRunnable.invoke(params, runManager?.getChild());
    for (const letter of prompt.slice(0, this.n)) {
      yield new GenerationChunk({
        text: letter,
      });
      // 触发适当的回调
      await runManager?.handleLLMNewToken(letter);
    }
  }
}
```

现在我们可以像使用其他LLM一样使用它：

```typescript
const llm = new CustomLLM({ n: 4 });

await llm.invoke("I am an LLM");
```

```
I am
```

并支持流式处理：

```typescript
const stream = await llm.stream("I am an LLM");

for await (const chunk of stream) {
  console.log(chunk);
}
```

```
I

a
m
```

## 更丰富的输出

如果您想利用LangChain的回调系统来实现诸如令牌跟踪之类的功能，您可以扩展[`BaseLLM`](https://api.js.langchain.com/classes/langchain_core_language_models_llms.BaseLLM.html)类并实现更低级别的 `_generate` 方法。与其接受单个字符串作为输入和单个字符串输出，不如接受多个输入字符串并将每个映射到多个字符串输出。此外，它返回一个带有额外元数据字段的 `Generation` 输出，而不仅仅是一个字符串。

```ts
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { LLMResult } from "@langchain/core/outputs";
import {
  BaseLLM,
  BaseLLMCallOptions,
  BaseLLMParams,
} from "@langchain/core/language_models/llms";

export interface AdvancedCustomLLMCallOptions extends BaseLLMCallOptions {}

export interface AdvancedCustomLLMParams extends BaseLLMParams {
  n: number;
}

export class AdvancedCustomLLM extends BaseLLM<AdvancedCustomLLMCallOptions> {
  n: number;

  constructor(fields: AdvancedCustomLLMParams) {
    super(fields);
    this.n = fields.n;
  }

  _llmType() {
    return "advanced_custom_llm";
  }

  async _generate(
    inputs: string[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<LLMResult> {
    const outputs = inputs.map((input) => input.slice(0, this.n));
    // 在调用内部可运行项时传递 `runManager?.getChild()` 以启用跟踪
    // await subRunnable.invoke(params, runManager?.getChild());

    // 一个输入可能生成多个输出。
    const generations = outputs.map((output) => [
      {
        text: output,
        // 生成的可选附加元数据
        generationInfo: { outputCount: 1 },
      },
    ]);
    const tokenUsage = {
      usedTokens: this.n,
    };
    return {
      generations,
      llmOutput: { tokenUsage },
    };
  }
}
```

这将通过回调事件和 `streamEvents` 方法传递额外返回的信息：

```ts
const llm = new AdvancedCustomLLM({ n: 4 });

const eventStream = await llm.streamEvents("我是一个LLM", {
  version: "v1",
});

for await (const event of eventStream) {
  if (event.event === "on_llm_end") {
    console.log(JSON.stringify(event, null, 2));
  }
}
```

```
{
  "event": "on_llm_end",
  "name": "AdvancedCustomLLM",
  "run_id": "a883a705-c651-4236-8095-cb515e2d4885",
  "tags": [],
  "metadata": {},
  "data": {
    "output": {
      "generations": [
        [
          {
            "text": "我是",
            "generationInfo": {
              "outputCount": 1
            }
          }
        ]
      ],
      "llmOutput": {
        "tokenUsage": {
          "usedTokens": 4
        }
      }
    }
  }
}
```
