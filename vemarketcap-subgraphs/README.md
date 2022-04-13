# veMarketCap Subgraphs

## How to add your project


- If your project is a fork of **Curve**:

  1. Open one of the `configs/veAsset-mainnet.json`, `configs/veAsset-avalanche.json` or `configs/veAsset-fantom.json` files based on your project.

  2. Add this to the end of it then __edit things__ that are in `<>`:

  ```js
    ... 
    {
      "name": "<name>Revenue",
      "address": "<address of FeeDistributor contract>",
      "startBlock": <block number that the contract deployed>,
      "module": ["veAssetRevenue"]
    },
    {
      "name": "<name>",
      "address": "<address of your veAsset contract>",
      "startBlock": <block number that the contract deployed>,
      "module": ["veAsset"]
    }
  } 
  ```

  The result should be something like this:

  ```js
    ...
    {
      "name": "CurveRevenue",
      "address": "0xA464e6DCda8AC41e03616F95f4BC98a13b8922Dc",
      "startBlock": 11278886,
      "module": ["veAssetRevenue"]
    },
    {
      "name": "Curve",
      "address": "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2",
      "startBlock": 10647812,
      "module": ["veAsset"]
    }
  }
  ```

- If your project is **not** a fork of **Curve**: TODO
