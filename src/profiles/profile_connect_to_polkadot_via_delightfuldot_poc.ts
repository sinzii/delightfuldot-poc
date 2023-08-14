import { printMemoryUsage } from "../util";
import { DelightfulApi } from "../poc/delightfuldot";

const run = async () => {
  const POLKADOT_ENDPOINTS = 'wss://rpc.polkadot.io';

  const start = printMemoryUsage('Start running profiling');

  await DelightfulApi.create(POLKADOT_ENDPOINTS);

  const end = printMemoryUsage();

  console.log(`Total Used Memory: ${end - start}MB`);
}

console.log('Execute in 5 seconds ...')
setTimeout(() => {
  run().catch(console.error);
}, 5_000);
