const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const  RecommendedPlugin = require('./odin-raccomand-engine/index');

module.exports.RecommendedPlugin = RecommendedPlugin.default;