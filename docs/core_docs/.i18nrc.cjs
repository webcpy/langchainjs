module.exports = {
  modelName: 'gpt-3.5-turbo',


  markdown: {
    entry: ['./zh-CN/**/*.mdx'],
    entryLocale: 'en-US',
    entryExtension: '.mdx',
    outputLocales: ['zh-CN'],
    outputExtensions: (locale, {
      getDefaultExtension
    }) => {
      if (locale === 'zh-CN') return '.zh-CN.md';
      return getDefaultExtension(locale);
    },
  },
};