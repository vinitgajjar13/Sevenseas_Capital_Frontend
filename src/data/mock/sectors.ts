import { SectorParticipationItem } from '../../types';
import { INITIAL_SECTOR_ANALYSIS } from './sectorScope';

export const MOCK_SECTOR_PARTICIPATION: SectorParticipationItem[] = INITIAL_SECTOR_ANALYSIS.map((sec) => ({
  id: sec.id,
  name: sec.name,
  indexSymbol: sec.indexSymbol,
  changePercent: sec.avgChangePercent,
  bullishPercent: sec.bullishPercent,
  bearishPercent: sec.bearishPercent,
  advanceCount: sec.positiveStocks,
  declineCount: sec.negativeStocks,
  totalStocks: sec.totalStocks,
  topStock: sec.topStock || '',
  topStockChange: sec.topStockChange || 0,
  commentary: `${sec.name} sector: ${sec.positiveStocks}/${sec.totalStocks} stocks advancing with ${sec.direction} momentum.`,
}));
