import { 
  NFTItem, 
  TraitAttribute, 
  SchemaValidation, 
  AttributeFieldSelection, 
  CsvColumnSelection, 
  TraitValidation, 
  TraitTypeInfo, 
  NFTWithRarity, 
  TraitValueCount, 
  CalculationProgress 
} from './types'

// Auto-detect token ID column
export const detectTokenIdColumn = (headers: string[]): string | null => {
  const tokenIdPatterns = ['token id', 'tokenid', 'token_id', 'id', '#']
  return headers.find(header => 
    tokenIdPatterns.some(pattern => 
      header.toLowerCase().includes(pattern.toLowerCase())
    )
  ) || null
}

// Parse CSV headers and sample rows for column selection
export const parseCsvForColumnSelection = (csvText: string): CsvColumnSelection => {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row')
  
  const headers = lines[0].split(',').map(h => h.trim())
  const sampleRows: string[][] = []
  
  // Get up to 5 sample rows for preview
  for (let i = 1; i < Math.min(6, lines.length); i++) {
    const values = lines[i].split(',').map(v => v.trim())
    sampleRows.push(values)
  }
  
  return {
    headers,
    sampleRows,
    tokenIdColumn: detectTokenIdColumn(headers),
    nameColumn: null,
    attributeColumns: [],
    step: 'name-selection'
  }
}

// CSV parsing function using user selections
export const parseCsvToJson = (csvText: string, columnSelection: CsvColumnSelection): NFTItem[] => {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row')
  
  const headers = lines[0].split(',').map(h => h.trim())
  const nftItems: NFTItem[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    
    // Skip empty lines
    if (values.length === 0 || values.every(v => !v)) continue
    
    const nftItem: NFTItem = {}
    const attributes: TraitAttribute[] = []
    
    for (let j = 0; j < Math.min(headers.length, values.length); j++) {
      const header = headers[j]
      const value = values[j]
      
      // Skip empty values
      if (!value) continue
      
      if (header === columnSelection.tokenIdColumn) {
        nftItem.tokenId = value
      } else if (header === columnSelection.nameColumn) {
        nftItem.name = value
      } else if (columnSelection.attributeColumns.includes(header)) {
        // Skip "None" values and empty strings for attributes
        if (value && value.toLowerCase() !== 'none') {
          attributes.push({
            trait_type: header,
            value: value
          })
        }
      }
    }
    
    // Add attributes array
    nftItem.attributes = attributes
    
    // Add a default name if none exists
    if (!nftItem.name) {
      nftItem.name = `Token #${nftItem.tokenId || i - 1}`
    }
    
    nftItems.push(nftItem)
  }
  
  return nftItems
}

export const validateSchema = (data: any): SchemaValidation => {
  const validation: SchemaValidation = {
    isValid: false,
    itemCount: 0,
    sampleItem: null,
    possibleAttributeKeys: [],
    errors: []
  }

  // Check if data is an array
  if (!Array.isArray(data)) {
    validation.errors.push("Data must be an array of NFT items")
    return validation
  }

  validation.itemCount = data.length

  if (data.length === 0) {
    validation.errors.push("Data array is empty")
    return validation
  }

  // Get first item as sample
  const sampleItem = data[0]
  validation.sampleItem = sampleItem

  // Find all array fields that could contain attributes/traits
  const possibleKeys: string[] = []
  for (const [key, value] of Object.entries(sampleItem)) {
    if (Array.isArray(value) && value.length > 0) {
      // Check if first item in array looks like a trait
      const firstItem = value[0]
      if (typeof firstItem === 'object' && firstItem !== null) {
        // Check if it has trait-like properties
        const keys = Object.keys(firstItem)
        const hasTraitType = keys.some(k => k.toLowerCase().includes('trait') || k.toLowerCase().includes('type'))
        const hasValue = keys.includes('value')
        
        if (hasTraitType || hasValue || keys.length >= 2) {
          possibleKeys.push(key)
        }
      }
    }
  }

  validation.possibleAttributeKeys = possibleKeys

  if (possibleKeys.length === 0) {
    validation.errors.push("No array fields found that could contain traits/attributes")
    validation.isValid = false
  } else {
    validation.isValid = true
  }

  return validation
}

