import { BigInt, Address, ethereum} from "@graphprotocol/graph-ts"
import { Claim_reward1Call, Claim_rewardCall } from "../generated/Bribe/Bribe"
import { ERC20 } from "../generated/Bribe/ERC20"
import { Gauge as GaugeContract } from "../generated/Bribe/Gauge"

import {
    Gauge,
    Stat,
    Token,
    Vote,
    Week
  } from "../generated/schema"
import { BIGDECIMAL_ZERO, BIGINT_ZERO, DEFAULT_DECIMALS, SECONDS_PER_WEEK, veCRV_ADDRESS } from "./constants"
export function handleClaim(call: Claim_rewardCall): void {
    claim(call.from, call.inputs.gauge,call.inputs.reward_token, call.outputs.value0,call)
}

export function handleClaimWithUser(call: Claim_reward1Call): void{
    claim(call.inputs.user, call.inputs.gauge,call.inputs.reward_token, call.outputs.value0,call)
}

function claim(userAddress: Address, gaugeAddress: Address, rewardTokenAddress: Address,amount: BigInt, call: ethereum.Call): void{
    const gauge = getOrCreateGauge(gaugeAddress);
    const rewardToken = getOrCreateToken(rewardTokenAddress);
    let id = call.block.timestamp.toI64() / SECONDS_PER_WEEK;
    const userBalance = getVEBalance(userAddress)

    const vote = new Vote("vote-" + call.transaction.hash.toHexString())
    vote.blockNumber = call.block.number
    vote.timestamp = call.block.timestamp
    vote.gauge = gauge.id
    vote.rewardToken = rewardToken.id
    vote.user = userAddress.toHexString()
    vote.userBalance = userBalance
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
        stats.totalUserBalance = BIGINT_ZERO
        stats.week = week.id
    }

    stats.weeklyClaimedRewards = stats.weeklyClaimedRewards.plus(amount)
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
function getTokenDecimals(address: Address): BigInt{
    const erc20Contract = ERC20.bind(address)
    const decimalCall = erc20Contract.try_decimals()
    const decimals = decimalCall.reverted ?DEFAULT_DECIMALS : BigInt.fromI32(decimalCall.value)
    return decimals
}

function getTokenName(address: Address): String{
    const erc20Contract = ERC20.bind(address)
    const nameCall = erc20Contract.try_name()
    const name = nameCall.reverted ?'' : nameCall.value
    return name
}

function getOrCreateGauge(address: Address): Gauge{
    let id = address.toHexString()
    let gauge = Gauge.load(id)
    if(!gauge){
        gauge = new Gauge(id)
        gauge.name = getGaugeName(address)
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
function getOrCreateToken(address: Address): Token{
    let id = address.toHexString()
    let token = Token.load(id)
    if(!token){
        token = new Token(id)
        token.decimals = getTokenDecimals(address)
        token.name = getTokenName(address)
        token.save();
    }
    return token
}