import { network_endpoints, printMemoryUsage } from "../util";
import { DelightfulApi } from "../poc/delighfuldot";
import { extractArgs } from "../util/extractArgs";
import { ApiPromise, WsProvider } from "@polkadot/api";

const run = async () => {
  const {numberOfEndpoints, library} = extractArgs();
  console.log(`Prepare to connect to ${numberOfEndpoints} endpoint(s)`)
  const targetEndpoints = network_endpoints.slice(0, numberOfEndpoints);

  const start = printMemoryUsage('Start running benchmark');

  console.time('Total time');

  let connected = 0, connectedUrls: string[] = [];

  const getApi = (endpoint: string) => {
    if (library === 'delightfuldot') {
      return DelightfulApi.create(endpoint);
    } else {
      return ApiPromise.create({provider: new WsProvider(endpoint, 2_500, {}, 20_000)});
    }
  }

  const formatResult = (response: any) => {
    if (response?.toHuman) {
      return response.toHuman();
    }

    return response;
  }

  const apis = await Promise.all(
    targetEndpoints.map((endpoint, index) => {
      const no = +index + 1;
      console.log(`${no} - Connecting to ${endpoint}`);

      return getApi(endpoint)
        .then(async api => {
          const balances = await api.query.system.account('5H4ADToRqTXEeHfmw8VGK8UEG3ehQNCAaoJLsdaUXijrqsUt');
          console.log(`Run api.query.system.account on ${no} - ${endpoint}, result: `, formatResult(balances));

          // const props = await api.rpc.system.properties();
          // console.log(`Run api.rpc.system.properties on ${no} - ${endpoint}, result: `, props)

          // const now = await api.query.timestamp.now();
          // console.log(`Run api.query.timestamp.now on ${no} - ${endpoint}, result: `, now)

          connected += 1;
          connectedUrls.push(endpoint);

          console.log(`Progress: ${connected}/${numberOfEndpoints}, connected to ${no} - ${endpoint}, `);

          if (numberOfEndpoints - connected <= 5) {
            console.log('Waiting for:', targetEndpoints.filter(one => !connectedUrls.includes(one)))
          }

          return api;
        }).catch((e) => {
          console.error(`Error at ${no} - ${endpoint}`, e)
          return null;
        });
    })
  )
  console.timeEnd('Total time');

  // gc && gc();

  const end = printMemoryUsage();

  console.log(`Connected endpoints: ${apis.filter(one => one).length}, total Used Memory: ${end - start}MB`);

  console.log('Disconnecting to endpoints...')
  for (let api of apis) {
    await api?.disconnect();
  }
}

run().catch(console.log);