export const analyzeAttributeField = (data: NFTItem[], attributeKey: string): AttributeFieldSelection => {
  const traitTypes = new Set<string>()
  
  // Sample a subset of items to find all trait types (for performance with large datasets)
  const sampleSize = Math.min(1000, data.length)
  const step = Math.max(1, Math.floor(data.length / sampleSize))
  
  for (let i = 0; i < data.length; i += step) {
    const item = data[i]
    const attributes = item[attributeKey]
    
    if (Array.isArray(attributes)) {
      attributes.forEach((attr: any) => {
        if (typeof attr === 'object' && attr !== null) {
          // Try common trait_type field names
          const traitTypeField = ['trait_type', 'traitType', 'type', 'name'].find(field => field in attr)
          if (traitTypeField && attr[traitTypeField]) {
            traitTypes.add(String(attr[traitTypeField]))
          }
        }
      })
    }
  }

  return {
    selectedKey: attributeKey,
    availableTraitTypes: Array.from(traitTypes).sort(),
    selectedTraitTypes: Array.from(traitTypes) // Select all by default
  }
}

export const validateTraitTypes = (data: NFTItem[], attributeKey: string): TraitValidation => {
  const traitTypeInfo: { [traitType: string]: TraitTypeInfo } = {}

  // Collect all trait type information and unique values
  data.forEach((item) => {
    const attributes = item[attributeKey]
    if (Array.isArray(attributes)) {
      attributes.forEach((attr: any) => {
        if (typeof attr === 'object' && attr !== null) {
          const traitTypeField = ['trait_type', 'traitType', 'type', 'name'].find(field => field in attr)
          const valueField = ['value', 'val', 'trait_value'].find(field => field in attr)
          
          if (traitTypeField && attr[traitTypeField]) {
            const traitType = String(attr[traitTypeField])
            const value = valueField && attr[valueField] ? String(attr[valueField]).trim() : ''
            
            if (!traitTypeInfo[traitType]) {
              traitTypeInfo[traitType] = {
                name: traitType,
                count: 0,
                uniqueValues: [],
                totalValues: 0
              }
            }
            
            traitTypeInfo[traitType].count++
            
            if (value && value !== '') {
              traitTypeInfo[traitType].totalValues++
              
              // Add unique values
              if (!traitTypeInfo[traitType].uniqueValues.includes(value)) {
                traitTypeInfo[traitType].uniqueValues.push(value)
              }
            }
          }
        }
      })
    }
  })

  // Sort unique values for each trait type
  Object.values(traitTypeInfo).forEach(traitInfo => {
    traitInfo.uniqueValues.sort()
  })

  return {
    traitTypes: Object.values(traitTypeInfo).sort((a, b) => b.count - a.count)
  }
}

