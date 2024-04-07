/* eslint-disable global-require,import/no-extraneous-dependencies */

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
// eslint-disable-next-line import/no-extraneous-dependencies
const {
  ProvidePlugin
} = require("webpack");
const path = require("path");
require("dotenv").config();

const examplesPath = path.resolve(__dirname, "..", "..", "examples", "src");
const mdxComponentsPath = path.resolve(__dirname, "docs", "mdx_components");

const baseLightCodeBlockTheme = require("prism-react-renderer/themes/vsLight");
const baseDarkCodeBlockTheme = require("prism-react-renderer/themes/vsDark");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "🦜️🔗 Langchain",
  tagline: "LangChain JS Docs",
  favicon: "img/brand/favicon.png",
  // Set the production url of your site here
  url: "https://js.langchain.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",

  plugins: [
    () => ({
      name: "custom-webpack-config",
      configureWebpack: () => ({
        plugins: [
          new ProvidePlugin({
            process: require.resolve("process/browser"),
          }),
        ],
        resolve: {
          fallback: {
            path: false,
            url: false,
          },
          alias: {
            "@examples": examplesPath,
            "@mdx_components": mdxComponentsPath,
            react: path.resolve("../../node_modules/react"),
          },
        },
        module: {
          rules: [{
              test: examplesPath,
              use: ["json-loader", "./code-block-loader.js"],
            },
            {
              test: /\.ya?ml$/,
              use: "yaml-loader",
            },
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false,
              },
            },
          ],
        },
      }),
    }),
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), {
              sync: true
            }],
          ],
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            sidebarItems.forEach((subItem) => {
              // This allows breaking long sidebar labels into multiple lines
              // by inserting a zero-width space after each slash.
              if (
                "label" in subItem &&
                subItem.label &&
                subItem.label.includes("/")
              ) {
                // eslint-disable-next-line no-param-reassign
                subItem.label = subItem.label.replace(/\//g, "/\u200B");
              }
            });
            return sidebarItems;
          },
        },
        pages: {
          remarkPlugins: [require("@docusaurus/remark-plugin-npm2yarn")],
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve("swc-loader"),
      options: {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          target: "es2017",
        },
        module: {
          type: isServer ? "commonjs" : "es6",
        },
      },
    }),
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      prism: {
        theme: {
          ...baseLightCodeBlockTheme,
          plain: {
            ...baseLightCodeBlockTheme.plain,
            backgroundColor: "#F5F5F5",
          },
        },
        darkTheme: {
          ...baseDarkCodeBlockTheme,
          plain: {
            ...baseDarkCodeBlockTheme.plain,
            backgroundColor: "#222222",
          },
        },
      },
      image: "img/brand/theme-image.png",
      navbar: {
        logo: {
          src: "img/brand/wordmark.png",
          srcDark: "img/brand/wordmark-dark.png",
        },
        items: [{
          "to": "/docs/get_started/introduction",
          "label": "文档",
          "position": "left"
        },
        {
          "type": "docSidebar",
          "position": "left",
          "sidebarId": "use_cases",
          "label": "用例"
        },
        {
          "type": "docSidebar",
          "position": "left",
          "sidebarId": "integrations",
          "label": "集成"
        },
        {
          "href": "https://api.js.langchain.com",
          "label": "API 参考",
          "position": "left"
        },
        {
          "type": "dropdown",
          "label": "更多",
          "position": "left",
          "items": [{
              "to": "/docs/people/",
              "label": "人员"
            },
            {
              "to": "/docs/community",
              "label": "社区"
            },
            {
              "to": "/docs/additional_resources/tutorials",
              "label": "教程"
            },
            {
              "to": "/docs/contributing",
              "label": "贡献"
            }
          ]
        },
        {
          "type": "dropdown",
          "label": "🦜🔗",
          "position": "right",
          "items": [{
              "href": "https://smith.langchain.com",
              "label": "LangSmith"
            },
            {
              "href": "https://docs.smith.langchain.com",
              "label": "LangSmith 文档"
            },
            {
              "href": "https://smith.langchain.com/hub",
              "label": "LangChain Hub"
            },
            {
              "href": "https://github.com/langchain-ai/langserve",
              "label": "LangServe"
            },
            {
              "href": "https://python.langchain.com/en/latest/",
              "label": "Python 文档"
            }
          ]
        },
        {
          "href": "https://chatjs.langchain.com",
          "label": "聊天",
          "position": "right"
        },
        {
          "type": "localeDropdown",
          "position": "left"
        },
        {
          "href": "https://github.com/langchain-ai/langchainjs",
          "className": "header-github-link",
          "position": "right",
          "aria-label": "GitHub 代码库"
        }
      ],
      },
      footer: {
        style: "light",
        links: [{
            title: "社区",
            items: [{
                label: "Discord",
                href: "https://discord.gg/cU2adEyC7w",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/LangChainAI",
              },
            ],
          },
          {
            title: "GitHub",
            items: [{
                label: "Python",
                href: "https://github.com/langchain-ai/langchain",
              },
              {
                label: "JS/TS",
                href: "https://github.com/langchain-ai/langchainjs",
              },
            ],
          },
          {
            title: "更多",
            items: [{
                label: "Homepage",
                href: "https://langchain.com",
              },
              {
                label: "Blog",
                href: "https://blog.langchain.dev",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} LangChain, Inc.`,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: "3EZV6U1TYC",

        // Public API key: it is safe to commit it
        // this is linked to erick@langchain.dev currently
        apiKey: "180851bbb9ba0ef6be9214849d6efeaf",

        indexName: "js-langchain",

        contextualSearch: true,
      },
    }),

  scripts: [
    "/js/google_analytics.js",
    {
      src: "https://www.googletagmanager.com/gtag/js?id=G-TVSL7JBE9Y",
      async: true,
    },
  ],

  customFields: {
    supabasePublicKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
};

module.exports = config;