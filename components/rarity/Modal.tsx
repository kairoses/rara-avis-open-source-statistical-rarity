'use client'

import { 
  SchemaValidation, 
  CsvColumnSelection, 
  AttributeFieldSelection, 
  TraitValidation,
  NFTItem 
} from './types'
import { 
  parseCsvToJson, 
  validateSchema, 
  analyzeAttributeField, 
  validateTraitTypes 
} from './utils'

type ModalStep = 'validation' | 'csv-column-selection' | 'attribute-selection' | 'trait-validation' | 'trait-selection'

interface ModalProps {
  showModal: boolean
  modalStep: ModalStep
  schemaValidation: SchemaValidation | null
  csvColumnSelection: CsvColumnSelection | null
  attributeSelection: AttributeFieldSelection | null
  traitValidation: TraitValidation | null
  rawCsvText: string
  jsonData: NFTItem[]
  onClose: () => void
  onModalStepChange: (step: ModalStep) => void
  onCsvColumnSelectionChange: (selection: CsvColumnSelection) => void
  onAttributeSelectionChange: (selection: AttributeFieldSelection) => void
  onTraitValidationChange: (validation: TraitValidation) => void
  onJsonDataChange: (data: NFTItem[]) => void
  onSchemaValidationChange: (validation: SchemaValidation) => void
  onProceed: () => void
}

