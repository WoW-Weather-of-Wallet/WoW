const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// 상위 폴더의 shared 모듈 및 그 내부의 node_modules를 참조할 수 있도록 설정
config.watchFolders = [path.resolve(projectRoot, "..")];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(projectRoot, "..", "shared", "node_modules"),
];

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
