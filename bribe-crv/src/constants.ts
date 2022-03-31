import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export const veCRV_ADDRESS: Address = Address.fromString('0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2')
export const SECONDS_PER_WEEK = 60 * 60 * 24 * 7;

export let BIGINT_ZERO = BigInt.fromI32(0);
export const BIGDECIMAL_ZERO =new BigDecimal(BIGINT_ZERO)