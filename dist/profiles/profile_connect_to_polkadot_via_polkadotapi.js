"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@polkadot/api");
const util_1 = require("../util");
const run = async () => {
    const POLKADOT_ENDPOINTS = 'wss://rpc.polkadot.io';
    const start = (0, util_1.printMemoryUsage)('Start running profiling');
    await api_1.ApiPromise.create({ provider: new api_1.WsProvider(POLKADOT_ENDPOINTS) });
    const end = (0, util_1.printMemoryUsage)();
    console.log(`Total Used Memory: ${end - start}MB`);
};
console.log('Execute in 5 seconds ...');
setTimeout(() => {
    run().catch(console.error);
}, 5_000);
