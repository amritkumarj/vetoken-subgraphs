import { dataSource } from "@graphprotocol/graph-ts"
import { Protocol, TokenBalance } from "../../generated/schema"
import { Deposit } from "../../generated/veAsset/veAsset"
import {
  createProtocol,
  getOrCreateTokenBalance,
  getTokenBalanceId,
  updateTokenTotalSupply,
} from "../common/helpers"
import { veAsset as VeAssetContract } from "../../generated/veAsset/veAsset"

export function handleDeposit(ev: Deposit): void {
  const veAssetAddress = dataSource.address()
  let protocol = Protocol.load(veAssetAddress.toHexString())

  if (protocol === null) {
    const veAssetContract = VeAssetContract.bind(veAssetAddress)
    const tokenAddress = veAssetContract.token()
    protocol = createProtocol(veAssetAddress.toHexString(), tokenAddress)
  }

  const tokenBalanceId = getTokenBalanceId(veAssetAddress, ev.params.provider)
  const tokenBalance = TokenBalance.load(tokenBalanceId)

  if (tokenBalance === null) {
    protocol.totalHolderCount += 1
    protocol.save()
  }

  getOrCreateTokenBalance(veAssetAddress, ev.params.provider)
  updateTokenTotalSupply(protocol.token)
  updateTokenTotalSupply(protocol.veAsset)
}
