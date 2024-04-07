import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { CustomListOutputParser } from "@langchain/core/output_parsers";

// 使用 `CustomListOutputParser`，我们可以解析具有特定长度和分隔符的列表。
const parser = new CustomListOutputParser({ length: 3, separator: "\n" });

const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
  template: "Provide a list of {subject}.\n{format_instructions}",
  inputVariables: ["subject"],
  partialVariables: { format_instructions: formatInstructions },
});

const model = new OpenAI({ temperature: 0 });

const input = await prompt.format({
  subject: "great fiction books (book, author)",
});

const response = await model.invoke(input);

console.log(input);
/*
请提供一份优秀的小说书籍列表（书名，作者）。
您的回复应该是由"\n"分隔的 3 个项目列表（例如：`foo\n bar\n baz`）。
*/

console.log(response);
/*
The Catcher in the Rye, J.D. Salinger
To Kill a Mockingbird, Harper Lee
The Great Gatsby, F. Scott Fitzgerald
*/

console.log(await parser.parse(response));
/*
[
  'The Catcher in the Rye, J.D. Salinger',
  'To Kill a Mockingbird, Harper Lee',
  'The Great Gatsby, F. Scott Fitzgerald'
]
*/