export default function Modal({
  showModal,
  modalStep,
  schemaValidation,
  csvColumnSelection,
  attributeSelection,
  traitValidation,
  rawCsvText,
  jsonData,
  onClose,
  onModalStepChange,
  onCsvColumnSelectionChange,
  onAttributeSelectionChange,
  onTraitValidationChange,
  onJsonDataChange,
  onSchemaValidationChange,
  onProceed
}: ModalProps) {
  if (!showModal) return null

  const handleNameColumnSelect = (columnName: string) => {
    if (!csvColumnSelection) return
    onCsvColumnSelectionChange({
      ...csvColumnSelection,
      nameColumn: columnName === '' ? null : columnName,
      step: 'attribute-selection'
    })
  }

  const handleAttributeColumnToggle = (columnName: string) => {
    if (!csvColumnSelection) return
    
    const isSelected = csvColumnSelection.attributeColumns.includes(columnName)
    onCsvColumnSelectionChange({
      ...csvColumnSelection,
      attributeColumns: isSelected
        ? csvColumnSelection.attributeColumns.filter(col => col !== columnName)
        : [...csvColumnSelection.attributeColumns, columnName]
    })
  }

  const handleCsvColumnSelectionContinue = async () => {
    if (!csvColumnSelection || !rawCsvText) return
    
    try {
      const data = parseCsvToJson(rawCsvText, csvColumnSelection)
      const validation = validateSchema(data)
      onSchemaValidationChange(validation)
      
      if (validation.isValid) {
        onJsonDataChange(data)
        
        // If only one possible attribute key, auto-select it and move to trait validation
        if (validation.possibleAttributeKeys.length === 1) {
          const selection = analyzeAttributeField(data, validation.possibleAttributeKeys[0])
          onAttributeSelectionChange(selection)
          
          // Validate traits
          const traitValidationResult = validateTraitTypes(data, validation.possibleAttributeKeys[0])
          onTraitValidationChange(traitValidationResult)
          onModalStepChange('trait-validation')
        } else {
          onModalStepChange('attribute-selection')
        }
      } else {
        onModalStepChange('validation')
      }
    } catch (error) {
      onSchemaValidationChange({
        isValid: false,
        itemCount: 0,
        sampleItem: null,
        possibleAttributeKeys: [],
        errors: [`Failed to parse CSV with selected columns: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
      onModalStepChange('validation')
    }
  }

  const handleCsvGoBack = () => {
    if (!csvColumnSelection) return
    onCsvColumnSelectionChange({
      ...csvColumnSelection,
      step: 'name-selection'
    })
  }

  const handleAttributeKeySelect = async (key: string) => {
    if (jsonData.length > 0) {
      const selection = analyzeAttributeField(jsonData, key)
      onAttributeSelectionChange(selection)
      
      // Validate traits for this key
      const traitValidationResult = validateTraitTypes(jsonData, key)
      onTraitValidationChange(traitValidationResult)
      onModalStepChange('trait-validation')
    }
  }

  const handleTraitTypeToggle = (traitType: string) => {
    if (!attributeSelection) return
    
    const isSelected = attributeSelection.selectedTraitTypes.includes(traitType)
    const newSelection = {
      ...attributeSelection,
      selectedTraitTypes: isSelected 
        ? attributeSelection.selectedTraitTypes.filter(t => t !== traitType)
        : [...attributeSelection.selectedTraitTypes, traitType]
    }
    onAttributeSelectionChange(newSelection)
  }

  const canProceed = attributeSelection && attributeSelection.selectedTraitTypes.length > 0
  
  const canContinueFromCsvSelection = csvColumnSelection && 
    csvColumnSelection.attributeColumns.length > 0

  // Get available columns for attribute selection (excluding name column and token ID)
  const getAvailableAttributeColumns = (): string[] => {
    if (!csvColumnSelection) return []
    return csvColumnSelection.headers.filter(header => 
      header !== csvColumnSelection.nameColumn && 
      header !== csvColumnSelection.tokenIdColumn
    )
  }

  const getModalTitle = () => {
    if (modalStep === 'validation') return 'Schema Verification'
    if (modalStep === 'csv-column-selection' && csvColumnSelection?.step === 'name-selection') return 'Select Token Name Column'
    if (modalStep === 'csv-column-selection' && csvColumnSelection?.step === 'attribute-selection') return 'Select Attribute Columns'
    if (modalStep === 'attribute-selection') return 'Select Attributes Field'
    if (modalStep === 'trait-validation') return 'Review Trait Types'
    if (modalStep === 'trait-selection') return 'Select Trait Types'
    return ''
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{getModalTitle()}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {modalStep === 'csv-column-selection' && csvColumnSelection && (
            <>
              {csvColumnSelection.step === 'name-selection' && (
                <>
                  <div className="step-description">
                    <p>First, select which column contains the token names (optional):</p>
                    {csvColumnSelection.tokenIdColumn && (
                      <div className="auto-detected">
                        ✓ Token ID column auto-detected: <strong>{csvColumnSelection.tokenIdColumn}</strong>
                      </div>
                    )}
                  </div>
                  
                  <div className="csv-column-selection">
                    <div className="no-name-option">
                      <button
                        className={`no-name-button ${csvColumnSelection.nameColumn === null ? 'selected' : ''}`}
                        onClick={() => handleNameColumnSelect('')}
                      >
                        <strong>No name column</strong>
                        <div className="option-description">Generate names automatically</div>
                      </button>
                    </div>
                    
                    <div className="column-preview">
                      <div className="column-headers clickable">
                        {csvColumnSelection.headers.map((header, index) => (
                          <div 
                            key={index} 
                            className={`column-header clickable ${csvColumnSelection.nameColumn === header ? 'selected' : ''}`}
                            onClick={() => handleNameColumnSelect(header)}
                          >
                            <div className="header-name">{header}</div>
                            <div className="header-sample">
                              Sample: {csvColumnSelection.sampleRows[0]?.[index] || '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {csvColumnSelection.step === 'attribute-selection' && (
                <>
                  <div className="step-description">
                    <p>Now select which columns contain the traits/attributes:</p>
                    <div className="selection-info">
                      {csvColumnSelection.nameColumn ? (
                        <div>Token names: <strong>{csvColumnSelection.nameColumn}</strong></div>
                      ) : (
                        <div>Token names: <strong>Auto-generated</strong></div>
                      )}
                      {csvColumnSelection.tokenIdColumn && (
                        <div>Token IDs: <strong>{csvColumnSelection.tokenIdColumn}</strong></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="csv-column-selection">
                    <div className="selection-controls">
                      <button 
                        className="btn-select-all"
                        onClick={() => onCsvColumnSelectionChange({
                          ...csvColumnSelection,
                          attributeColumns: getAvailableAttributeColumns()
                        })}
                      >
                        Select All
                      </button>
                      <button 
                        className="btn-select-none"
                        onClick={() => onCsvColumnSelectionChange({
                          ...csvColumnSelection,
                          attributeColumns: []
                        })}
                      >
                        Select None
                      </button>
                    </div>
                    
                    <div className="column-preview">
                      <div className="column-headers clickable">
                        {getAvailableAttributeColumns().map((header, index) => (
                          <div 
                            key={index} 
                            className={`column-header clickable ${csvColumnSelection.attributeColumns.includes(header) ? 'selected' : ''}`}
                            onClick={() => handleAttributeColumnToggle(header)}
                          >
                            <div className="header-name">{header}</div>
                            <div className="header-sample">
                              Sample: {csvColumnSelection.sampleRows[0]?.[csvColumnSelection.headers.indexOf(header)] || '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="selection-summary">
                      {csvColumnSelection.attributeColumns.length} attribute columns selected
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {modalStep === 'validation' && schemaValidation && (
            <>
              <div className="validation-status">
                <div className={`status-indicator ${schemaValidation.isValid ? 'valid' : 'invalid'}`}>
                  {schemaValidation.isValid ? '✓' : '✗'}
                </div>
                <div className="status-text">
                  {schemaValidation.isValid ? 'File Structure Valid' : 'Schema Issues Found'}
                </div>
              </div>

              <div className="validation-details">
                <div className="detail-item">
                  <span className="detail-label">Items Found:</span>
                  <span className="detail-value">{schemaValidation.itemCount.toLocaleString()}</span>
                </div>

                {schemaValidation.sampleItem && (
                  <div className="sample-item">
                    <div className="sample-label">Sample Item:</div>
                    <pre className="sample-json">
                      {JSON.stringify(schemaValidation.sampleItem, null, 2)}
                    </pre>
                  </div>
                )}

                {schemaValidation.errors.length > 0 && (
                  <div className="validation-errors">
                    <div className="errors-label">Issues:</div>
                    {schemaValidation.errors.map((error, index) => (
                      <div key={index} className="error-item">• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {modalStep === 'attribute-selection' && schemaValidation && (
            <>
              <div className="step-description">
                <p>Select which field contains the NFT attributes/traits:</p>
              </div>
              
              <div className="attribute-key-selection">
                {schemaValidation.possibleAttributeKeys.map((key) => (
                  <button
                    key={key}
                    className="attribute-key-button"
                    onClick={() => handleAttributeKeySelect(key)}
                  >
                    <div className="key-name">"{key}"</div>
                    <div className="key-preview">
                      {schemaValidation.sampleItem?.[key]?.length || 0} items
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {modalStep === 'trait-validation' && traitValidation && (
            <>
              <div className="step-description">
                <p>Review trait types and their unique values:</p>
                <div className="validation-summary">
                  Found {traitValidation.traitTypes.length} trait types
                </div>
              </div>
              
              <div className="trait-validation-list">
                {traitValidation.traitTypes.map((traitType) => (
                  <div key={traitType.name} className="trait-validation-item">
                    <div className="trait-validation-header">
                      <div className="trait-validation-info">
                        <div className="trait-validation-name">{traitType.name}</div>
                        <div className="trait-validation-stats">
                          {traitType.count} items, {traitType.totalValues} with values
                        </div>
                      </div>
                      <div className="trait-unique-count">
                        {traitType.uniqueValues.length} unique values
                      </div>
                    </div>
                    
                    {traitType.uniqueValues.length > 0 && (
                      <div className="trait-unique-values">
                        <div className="unique-values-label">Unique values:</div>
                        <div className="unique-values-list">
                          {traitType.uniqueValues.map((value, index) => (
                            <span key={index} className="unique-value">
                              {value}{index < traitType.uniqueValues.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {modalStep === 'trait-selection' && attributeSelection && (
            <>
              <div className="step-description">
                <p>Select which trait types to include in rarity calculation:</p>
                <div className="selected-field-info">
                  Using field: <strong>"{attributeSelection.selectedKey}"</strong>
                </div>
                <div className="trait-count-info">
                  <strong>Note:</strong> A "trait_count" meta-trait will be automatically added
                </div>
              </div>
              
              <div className="trait-type-selection">
                <div className="selection-controls">
                  <button 
                    className="btn-select-all"
                    onClick={() => onAttributeSelectionChange({
                      ...attributeSelection,
                      selectedTraitTypes: attributeSelection.availableTraitTypes
                    })}
                  >
                    Select All
                  </button>
                  <button 
                    className="btn-select-none"
                    onClick={() => onAttributeSelectionChange({
                      ...attributeSelection,
                      selectedTraitTypes: []
                    })}
                  >
                    Select None
                  </button>
                </div>
                
                <div className="trait-type-list">
                  {attributeSelection.availableTraitTypes.map((traitType) => (
                    <label key={traitType} className="trait-type-checkbox">
                      <input
                        type="checkbox"
                        checked={attributeSelection.selectedTraitTypes.includes(traitType)}
                        onChange={() => handleTraitTypeToggle(traitType)}
                      />
                      <span className="trait-type-name">{traitType}</span>
                    </label>
                  ))}
                </div>
                
                <div className="selection-summary">
                  {attributeSelection.selectedTraitTypes.length} of {attributeSelection.availableTraitTypes.length} trait types selected
                  {attributeSelection.selectedTraitTypes.length > 0 && ' + trait_count'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {modalStep === 'csv-column-selection' && csvColumnSelection?.step === 'name-selection' && (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={() => onCsvColumnSelectionChange({
                  ...csvColumnSelection,
                  step: 'attribute-selection'
                })}
              >
                Next: Select Attributes →
              </button>
            </>
          )}

          {modalStep === 'csv-column-selection' && csvColumnSelection?.step === 'attribute-selection' && (
            <>
              <button className="btn-secondary" onClick={handleCsvGoBack}>
                ← Back
              </button>
              <button 
                className="btn-primary" 
                onClick={handleCsvColumnSelectionContinue}
                disabled={!canContinueFromCsvSelection}
              >
                Continue →
              </button>
            </>
          )}

          {modalStep === 'validation' && schemaValidation && (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Select Different File
              </button>
              {schemaValidation.isValid && (
                <button className="btn-primary" onClick={() => onModalStepChange('attribute-selection')}>
                  Continue →
                </button>
              )}
            </>
          )}
          
          {modalStep === 'attribute-selection' && (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </>
          )}
          
          {modalStep === 'trait-validation' && (
            <>
              <button className="btn-secondary" onClick={() => onModalStepChange('attribute-selection')}>
                ← Back
              </button>
              <button className="btn-primary" onClick={() => onModalStepChange('trait-selection')}>
                Continue to Selection →
              </button>
            </>
          )}
          
          {modalStep === 'trait-selection' && (
            <>
              <button className="btn-secondary" onClick={() => onModalStepChange('trait-validation')}>
                ← Back
              </button>
              <button 
                className="btn-primary" 
                onClick={onProceed}
                disabled={!canProceed}
              >
                Calculate Rarity →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 