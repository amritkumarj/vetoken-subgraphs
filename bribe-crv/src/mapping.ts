import { BigInt, Address, ethereum, BigDecimal} from "@graphprotocol/graph-ts"
import { Add_reward_amountCall, Claim_reward1Call, Claim_rewardCall } from "../generated/Bribe/Bribe"
import { ERC20 } from "../generated/Bribe/ERC20"
import { Gauge as GaugeContract } from "../generated/Bribe/Gauge"

import {
    Gauge,
    Reward,
    Stat,
    Token,
    Vote,
    Week
  } from "../generated/schema"
import { BIGDECIMAL_ONE, BIGDECIMAL_ZERO, BIGINT_ONE, BIGINT_TEN, BIGINT_ZERO, DEFAULT_DECIMALS, SECONDS_PER_WEEK, veCRV_ADDRESS } from "./constants"
import { normalizedUsdcPrice, usdcPrice } from "./price/usdcOracle"
import { getUsdPrice } from "./prices"
export function handleClaim(call: Claim_rewardCall): void {
    claim(call.from, call.inputs.gauge,call.inputs.reward_token, call.outputs.value0,call)
}

export function handleClaimWithUser(call: Claim_reward1Call): void{
    claim(call.inputs.user, call.inputs.gauge,call.inputs.reward_token, call.outputs.value0,call)
}

export function handleReward(call: Add_reward_amountCall): void{
    if(call.outputs.value0){
        const rewardToken = getOrCreateToken(call.inputs.reward_token)
        const gauge = getOrCreateGauge(call.inputs.gauge)
        const reward = new Reward(call.transaction.hash.toHexString())
        reward.blockNumber = call.block.number
        reward.timestamp = call.block.timestamp
        reward.gauge = gauge.id
        reward.rewardToken = rewardToken.id
        const amount = call.inputs.amount
        reward.amount = amount
        reward.amountUSD = getUsdPrice(Address.fromString(rewardToken.id), new BigDecimal(amount));

        reward.save()
    }
}


function claim(userAddress: Address, gaugeAddress: Address, rewardTokenAddress: Address,amount: BigInt, call: ethereum.Call): void{
    const gauge = getOrCreateGauge(gaugeAddress);
    const rewardToken = getOrCreateToken(rewardTokenAddress);
    let id = call.block.timestamp.toI64() / SECONDS_PER_WEEK;
    const userBalance = getVEBalance(userAddress)
    const decimals = BIGINT_TEN.pow(u8(rewardToken.decimals))
    // const tokenPrice =  normalizedUsdcPrice(usdcPrice(rewardToken, decimals))
    const tokenPrice = getUsdPrice(Address.fromString(rewardToken.id), BIGDECIMAL_ONE);

    const amountUSD =  tokenPrice.times(new BigDecimal(amount.div(decimals)))

    const vote = new Vote("vote-" + call.transaction.hash.toHexString())
    vote.blockNumber = call.block.number
    vote.timestamp = call.block.timestamp
    vote.gauge = gauge.id
    vote.rewardToken = rewardToken.id
    vote.user = userAddress.toHexString()
    vote.userBalance = userBalance
    vote.rewardAmount = amount
    vote.rewardAmountUSD = amountUSD
    vote.tokenPrice = tokenPrice

    vote.save()

    let week = Week.load(id.toString())
    if(!week){
        week = new Week(id.toString())
        week.blockNumber = call.block.number
        week.timestamp = call.block.timestamp
        week.save()
    }

    const statsId = id.toString() +"-" +rewardToken.id + "-" + gauge.id
    let stats = Stat.load(statsId)
    if(!stats){
        stats = new Stat(statsId)
        stats.token = rewardToken.id
        stats.gauge = gauge.id
        stats.weeklyClaimedRewards = BIGINT_ZERO
        stats.weeklyClaimedRewardUSD = BIGDECIMAL_ZERO
        stats.totalUserBalance = BIGINT_ZERO
        stats.week = week.id
    }
    stats.weeklyClaimedRewards = stats.weeklyClaimedRewards.plus(amount)
    stats.weeklyClaimedRewardUSD = stats.weeklyClaimedRewardUSD.plus(amountUSD)
    stats.totalUserBalance = stats.totalUserBalance.plus(userBalance)
    stats.blockNumber = call.block.number
    stats.timestamp = call.block.timestamp
    stats.save()

}
function getVEBalance(address: Address): BigInt{
    const erc20Contract = ERC20.bind(veCRV_ADDRESS)
    const balance = erc20Contract.balanceOf(address)
    return balance
}

function getOrCreateGauge(address: Address): Gauge{
    let id = address.toHexString()
    let gauge = Gauge.load(id)
    if(!gauge){
        gauge = new Gauge(id)
        gauge.name = getGaugeName(address)
        gauge.symbol = getGaugeSymbol(address)
        gauge.save();
    }
    return gauge
}
function getGaugeName(address: Address): string{
    const gaugeContract = GaugeContract.bind(address)
    const lpTokenAddress = gaugeContract.try_lp_token()
    if(!lpTokenAddress.reverted){
        const lpToken = ERC20.bind(lpTokenAddress.value)
        return lpToken.name()
    }
    return ''
}
function getGaugeSymbol(address: Address): string{
    const gaugeContract = GaugeContract.bind(address)
    const lpTokenAddress = gaugeContract.try_lp_token()
    if(!lpTokenAddress.reverted){
        const lpToken = ERC20.bind(lpTokenAddress.value)
        return lpToken.symbol()
    }
    return ''
}

function getOrCreateToken(address: Address): Token{
    let id = address.toHexString()
    let token = Token.load(id)
    if(!token){
        const erc20Contract = ERC20.bind(address)
        const decimalCall = erc20Contract.try_decimals()
        const nameCall = erc20Contract.try_name()
        const symbolCall = erc20Contract.try_symbol()
        token = new Token(id)
        token.decimals = decimalCall.reverted ?DEFAULT_DECIMALS : decimalCall.value
        token.name = nameCall.reverted ?'' : nameCall.value
        token.symbol = symbolCall.reverted ?'' : symbolCall.value
        token.save();
    }
    return token
}