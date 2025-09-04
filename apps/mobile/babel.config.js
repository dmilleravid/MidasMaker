module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@/components": "./components",
            "@/app": "./app",
          },
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        },
      ],
    ],
  };
};


