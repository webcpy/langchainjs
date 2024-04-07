import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export const run = async () => {
  // 使用 `CommaSeparatedListOutputParser`，我们可以解析逗号分隔的列表。
  const parser = new CommaSeparatedListOutputParser();

  const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate("List five {subject}.\n{format_instructions}"),
    new OpenAI({ temperature: 0 }),
    parser,
  ]);

  /*
请列出五种冰淇淋口味。
您的回答应该是逗号分隔的值列表，例如：`foo, bar, baz`
  */
  const response = await chain.invoke({
    subject: "ice cream flavors",
    format_instructions: parser.getFormatInstructions(),
  });

  console.log(response);
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
