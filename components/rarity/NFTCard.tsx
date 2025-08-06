'use client'

import { NFTWithRarity, AttributeFieldSelection } from './types'

interface NFTCardProps {
  nft: NFTWithRarity
  attributeSelection: AttributeFieldSelection | null
}

export default function NFTCard({ nft, attributeSelection }: NFTCardProps) {
  return (
    <div className="nft-card">
      <div className="nft-header">
        <div className="nft-rank">#{nft.rank}</div>
        <div className="nft-name">{nft.item.name || `Item #${nft.index + 1}`}</div>
        <div 
          className="nft-score"
          onMouseEnter={(e) => {
            e.currentTarget.closest('.nft-card')?.classList.add('score-hovered');
          }}
          onMouseLeave={(e) => {
            e.currentTarget.closest('.nft-card')?.classList.remove('score-hovered');
          }}
        >
          {nft.rarityScore.toFixed(2)}
        </div>
      </div>
      
      <div className="nft-traits">
        {Object.entries(nft.traits).map(([traitType, trait]) => {
          // Check if this trait was excluded from scoring
          const isExcludedFromScore = attributeSelection && 
            attributeSelection.availableTraitTypes.includes(traitType) && 
            !attributeSelection.selectedTraitTypes.includes(traitType)

          return (
            <div key={traitType} className="trait-item">
              <div className="trait-header">
                <div className="trait-info">
                  <div className="trait-type">{traitType}</div>
                  <div className="trait-value">{trait.value}</div>
                </div>
              </div>
              <div className="trait-stats">
                {trait.count} items {trait.percentage.toFixed(1)}%
                <span className={`trait-rarity ${isExcludedFromScore ? 'excluded' : ''}`}>
                  {isExcludedFromScore ? '--' : trait.rarityScore.toFixed(2)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 