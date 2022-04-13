import { dataSource } from "@graphprotocol/graph-ts"
import { Protocol } from "../../generated/schema"
import { Claimed, FeeDistributor } from "../../generated/Curve/FeeDistributor"
import { updateTokenTotalSupply, updateWeeklyRevenue } from "../common/helpers"

export function handleClaimed(ev: Claimed): void {
  const feeDistributorAddress = dataSource.address()
  const feeDistributor = FeeDistributor.bind(feeDistributorAddress)
  const protocolId = feeDistributor.voting_escrow()

  const protocol = Protocol.load(protocolId.toHexString())
  if (protocol === null) {
    return
  }
  protocol.feeDistributor = feeDistributorAddress.toHexString()
  protocol.save()

  updateWeeklyRevenue(ev.block, protocol)
  updateTokenTotalSupply(protocol.token)
  updateTokenTotalSupply(protocol.veAsset)
}
