'use client'

import { CalculationProgress } from './types'

interface CalculationProgressProps {
  calculationProgress: CalculationProgress
}

export default function CalculationProgressView({ calculationProgress }: CalculationProgressProps) {
  return (
    <main 
      className="rarity-page"
      style={{
        backgroundImage: 'url(/rara_avis-logo-2025-transparent.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="rarity-container">
        <div className="calculation-progress">
          <h1 className="rarity-main-title">CALCULATING RARITY</h1>
          
          <div className="progress-content">
            <div className="progress-phase">{calculationProgress.phase}</div>
            
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${(calculationProgress.current / calculationProgress.total) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="progress-stats">
              <span>{calculationProgress.current.toLocaleString()} / {calculationProgress.total.toLocaleString()}</span>
              <span>{Math.round((calculationProgress.current / calculationProgress.total) * 100)}%</span>
            </div>
            
            <div className="progress-message">{calculationProgress.message}</div>
          </div>
        </div>
      </div>
    </main>
  )
} 