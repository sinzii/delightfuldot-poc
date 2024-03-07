"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const extractArgs_1 = require("../util/extractArgs");
const api_1 = require("@polkadot/api");
const dedot_1 = require("dedot");
const delightfuldot_1 = require("../poc/delightfuldot");
const run = async () => {
    const { numberOfEndpoints, library } = (0, extractArgs_1.extractArgs)();
    console.log(`Prepare to connect to ${numberOfEndpoints} endpoint(s)`);
    const targetEndpoints = util_1.network_endpoints.slice(0, numberOfEndpoints);
    const start = (0, util_1.printMemoryUsage)('Start running benchmark');
    console.time('Total time');
    let connected = 0, connectedUrls = [];
    const getApi = (endpoint) => {
        if (library === 'dedot') {
            return dedot_1.Dedot.new(endpoint);
        }
        else if (library === 'delightfuldot-poc') {
            return delightfuldot_1.DelightfulApi.create(endpoint);
        }
        else {
            return api_1.ApiPromise.create({ provider: new api_1.WsProvider(endpoint, 2_500, {}, 20_000) });
        }
    };
    const formatResult = (response) => {
        if (response?.toHuman) {
            return response.toHuman();
        }
        return response;
    };
    const apis = await Promise.all(targetEndpoints.map((endpoint, index) => {
        const no = +index + 1;
        console.log(`${no} - Connecting to ${endpoint}`);
        return getApi(endpoint)
            .then(async (api) => {
            const balances = await api.query.system.account('5GXzn4PHsm5SuoqB8xTLp1YtVyr63ZoPB1jK92DNBuEsAXvp');
            console.log(`Run api.query.system.account on ${no} - ${endpoint}, result: `, formatResult(balances));
            // const props = await api.rpc.system.properties();
            // console.log(`Run api.rpc.system.properties on ${no} - ${endpoint}, result: `, props)
            // const now = await api.query.timestamp.now();
            // console.log(`Run api.query.timestamp.now on ${no} - ${endpoint}, result: `, now)
            connected += 1;
            connectedUrls.push(endpoint);
            console.log(`Progress: ${connected}/${numberOfEndpoints}, connected to ${no} - ${endpoint}, `);
            if (numberOfEndpoints - connected <= 5) {
                console.log('Waiting for:', targetEndpoints.filter(one => !connectedUrls.includes(one)));
            }
            return api;
        }).catch((e) => {
            console.error(`Error at ${no} - ${endpoint}`, e);
            return null;
        });
    }));
    console.timeEnd('Total time');
    // gc && gc();
    const end = (0, util_1.printMemoryUsage)();
    console.log(`Connected endpoints: ${apis.filter(one => one).length}, total Used Memory: ${end - start}MB`);
    console.log('Disconnecting to endpoints...');
    for (let api of apis) {
        await api?.disconnect();
    }
};
run().catch(console.log);
