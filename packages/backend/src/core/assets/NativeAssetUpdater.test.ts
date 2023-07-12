import { Logger } from '@l2beat/shared'
import { ChainId, ValueType } from '@l2beat/shared-pure'
import { expect, mockFn, mockObject } from 'earl'
import waitForExpect from 'wait-for-expect'

import { ReportRepository } from '../../peripherals/database/ReportRepository'
import { ReportStatusRepository } from '../../peripherals/database/ReportStatusRepository'
import { REPORTS_MOCK as MOCK } from '../../test/mockReports'
import { Clock } from '../Clock'
import { PriceUpdater } from '../PriceUpdater'
import {
  NATIVE_ASSET_CONFIG_HASH,
  NativeAssetUpdater,
} from './NativeAssetUpdater'

describe(NativeAssetUpdater.name, () => {
  describe(NativeAssetUpdater.prototype.update.name, () => {
    it('calculates and saves reports', async () => {
      const priceUpdater = mockObject<PriceUpdater>({
        getPricesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_PRICES)
          .returnsOnce(MOCK.PRICES),
      })
      const reportRepository = mockObject<ReportRepository>({
        addOrUpdateMany: async () => 0,
        getByTimestampAndAssetType: async () => MOCK.FUTURE_REPORTS,
      })

      const reportStatusRepository = mockObject<ReportStatusRepository>({
        getByConfigHash: async () => [],
        add: async ({ configHash }) => configHash,
      })

      const nativeAssetUpdater = new NativeAssetUpdater(
        priceUpdater,
        reportRepository,
        reportStatusRepository,
        mockObject<Clock>(),
        Logger.SILENT,
      )

      await nativeAssetUpdater.update(MOCK.NOW.add(1, 'hours'))
      await nativeAssetUpdater.update(MOCK.NOW)

      expect(reportStatusRepository.add).toHaveBeenCalledTimes(2)
      expect(reportStatusRepository.add).toHaveBeenNthCalledWith(1, {
        configHash: NATIVE_ASSET_CONFIG_HASH,
        timestamp: MOCK.NOW.add(1, 'hours'),
        chainId: ChainId.NMV,
        valueType: ValueType.NMV,
      })
      expect(reportStatusRepository.add).toHaveBeenNthCalledWith(2, {
        configHash: NATIVE_ASSET_CONFIG_HASH,
        timestamp: MOCK.NOW,
        chainId: ChainId.NMV,
        valueType: ValueType.NMV,
      })

      expect(reportRepository.addOrUpdateMany).toHaveBeenCalledTimes(2)
      expect(reportRepository.addOrUpdateMany).toHaveBeenNthCalledWith(
        1,
        MOCK.FUTURE_OP_REPORT,
      )
      expect(reportRepository.addOrUpdateMany).toHaveBeenNthCalledWith(2, [])

      const reports = await nativeAssetUpdater.getReportsWhenReady(
        MOCK.NOW.add(1, 'hours'),
      )
      // ensure that the updater updated internal knownSet
      expect(reports).toEqual(MOCK.FUTURE_REPORTS)
    })
  })

  describe(NativeAssetUpdater.prototype.start.name, () => {
    it('skips known timestamps', async () => {
      const priceUpdater = mockObject<PriceUpdater>({
        getPricesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_PRICES)
          .returnsOnce(MOCK.PRICES),
      })
      const reportRepository = mockObject<ReportRepository>({
        addOrUpdateMany: async () => 0,
      })

      const reportStatusRepository = mockObject<ReportStatusRepository>({
        getByConfigHash: async () => [
          MOCK.NOW.add(-1, 'hours'),
          MOCK.NOW.add(2, 'hours'),
        ],
        add: async ({ configHash }) => configHash,
      })

      const clock = mockObject<Clock>({
        onEveryHour: (callback) => {
          callback(MOCK.NOW.add(-1, 'hours'))
          callback(MOCK.NOW)
          callback(MOCK.NOW.add(1, 'hours'))
          callback(MOCK.NOW.add(2, 'hours'))
          return () => {}
        },
      })

      const nativeAssetUpdater = new NativeAssetUpdater(
        priceUpdater,
        reportRepository,
        reportStatusRepository,
        clock,
        Logger.SILENT,
      )

      await nativeAssetUpdater.start()

      await waitForExpect(() => {
        expect(reportStatusRepository.add).toHaveBeenCalledTimes(2)
        expect(reportStatusRepository.add).toHaveBeenNthCalledWith(1, {
          configHash: NATIVE_ASSET_CONFIG_HASH,
          timestamp: MOCK.NOW.add(1, 'hours'),
          chainId: ChainId.NMV,
          valueType: ValueType.NMV,
        })
        expect(reportStatusRepository.add).toHaveBeenNthCalledWith(2, {
          configHash: NATIVE_ASSET_CONFIG_HASH,
          timestamp: MOCK.NOW,
          chainId: ChainId.NMV,
          valueType: ValueType.NMV,
        })

        expect(reportRepository.addOrUpdateMany).toHaveBeenCalledTimes(2)
        expect(reportRepository.addOrUpdateMany).toHaveBeenNthCalledWith(
          1,
          MOCK.FUTURE_OP_REPORT,
        )
        expect(reportRepository.addOrUpdateMany).toHaveBeenNthCalledWith(2, [])
      })
    })
  })

  describe(NativeAssetUpdater.prototype.getReportsWhenReady.name, () => {
    it('returns known timestamps', async () => {
      const priceUpdater = mockObject<PriceUpdater>({
        getPricesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_PRICES)
          .returnsOnce(MOCK.PRICES),
      })
      const reportRepository = mockObject<ReportRepository>({
        addOrUpdateMany: async () => 0,
        getByTimestampAndAssetType: async () => MOCK.REPORTS,
      })

      const reportStatusRepository = mockObject<ReportStatusRepository>({
        getByConfigHash: async () => [
          MOCK.NOW.add(-1, 'hours'),
          MOCK.NOW.add(2, 'hours'),
        ],
        add: async ({ configHash }) => configHash,
      })

      const clock = mockObject<Clock>({
        onEveryHour: (callback) => {
          callback(MOCK.NOW.add(-1, 'hours'))
          callback(MOCK.NOW)
          callback(MOCK.NOW.add(1, 'hours'))
          callback(MOCK.NOW.add(2, 'hours'))
          return () => {}
        },
      })

      const reportUpdater = new NativeAssetUpdater(
        priceUpdater,
        reportRepository,
        reportStatusRepository,
        clock,
        Logger.SILENT,
      )

      await reportUpdater.start()

      const reports = await reportUpdater.getReportsWhenReady(
        MOCK.NOW.add(-1, 'hours'),
      )

      expect(reports).toEqual(MOCK.REPORTS)
    })
  })
})