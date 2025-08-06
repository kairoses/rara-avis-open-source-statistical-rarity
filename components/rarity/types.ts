export interface NFTItem {
  [key: string]: any
}

export interface TraitAttribute {
  trait_type: string
  value: string | number
  [key: string]: any
}

export interface SchemaValidation {
  isValid: boolean
  itemCount: number
  sampleItem: NFTItem | null
  possibleAttributeKeys: string[]
  errors: string[]
}

export interface AttributeFieldSelection {
  selectedKey: string
  availableTraitTypes: string[]
  selectedTraitTypes: string[]
}

export interface CsvColumnSelection {
  headers: string[]
  sampleRows: string[][]
  tokenIdColumn: string | null
  nameColumn: string | null
  attributeColumns: string[]
  step: 'name-selection' | 'attribute-selection'
}

export interface TraitTypeInfo {
  name: string
  count: number
  uniqueValues: string[]
  totalValues: number
}

export interface TraitValidation {
  traitTypes: TraitTypeInfo[]
}

export interface TraitValueCount {
  [traitType: string]: {
    [value: string]: number
  }
}

export interface NFTWithRarity {
  item: NFTItem
  index: number
  rarityScore: number
  rank: number
  traits: {
    [traitType: string]: {
      value: string | number
      rarityScore: number
      count: number
      percentage: number
    }
  }
}

export interface CalculationProgress {
  phase: string
  current: number
  total: number
  message: string
} 