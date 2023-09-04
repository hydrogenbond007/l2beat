import { AssetId, ChainId, Token, UnixTime } from '@l2beat/shared-pure'
import { expect } from 'earl'

import { getMockToken } from '../../test/token'
import { getTotalSupplyFormulaConfigHash } from './getTotalSupplyFormulaConfigHash'

describe(getTotalSupplyFormulaConfigHash.name, () => {
  it('hash changes if tokens added', () => {
    const tokenConfigBefore: Token[] = [
      fakeExternalToken(AssetId.ETH, new UnixTime(1000)),
      fakeExternalToken(AssetId.ARB, new UnixTime(2000)),
    ]
    const tokenConfigAfter: Token[] = [
      ...tokenConfigBefore,
      fakeExternalToken(AssetId.USDC, new UnixTime(2000)),
    ]

    const hashBefore = getTotalSupplyFormulaConfigHash(tokenConfigBefore)
    const hashAfter = getTotalSupplyFormulaConfigHash(tokenConfigAfter)
    expect(hashBefore).not.toEqual(hashAfter)
  })

  it('hash changes if project is removed', () => {
    const tokenConfigBefore: Token[] = [
      fakeExternalToken(AssetId.ETH, new UnixTime(1000)),
      fakeExternalToken(AssetId.ARB, new UnixTime(2000)),
    ]
    const tokenConfigAfter: Token[] = [tokenConfigBefore[0]]

    const hashBefore = getTotalSupplyFormulaConfigHash(tokenConfigBefore)
    const hashAfter = getTotalSupplyFormulaConfigHash(tokenConfigAfter)
    expect(hashBefore).not.toEqual(hashAfter)
  })

  it('hash stays the same if nothing changes', () => {
    const tokenConfigBefore: Token[] = [
      fakeExternalToken(AssetId.ETH, new UnixTime(1000)),
      fakeExternalToken(AssetId.ARB, new UnixTime(2000)),
    ]
    const tokenConfigAfter: Token[] = [
      fakeExternalToken(AssetId.ETH, new UnixTime(1000)),
      fakeExternalToken(AssetId.ARB, new UnixTime(2000)),
    ]

    const hashBefore = getTotalSupplyFormulaConfigHash(tokenConfigBefore)
    const hashAfter = getTotalSupplyFormulaConfigHash(tokenConfigAfter)
    expect(hashBefore).toEqual(hashAfter)
  })

  it('hash stays the same if only escrow changes', () => {
    const tokenConfig: Token[] = [
      fakeExternalToken(AssetId.ETH, new UnixTime(1000)),
      fakeExternalToken(AssetId.ARB, new UnixTime(2000)),
    ]

    const hashBefore = getTotalSupplyFormulaConfigHash(tokenConfig)
    const hashAfter = getTotalSupplyFormulaConfigHash(tokenConfig)
    expect(hashBefore).toEqual(hashAfter)
  })
})

function fakeExternalToken(assetId: AssetId, sinceTimestamp: UnixTime): Token {
  return {
    ...getMockToken(),
    id: assetId,
    sinceTimestamp,
    chainId: ChainId.ARBITRUM,
    type: 'EBV',
  }
}
