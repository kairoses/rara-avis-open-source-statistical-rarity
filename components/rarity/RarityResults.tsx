'use client'

import { NFTWithRarity, AttributeFieldSelection, TraitValidation } from './types'
import { exportRarityResults } from './utils'
import NFTCard from './NFTCard'

interface RarityResultsProps {
  rarityResults: NFTWithRarity[]
  attributeSelection: AttributeFieldSelection | null
  traitValidation: TraitValidation | null
  onStartOver: () => void
}

export default function RarityResults({ 
  rarityResults, 
  attributeSelection, 
  traitValidation, 
  onStartOver 
}: RarityResultsProps) {
  const handleExport = () => {
    exportRarityResults(rarityResults, attributeSelection)
  }

  return (
    <div 
      className="rarity-page"
      style={{
        backgroundImage: 'url(/rara_avis-logo-2025-transparent.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="rarity-container">
        <div className="results-header">
          <h1 className="rarity-main-title">STATISTICAL RARITY RESULTS</h1>
          <div className="results-summary">
          <button className="btn-start-over" onClick={onStartOver}>
              ← Start Over
            </button>
            <div className="summary-item">
              <span className="summary-label">Total Items</span>
              <span className="summary-value">{rarityResults.length.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Trait Types</span>
              <span className="summary-value">{attributeSelection?.selectedTraitTypes.length || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Traits</span>
              <span className="summary-value">
                {traitValidation?.traitTypes
                  .filter(tt => attributeSelection?.selectedTraitTypes.includes(tt.name))
                  .reduce((sum, tt) => sum + tt.uniqueValues.length, 0) || 0}
              </span>
            </div>
            <button className="btn-export" onClick={handleExport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              &nbsp;Export Data
            </button>
          </div>
        </div>
        
        <div className="results-grid">
          {rarityResults.slice(0, 100).map((nft) => (
            <NFTCard 
              key={nft.index} 
              nft={nft} 
              attributeSelection={attributeSelection}
            />
          ))}
        </div>
        
        {rarityResults.length > 100 && (
          <div className="results-footer">
            Showing top 100 results. Total: {rarityResults.length.toLocaleString()} items.
          </div>
        )}
      </div>
    </div>
  )
} 