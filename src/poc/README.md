## Credit

Part of the code in this PoC is borrowed from an old version of the `capi` project by Parity.

Ref: https://web.archive.org/web/20230323191016/https://github.com/paritytech/capi

- Metadata Parser
- Create Codec

## Usage

```ts
import { DelightfulApi } from "./delightfuldot";

const run = async () => {
  const POLKADOT_ENDPOINTS = 'wss://rpc.polkadot.io';
  const api = await DelightfulApi.create(POLKADOT_ENDPOINTS);

  // Inspect constants
  console.log(api.consts.system.blockLength)

  // Storage query
  console.log(await api.query.system.account('5CuDsD8YgsEfbDJifNcfbju5PcwE5VPRvbboKdNhvnu3MUgZ'))

  await api.disconnect();
}

run().catch(console.log)
```
