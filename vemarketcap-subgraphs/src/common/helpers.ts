import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Protocol, Token, TokenBalance, WeeklyRevenue } from "../../generated/schema"
import { FeeDistributor } from "../../generated/veAsset/FeeDistributor"
import { veAsset as VeAssetContract } from "../../generated/veAsset/veAsset"
import { ERC20 } from "../../generated/veAsset/ERC20"

import { BIGINT_ONE, SECONDS_PER_WEEK, BIGINT_ZERO } from "./constants"

export function getOrCreateToken(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress.toHexString())

  // fetch info if null
  if (token === null) {
    const contract = ERC20.bind(tokenAddress)

    token = new Token(tokenAddress.toHexString())

    const name = contract.try_name()
    const symbol = contract.try_symbol()
    const decimals = contract.try_decimals()

    // Common
    token.name = name.reverted ? "" : name.value
    token.symbol = symbol.reverted ? "" : symbol.value
    token.decimals = decimals.reverted ? 18 : decimals.value
    updateTokenTotalSupply(token.id)
    token.save()
  }
  return token
}

export function updateTokenTotalSupply(id: string): Token | null {
  const token = Token.load(id)

  if (token === null) return null

  const contract = ERC20.bind(Address.fromString(id))
  const totalSupply = contract.try_totalSupply()
  token.totalSupply = totalSupply.reverted ? BIGINT_ZERO : totalSupply.value
  token.save()
  return token
}

export function getTokenBalanceId(tokenAddress: Address, accountAddress: Address): string {
  // Generation ID by combaining token address and account address
  return tokenAddress.toHexString() + "-" + accountAddress.toHexString()
}

export function getOrCreateTokenBalance(tokenAddress: Address, account: Address): TokenBalance {
  const id = getTokenBalanceId(tokenAddress, account)

  let tokenBalance = TokenBalance.load(id)
  if (tokenBalance === null) {
    tokenBalance = new TokenBalance(id)
    tokenBalance.address = account.toHexString()
    tokenBalance.token = tokenAddress.toHexString()
    updateTokenBalance(tokenBalance)
    tokenBalance.save()
  }

  return tokenBalance
}

export function updateTokenBalance(tokenBalance: TokenBalance): TokenBalance {
  const erc20 = ERC20.bind(Address.fromString(tokenBalance.token))
  tokenBalance.balance = erc20.balanceOf(Address.fromString(tokenBalance.address))
  tokenBalance.save()
  return tokenBalance
}

export function createProtocol(id: string, tokenAddress: Address): Protocol {
  const protocol = new Protocol(id)
  protocol.veAsset = id

  const veAssetContract = VeAssetContract.bind(Address.fromString(id))
  getOrCreateToken(veAssetContract._address)

  const token = getOrCreateToken(tokenAddress)
  protocol.token = token.id

  protocol.totalHolderCount = 0
  protocol.startTime = BIGINT_ZERO

  protocol.save()
  return protocol
}

export function updateProtocolFeeDistributor(
  protocol: Protocol,
  feeDistributor: FeeDistributor,
): Protocol {
  protocol.startTime = feeDistributor.start_time()
  protocol.feeDistributor = feeDistributor._address.toHexString()

  protocol.save()

  // // Start veAsset datasource
  // const veAssetContext = new DataSourceContext()
  // veAssetContext.setString(VE_ASSET_ADDRESS_KEY, protocol.veAsset)
  // veAssetContext.setString(PROTOCOL_ID_KEY, protocol.id)
  // veAssetHoldersTemplate.createWithContext(Address.fromString(protocol.veAsset), veAssetContext)

  // // // Start erc20 datasource
  // // const erc20Context = new DataSourceContext()
  // // erc20Context.setString(TOKEN_ADDRESS_KEY, protocol.token)
  // // ERC20Template.createWithContext(Address.fromString(protocol.token), erc20Context)

  return protocol
}

export function getWeeklyRevenueId(protocol: Protocol, timestamp: BigInt): string {
  // Generation ID by combaining protocol address and timestamp
  return protocol.id + "-" + timestamp.toString()
}

export function getOrCreateWeeklyRevenue(protocol: Protocol, timestamp: BigInt): WeeklyRevenue {
  const weeklyRevenueId = getWeeklyRevenueId(protocol, timestamp)
  let weeklyRevenue = WeeklyRevenue.load(weeklyRevenueId)

  if (weeklyRevenue === null) {
    const feeDistributor = FeeDistributor.bind(Address.fromString(protocol.feeDistributor))

    weeklyRevenue = new WeeklyRevenue(weeklyRevenueId)
    weeklyRevenue.protocol = protocol.id
    weeklyRevenue.timestamp = timestamp
    weeklyRevenue.amount = feeDistributor.tokens_per_week(timestamp)
    weeklyRevenue.save()
  }
  return weeklyRevenue
}

export function updateWeeklyRevenue(block: ethereum.Block, protocol: Protocol): void {
  if (protocol.startTime === null) return

  if (block.timestamp < protocol.startTime) {
    return
  }

  const numberOfWeeks = block.timestamp
    .minus(protocol.startTime)
    .div(SECONDS_PER_WEEK)
    .minus(BIGINT_ONE)

  const timestamp = protocol.startTime.plus(numberOfWeeks.times(SECONDS_PER_WEEK))
  const weeklyRevenue = getOrCreateWeeklyRevenue(protocol, timestamp)

  protocol.lastWeekRevenue = weeklyRevenue.id
  protocol.save()
}
