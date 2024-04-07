import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";

export const run = async () => {
  // 使用 `CommaSeparatedListOutputParser`，我们可以解析逗号分隔的列表。
  const parser = new CommaSeparatedListOutputParser();

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: "List five {subject}.\n{format_instructions}",
    inputVariables: ["subject"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const model = new OpenAI({ temperature: 0 });

  const input = await prompt.format({ subject: "ice cream flavors" });
  const response = await model.invoke(input);

  console.log(input);
  /*
请列出五种冰淇淋口味。
您的回答应该是逗号分隔的值列表，例如：`foo, bar, baz`
  */

  console.log(response);
  // Vanilla, Chocolate, Strawberry, Mint Chocolate Chip, Cookies and Cream

  console.log(await parser.parse(response));
  /*
  [
    'Vanilla',
    'Chocolate',
    'Strawberry',
    'Mint Chocolate Chip',
    'Cookies and Cream'
  ]
  */
};
