import { Bridge, Layer2, safeGetCanonicalTokenByAssetId } from '@l2beat/config'
import {
  ActivityApiResponse,
  DetailedTvlApiResponse,
  ProjectId,
  TvlApiResponse,
} from '@l2beat/shared-pure'

import { Config } from '../../build/config'
import { ChartProps } from '../../components'

export function getChart(
  project: Layer2 | Bridge,
  tvlApiResponse: TvlApiResponse | DetailedTvlApiResponse,
  config?: Config,
  activityApiResponse?: ActivityApiResponse,
): ChartProps {
  return {
    tvlEndpoint: `/api/${project.display.slug}-tvl.json`,
    detailedTvlEndpoint: `/api/${project.display.slug}-detailed-tvl.json`,
    activityEndpoint: `/api/activity/${project.display.slug}.json`,
    tokens: getTokens(project.id, tvlApiResponse),
    hasActivity:
      config?.features.activity &&
      !!activityApiResponse?.projects[project.id.toString()],
    hasDetailedTvl: config?.features.detailedTvl,
    milestones: config?.features.milestones ? project.milestones : [],
    isUpcoming: project.isUpcoming ?? project.config.escrows.length === 0,
  }
}

function getTokens(
  projectId: ProjectId,
  tvlApiResponse: TvlApiResponse | DetailedTvlApiResponse,
) {
  return tvlApiResponse.projects[projectId.toString()]?.tokens
    .map(({ assetId, tvl }) => {
      const symbol = safeGetCanonicalTokenByAssetId(assetId)?.symbol
      if (symbol) {
        return {
          symbol,
          tvlEndpoint: `/api/projects/${projectId.toString()}/tvl/assets/${assetId.toString()}`,
          tvl,
        }
      }
    })
    .filter(notUndefined)
    .sort((a, b) => b.tvl - a.tvl)
}

function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined
}
