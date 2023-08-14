# DelighfulDOT PoC

## Scripts
- `npm run build`: Build the source code
- `npm run dev`: Watch for changes and recompile files on changes

Before running profiles or benchmarks, make sure to run `npm run build` first to compile the source code to JavaScript, compiled code will be put in `dist` folder.

## Benchmark memory consumption when connecting to multiple network endpoints

Benchmarking scripts are located in folder `src/benchmarks`

### Command to run the benchmark
```ssh
node dist/benchmarks/benchmark_connect_multiple_endpoints.js -n [numberOfNetworks] -l [library]
```
Where:
- `[numberOfNetworks]` is the number of [network endpoints](https://github.com/sinzii/delightfuldot-poc/blob/main/src/util/networks.ts) to connect (`5`, `10`, `20`, `50`, `100`)
- `[library]` is the library that will be used to connect: `polkadotapi` or `delightfuldot`

E.g 1: Connect to `100` of network endpoints via `delightfuldot`
```ssh
node dist/benchmarks/benchmark_connect_multiple_endpoints.js -n 100 -l delightfuldot
```

E.g 2: Connect to `100` of network endpoints via `polkadotapi`
```ssh
node dist/benchmarks/benchmark_connect_multiple_endpoints.js -n 100 -l polkadotapi
```

### Memory Consumption Benchmark Result
The benchmark was running on a Macbook Pro M1 / 32GB RAM - 512GB Storage

| Number of network endpoints | @polkadot/api | delightfuldot |
| ------------- | ------------- | ------------- |
| 5  | ~ 48.91 MB  | ~ 4.2 MB |
| 10  | ~ 105 MB  | ~ 15.8 MB |
| 20  | ~ 224 MB  | ~ 20.4 MB | 
| 50  | ~ 464 MB  | ~ 67.1 MB |
| 100  | ~ 829 MB  | ~ 132 MB |

## Profiling

Profiling scripts are located in folder `src/profiles`

**Connect to Polkadot using `@polkadot/api`**
```ssh
node --inspecting dist/profiles/profile_connect_to_polkadot_via_polkadotapi.js
```

**Connect to Polkadot using `delighfuldot`**
```ssh
node --inspecting dist/profiles/profile_connect_to_polkadot_via_delightfuldot_poc.js
```

