import { EthereumAddress, ProjectId, UnixTime } from '@l2beat/shared-pure'

import { RISK_VIEW } from './common'
import { Bridge } from './types'
import { NUGGETS } from '../layer2s'
import { ProjectDiscovery } from '../discovery/ProjectDiscovery'

const discovery = new ProjectDiscovery('Wormhole Protocol')

export const wormholeV1: Bridge = {
  type: 'bridge',
  id: ProjectId('Wormhole'),
  isArchived: false,
  display: {
    name: 'Wormhole',
    slug: 'wormhole',
    links: {
      websites: ['https://wormhole.com/'],
      apps: ['https://www.portalbridge.com/#/transfer'],
      documentation: ['https://docs.wormhole.com/'],
      explorers:['https://wormholescan.io'],
      socialMedia: [ 
        'https://twitter.com/wormholecrypto',
        'https://discord.gg/wormholecrypto'
    },
    category: 'Hybrid'
  },
  description:
      'This simple message passing protocol enables developers and users of cross chain applications',
    category: 'Messaging Bridge',
  },
  config: {
    escrows: [
      {
        address: EthereumAddress('0xf92cD566Ea4864356C5491c177A430C222d7e678'),
        sinceTimestamp: new UnixTime(1611084766),
        tokens: [
          //'USDC',
          'WormholeETH',
          'USDCnet',
          'USDTnet',
          'BUSD',
          'HBTC',
          'HUSD',
          'DAI',
          'WETH',
          'FRAX',
          'WBTC',
          'tBTC'
        ],
      },
    ],
  },
  technology: {
    destination: ['Solana','Binance Smart Chain','Terra and Terra Classic','Polygon','Avalanche','Algorand','Fantom','Karura','Celo,'Acala','Aptos','Arbitrum'
], 
    canonical: true,
  },
  riskView: {
    validatedBy: {
      value: 'Network of permissioned Nodes',
      description:
        'Transfers need to be signed offchain by a set of 2/3n +1 of Guardians and then relayed to the destination chain with the relayers, as of now there are no open public relayers but anyone spin up their own.',
      sentiment: 'bad',
    },
    sourceUpgradeability: RISK_VIEW.UPGRADABLE_NO,
    destinationToken: RISK_VIEW.WRAPPED,
  },
  knowledgeNuggets: [
    {
      title: 'Wormhole core architecture',
      url: 'https://github.com/wormhole-foundation/wormhole/blob/main/whitepapers/0001_generic_message_passing.md',
    },
    {
      title: 'How Wormhole Guardians work',
      url: 'https://github.com/wormhole-foundation/wormhole/blob/main/whitepapers/0009_guardian_key.md',
    },
    {
      title: 'What are VAAs',
      url: 'https://docs.wormhole.com/wormhole/explore-wormhole/vaa'
    }
  ],
}