export const calculateRarity = async (
  data: NFTItem[], 
  attributeKey: string, 
  selectedTraitTypes: string[],
  setCalculationProgress: (progress: CalculationProgress) => void
): Promise<NFTWithRarity[]> => {
  const totalItems = data.length
  const traitValueCounts: TraitValueCount = {}
  const traitCountCounts: { [count: number]: number } = {}

  // First, get ALL available trait types (not just selected ones)
  const allAvailableTraitTypes = new Set<string>()
  data.forEach(item => {
    const attributes = item[attributeKey]
    if (Array.isArray(attributes)) {
      attributes.forEach((attr: any) => {
        if (typeof attr === 'object' && attr !== null) {
          const traitTypeField = ['trait_type', 'traitType', 'type', 'name'].find(field => field in attr)
          if (traitTypeField && attr[traitTypeField]) {
            allAvailableTraitTypes.add(String(attr[traitTypeField]))
          }
        }
      })
    }
  })

  // Initialize trait counts for ALL trait types
  Array.from(allAvailableTraitTypes).forEach(traitType => {
    traitValueCounts[traitType] = {}
  })

  setCalculationProgress({
    phase: 'Analyzing traits',
    current: 0,
    total: totalItems,
    message: 'Counting trait occurrences...'
  })

  // Phase 1: Count all trait values and trait counts
  for (let i = 0; i < data.length; i++) {
    if (i % 100 === 0) {
      setCalculationProgress({
        phase: 'Analyzing traits',
        current: i + 1,
        total: totalItems,
        message: `Processing item ${i + 1} of ${totalItems.toLocaleString()}...`
      })
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    const item = data[i]
    const attributes = item[attributeKey]
    let selectedTraitCount = 0 // Only count selected traits for trait_count

    if (Array.isArray(attributes)) {
      const itemTraits: { [traitType: string]: string | number } = {}
      
      // Extract ALL trait values for this item
      attributes.forEach((attr: any) => {
        if (typeof attr === 'object' && attr !== null) {
          const traitTypeField = ['trait_type', 'traitType', 'type', 'name'].find(field => field in attr)
          const valueField = ['value', 'val', 'trait_value'].find(field => field in attr)
          
          if (traitTypeField && valueField && attr[traitTypeField] && 
              attr[valueField] !== null && attr[valueField] !== undefined && 
              String(attr[valueField]).trim() !== '') {
            const traitType = String(attr[traitTypeField])
            const value = String(attr[valueField]).trim()
            
            itemTraits[traitType] = value
            
            // Count this trait value (for ALL traits, not just selected)
            if (!traitValueCounts[traitType][value]) {
              traitValueCounts[traitType][value] = 0
            }
            traitValueCounts[traitType][value]++
            
            // Only count selected traits for trait_count calculation
            if (selectedTraitTypes.includes(traitType)) {
              selectedTraitCount++
            }
          }
        }
      })
    }

    // Count trait_count occurrences (based on selected traits only)
    if (!traitCountCounts[selectedTraitCount]) {
      traitCountCounts[selectedTraitCount] = 0
    }
    traitCountCounts[selectedTraitCount]++
  }

  setCalculationProgress({
    phase: 'Calculating rarity',
    current: 0,
    total: totalItems,
    message: 'Computing rarity scores...'
  })

  // Phase 2: Calculate rarity scores for each NFT
  // Keep full JavaScript precision during calculations, only round for display
  const results: NFTWithRarity[] = []

  for (let i = 0; i < data.length; i++) {
    if (i % 50 === 0) {
      setCalculationProgress({
        phase: 'Calculating rarity',
        current: i + 1,
        total: totalItems,
        message: `Calculating rarity for item ${i + 1} of ${totalItems.toLocaleString()}...`
      })
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    const item = data[i]
    const attributes = item[attributeKey]
    let totalRarityScore = 0 // Only include selected traits in total
    let selectedTraitCount = 0
    const traits: NFTWithRarity['traits'] = {}

    if (Array.isArray(attributes)) {
      // Calculate rarity for ALL traits
      attributes.forEach((attr: any) => {
        if (typeof attr === 'object' && attr !== null) {
          const traitTypeField = ['trait_type', 'traitType', 'type', 'name'].find(field => field in attr)
          const valueField = ['value', 'val', 'trait_value'].find(field => field in attr)
          
          if (traitTypeField && valueField && attr[traitTypeField] && 
              attr[valueField] !== null && attr[valueField] !== undefined && 
              String(attr[valueField]).trim() !== '') {
            const traitType = String(attr[traitTypeField])
            const value = String(attr[valueField]).trim()
            
            const count = traitValueCounts[traitType][value]
            const rarityScore = totalItems / count
            const percentage = (count / totalItems) * 100
            
            traits[traitType] = {
              value,
              rarityScore,
              count,
              percentage
            }
            
            // Only add to total score if selected
            if (selectedTraitTypes.includes(traitType)) {
              totalRarityScore += rarityScore
              selectedTraitCount++
            }
          }
        }
      })
    }

    // Add trait_count rarity score (based on selected traits only)
    const traitCountRarityScore = totalItems / traitCountCounts[selectedTraitCount]
    const traitCountPercentage = (traitCountCounts[selectedTraitCount] / totalItems) * 100
    
    traits['trait_count'] = {
      value: selectedTraitCount,
      rarityScore: traitCountRarityScore,
      count: traitCountCounts[selectedTraitCount],
      percentage: traitCountPercentage
    }
    
    totalRarityScore += traitCountRarityScore

    results.push({
      item,
      index: i,
      rarityScore: totalRarityScore, // Only selected traits contribute
      rank: 0,
      traits // Contains ALL traits
    })
  }

  // Phase 3: Sort and rank (unchanged)
  setCalculationProgress({
    phase: 'Ranking',
    current: totalItems,
    total: totalItems,
    message: 'Sorting by rarity score...'
  })

  // Phase 3: Sort by rarity score and assign ranks
  results.sort((a, b) => b.rarityScore - a.rarityScore)
  
  // Handle tied rankings
  let currentRank = 1
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].rarityScore !== results[i - 1].rarityScore) {
      // Score is different from previous, so rank becomes current index + 1
      currentRank = i + 1
    }
    results[i].rank = currentRank
  }

  return results
}

