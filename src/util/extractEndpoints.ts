import ChainInfo from './ChainInfo.json';
import { ApiPromise, WsProvider } from "@polkadot/api";
import * as net from "net";
import * as fs from "fs";

const getSubstrateNetworks = () => {
  return Object
    .values(ChainInfo)
    .filter(one => one.substrateInfo)
    .filter(one => !one.isTestnet)
    .filter(one => one.chainStatus === 'ACTIVE');
}

const isAvailable = async (endpoint: string): Promise<boolean> => {
  try {
    console.log(`Check endpoint: ${endpoint}`)
    const provider = new WsProvider(endpoint, false, {}, 15_000);

    await provider.connect();
    await ApiPromise.create({provider})

    return true;
  } catch (e) {
    return false;
  }
}

const getAvailableNetwork = async () => {
  const endpoints: string[] = [];

  const networks = getSubstrateNetworks();
  for (const idx in networks) {
    const network = networks[idx]
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
}

getAvailableNetwork().catch(console.error);
