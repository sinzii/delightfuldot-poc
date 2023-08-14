"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChainInfo_json_1 = __importDefault(require("./ChainInfo.json"));
const api_1 = require("@polkadot/api");
const fs = __importStar(require("fs"));
const getSubstrateNetworks = () => {
    return Object
        .values(ChainInfo_json_1.default)
        .filter(one => one.substrateInfo)
        .filter(one => !one.isTestnet)
        .filter(one => one.chainStatus === 'ACTIVE');
};
const isAvailable = async (endpoint) => {
    try {
        console.log(`Check endpoint: ${endpoint}`);
        const provider = new api_1.WsProvider(endpoint, false, {}, 15_000);
        await provider.connect();
        await api_1.ApiPromise.create({ provider });
        return true;
    }
    catch (e) {
        return false;
    }
};
const getAvailableNetwork = async () => {
    const endpoints = [];
    const networks = getSubstrateNetworks();
    for (const idx in networks) {
        const network = networks[idx];
        console.log(`Check network: ${network.name}, index: ${+idx + 1}`);
        for (const one of Object.values(network.providers)) {
            if (await isAvailable(one)) {
                endpoints.push(one);
                break;
            }
        }
        fs.writeFileSync('./endpoints.json', JSON.stringify(endpoints, null, 2));
    }
    console.log(endpoints.length);
    console.log(endpoints);
    return endpoints;
};
getAvailableNetwork().catch(console.error);
