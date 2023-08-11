import { ApiPromise, WsProvider } from "@polkadot/api";
import { printMemoryUsage } from "../util";
import { DelightfulApi } from "../poc/delighfuldot";

const run = async () => {
  const POLKADOT_ENDPOINTS = 'wss://rpc.polkadot.io';

  const start = printMemoryUsage('Start running benchmark');

  const api = await DelightfulApi.create(POLKADOT_ENDPOINTS);

  printMemoryUsage('After API initialization');

  const balances = await api.query.system.account('5H4ADToRqTXEeHfmw8VGK8UEG3ehQNCAaoJLsdaUXijrqsUt');
  console.log('Balances:', balances);

  const end = printMemoryUsage();

  console.log(`Total Used Memory: ${end - start}MB`);
}

console.log('Execute in 5 seconds ...')
setTimeout(() => {
  run().catch(console.error);
}, 5_000);
