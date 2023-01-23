import { assert, Logger, promiseAllPlus } from '@l2beat/common'
import { RpcTransactionApi } from '@l2beat/config'
import { ProjectId, UnixTime } from '@l2beat/types'
import { providers } from 'ethers'
import { range } from 'lodash'

import { Metrics } from '../../../Metrics'
import { BlockTransactionCountRepository } from '../../../peripherals/database/activity/BlockTransactionCountRepository'
import { SequenceProcessorRepository } from '../../../peripherals/database/SequenceProcessorRepository'
import { EthereumClient } from '../../../peripherals/ethereum/EthereumClient'
import { Clock } from '../../Clock'
import { SequenceProcessor } from '../../SequenceProcessor'
import { TransactionCounter } from '../TransactionCounter'
import { createBlockTransactionCounter } from './BlockTransactionCounter'
import { getBatchSizeFromCallsPerMinute } from './getBatchSizeFromCallsPerMinute'

export function createRpcCounter(
  projectId: ProjectId,
  blockRepository: BlockTransactionCountRepository,
  sequenceProcessorRepository: SequenceProcessorRepository,
  logger: Logger,
  metrics: Metrics,
  clock: Clock,
  transactionApi: RpcTransactionApi,
): TransactionCounter {
  const callsPerMinute = transactionApi.callsPerMinute ?? 60
  const timeout = transactionApi.timeout ?? 15_000
  const batchSize = getBatchSizeFromCallsPerMinute(callsPerMinute)
  const url = transactionApi.url
  assert(url, 'Url for rpc client must be defined')
  const provider = new providers.StaticJsonRpcProvider({
    url,
    timeout,
  })
  const client = new EthereumClient(
    provider,
    logger.for(`RpcProcessor[${projectId.toString()}]`),
    callsPerMinute,
  )

  const processor = new SequenceProcessor(
    projectId.toString(),
    logger,
    metrics,
    sequenceProcessorRepository,
    {
      batchSize,
      startFrom: transactionApi.startBlock ?? 0,
      getLatest: (previousLatest) =>
        client.getBlockNumberAtOrBefore(clock.getLastHour(), previousLatest),
      processRange: async (from, to, trx, logger) => {
        const queries = range(from, to + 1).map((blockNumber) => async () => {
          const block = await client.getBlock(blockNumber)
          const timestamp = new UnixTime(block.timestamp)

          return {
            projectId,
            blockNumber,
            timestamp,
            count:
              transactionApi.assessCount?.(
                block.transactions.length,
                blockNumber,
              ) ?? block.transactions.length,
          }
        })

        const blocks = await promiseAllPlus(queries, logger)
        await blockRepository.addMany(blocks, trx)
      },
    },
  )

  return createBlockTransactionCounter(projectId, processor, blockRepository)
}