export const exportRarityResults = (
  rarityResults: NFTWithRarity[], 
  attributeSelection: AttributeFieldSelection | null
) => {
  if (!rarityResults.length) return

  // Get all unique trait types across all tokens, sorted for consistent column order
  const allTraitTypes = new Set<string>()
  rarityResults.forEach(nft => {
    Object.keys(nft.traits).forEach(traitType => {
      allTraitTypes.add(traitType)
    })
  })
  const sortedTraitTypes = Array.from(allTraitTypes).sort()

  // Helper function to escape CSV values
  const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Create CSV headers
  const headers = [
    'tokenId',
    'statisticalRarityScore', 
    'statisticalRarityRank',
    'aestheticRarityScore',
    'aestheticRarityRank'
  ]

  // Add trait columns (value, count, score for each trait type)
  sortedTraitTypes.forEach(traitType => {
    headers.push(`${traitType}_value`)
    headers.push(`${traitType}_count`)
    headers.push(`${traitType}_score`)
  })

  // Create CSV rows
  const csvRows = [headers.join(',')]

  rarityResults.forEach(nft => {
    const tokenId = nft.item.name || nft.item.tokenId || nft.item.token_id || nft.item.id || (nft.index + 1).toString()
    
    const row = [
      escapeCsvValue(tokenId),
      escapeCsvValue(nft.rarityScore.toFixed(10)),
      escapeCsvValue(nft.rank),
      escapeCsvValue(''), // aestheticRarityScore - blank for free version
      escapeCsvValue('')  // aestheticRarityRank - blank for free version
    ]

    // Add trait values, counts, and scores
    sortedTraitTypes.forEach(traitType => {
      const trait = nft.traits[traitType]
      if (trait) {
        // Check if this trait should be excluded from score
        const shouldExcludeFromScore = attributeSelection && 
          attributeSelection.availableTraitTypes.includes(traitType) && 
          !attributeSelection.selectedTraitTypes.includes(traitType)
        
        row.push(escapeCsvValue(trait.value))
        row.push(escapeCsvValue(trait.count))
        row.push(shouldExcludeFromScore ? '' : escapeCsvValue(trait.rarityScore.toFixed(10)))
      } else {
        // No trait data for this type
        row.push('') // value
        row.push('') // count
        row.push('') // score
      }
    })

    csvRows.push(row.join(','))
  })

  // Create CSV content
  const csvContent = csvRows.join('\n')

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `rara_avis-rarity_export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
} 