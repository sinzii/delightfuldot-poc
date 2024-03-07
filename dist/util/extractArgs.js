"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractArgs = void 0;
const minimist_1 = __importDefault(require("minimist"));
const extractArgs = () => {
    const args = (0, minimist_1.default)(process.argv.slice(2));
    const numberOfEndpoints = parseInt(args['n']) || 10;
    const library = args['l'];
    console.log(args);
    if (!['dedot', 'polkadotapi', 'delightfuldot-poc'].includes(library)) {
        throw new Error('Please select between `dedot`, `delightfuldot-poc` OR `polkadotapi` via argument `l`, e.g: -l polkadotapi OR -l dedot');
    }
    return {
        numberOfEndpoints,
        library
    };
};
exports.extractArgs = extractArgs;
