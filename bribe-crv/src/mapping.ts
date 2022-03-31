import { BigInt, Address, ethereum} from "@graphprotocol/graph-ts"
import { Claim_reward1Call, Claim_rewardCall } from "../generated/Bribe/Bribe"
import { ERC20 } from "../generated/Bribe/ERC20"

import {
    Gauge,
    Stats,
    Token,
    Vote
  } from "../generated/schema"
import { BIGDECIMAL_ZERO, BIGINT_ZERO, SECONDS_PER_WEEK, veCRV_ADDRESS } from "./constants"
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

    const vote = new Vote("vote-" + call.transaction.hash.toHexString())
    vote.blockNumber = call.block.number
    vote.timestamp = call.block.timestamp
    vote.gauge = gauge.id
    vote.rewardToken = rewardToken.id
    vote.user = userAddress.toHexString()
    vote.userBalance = getVEBalance(userAddress)
    vote.save()
    const statsId = id.toString() +"-" +rewardToken.id + "-" + gauge.id
    let stats = Stats.load(statsId)
    if(!stats){
        stats = new Stats(statsId)
        stats.token = rewardToken.id
        stats.gauge = gauge.id
        stats.weeklyClaimedRewards = BIGINT_ZERO
    }
    stats.weeklyClaimedRewards = stats.weeklyClaimedRewards.plus(amount)
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
        gauge.save();
    }
    return gauge
}
function getOrCreateToken(address: Address): Token{
    let id = address.toHexString()
    let token = Token.load(id)
    if(!token){
        token = new Token(id)
        token.save();
    }
    return token
}