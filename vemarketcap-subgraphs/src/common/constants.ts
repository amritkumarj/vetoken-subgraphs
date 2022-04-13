import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"

////////////////////////
///// Schema Enums /////
////////////////////////

export namespace Network {
  export const AVALANCHE = "AVALANCHE"
  export const AURORA = "AURORA"
  export const BSC = "BSC"
  export const CELO = "CELO"
  export const CRONOS = "CRONOS"
  export const ETHEREUM = "ETHEREUM"
  export const FANTOM = "FANTOM"
  export const HARMONY = "HARMONY"
  export const MOONBEAM = "MOONBEAM"
  export const MOONRIVER = "MOONRIVER"
  export const OPTIMISM = "OPTIMISM"
  export const POLYGON = "POLYGON"
  export const XDAI = "XDAI"
}

export namespace ProtocolType {
  export const EXCHANGE = "EXCHANGE"
  export const LENDING = "LENDING"
  export const YIELD = "YIELD"
  export const BRIDGE = "BRIDGE"
  export const GENERIC = "GENERIC"
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export const DEFAULT_DECIMALS = 18
export const USDC_DECIMALS = 6
export const USDC_DENOMINATOR = BigDecimal.fromString("100000")
export const BIGINT_NEG_ONE = BigInt.fromI32(-1)
export const BIGINT_ZERO = BigInt.fromI32(0)
export const BIGINT_ONE = BigInt.fromI32(1)
export const BIGINT_TWO = BigInt.fromI32(2)
export const BIGINT_SEVEN = BigInt.fromI32(7)
export const BIGINT_MILLION = BigInt.fromI32(1000000)
export const BIGINT_MAX = BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
)

export const BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO)
export const BIGDECIMAL_ONE = new BigDecimal(BIGINT_ONE)
export const BIGDECIMAL_TWO = new BigDecimal(BIGINT_TWO)
export const BIGDECIMAL_MILLION = new BigDecimal(BIGINT_TWO)

export const INT_ZERO = 0 as i32
export const INT_ONE = 1 as i32
export const INT_TWO = 2 as i32

export const MAX_UINT = BigInt.fromI32(2).times(BigInt.fromI32(255))
export const DAYS_PER_YEAR = new BigDecimal(BigInt.fromI32(365))
export const SECONDS_PER_DAY = BigInt.fromI32(60 * 60 * 24)
export const SECONDS_PER_WEEK = SECONDS_PER_DAY.times(BIGINT_SEVEN)
export const MS_PER_DAY = new BigDecimal(BigInt.fromI32(24 * 60 * 60 * 1000))
export const MS_PER_YEAR = DAYS_PER_YEAR.times(new BigDecimal(BigInt.fromI32(24 * 60 * 60 * 1000)))

export const ERROR_NUM = 9999

export const VE_ASSET_ADDRESS_KEY = "veAssetAddress"
export const TOKEN_ADDRESS_KEY = "tokenAddress"
export const PROTOCOL_ID_KEY = "protocolId"
export const TOKEN_BALANCE_ID_KEY = "TokenBalanceId"
