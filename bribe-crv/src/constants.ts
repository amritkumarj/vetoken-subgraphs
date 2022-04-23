import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export const veCRV_ADDRESS: Address = Address.fromString('0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2')
export const SECONDS_PER_WEEK = 60 * 60 * 24 * 7;

export let BIGINT_ZERO = BigInt.fromI32(0);
export const BIGDECIMAL_ZERO =new BigDecimal(BIGINT_ZERO)

export const DEFAULT_DECIMALS = 18

export const GAUGE_CONTROLLER : Address = Address.fromString('0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB')

export const USDC_DENOMINATOR = BigDecimal.fromString("1000000");

export const ETH_MAINNET_NETWORK = "mainnet";

export const ETH_MAINNET_USDC_ORACLE_ADDRESS = "0x83d95e0d5f402511db06817aff3f9ea88224b030";
export const ETH_MAINNET_CALCULATIONS_CURVE_ADDRESS = "0x25BF7b72815476Dd515044F9650Bf79bAd0Df655";
export const ETH_MAINNET_CALCULATIONS_SUSHI_SWAP_ADDRESS = "0x8263e161A855B644f582d9C164C66aABEe53f927";

export const ETH_MAINNET_MANAGER_ADDRESS = "0xA86e412109f77c45a3BC1c5870b880492Fb86A14";
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGINT_TEN = BigInt.fromI32(10);