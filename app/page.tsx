'use client'

import { useState, useEffect } from 'react'
import FileDropZone from '../components/rarity/FileDropZone'
import CalculationProgressView from '../components/rarity/CalculationProgress'
import RarityResults from '../components/rarity/RarityResults'
import Modal from '../components/rarity/Modal'
import EmailCapture from '../components/EmailCapture'
import { 
  NFTItem, 
  SchemaValidation, 
  AttributeFieldSelection, 
  CsvColumnSelection, 
  TraitValidation, 
  NFTWithRarity, 
  CalculationProgress 
} from '../components/rarity/types'
import { 
  validateSchema, 
  parseCsvForColumnSelection, 
  analyzeAttributeField, 
  validateTraitTypes, 
  calculateRarity 
} from '../components/rarity/utils'

type ModalStep = 'validation' | 'csv-column-selection' | 'attribute-selection' | 'trait-validation' | 'trait-selection'

export default function RarityPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState<NFTItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [schemaValidation, setSchemaValidation] = useState<SchemaValidation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('validation')
  const [attributeSelection, setAttributeSelection] = useState<AttributeFieldSelection | null>(null)
  const [traitValidation, setTraitValidation] = useState<TraitValidation | null>(null)
  const [csvColumnSelection, setCsvColumnSelection] = useState<CsvColumnSelection | null>(null)
  const [rawCsvText, setRawCsvText] = useState<string>('')
  
  // Rarity calculation states
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState<CalculationProgress | null>(null)
  const [rarityResults, setRarityResults] = useState<NFTWithRarity[]>([])
  const [showResults, setShowResults] = useState(false)

  const processFile = async (file: File) => {
    setIsProcessing(true)
    
    try {
      const text = await file.text()
      let data: NFTItem[]
      
      // Handle different file types
      if (file.name.toLowerCase().endsWith('.csv')) {
        // For CSV, first show column selection
        setRawCsvText(text)
        const columnSelection = parseCsvForColumnSelection(text)
        setCsvColumnSelection(columnSelection)
        setModalStep('csv-column-selection')
        setShowModal(true)
        return
      } else {
        // Assume JSON
        data = JSON.parse(text)
      }
      
      const validation = validateSchema(data)
      setSchemaValidation(validation)
      
      if (validation.isValid) {
        setJsonData(data)
        
        // If only one possible attribute key, auto-select it and move to trait validation
        if (validation.possibleAttributeKeys.length === 1) {
          const selection = analyzeAttributeField(data, validation.possibleAttributeKeys[0])
          setAttributeSelection(selection)
          
          // Validate traits
          const traitValidationResult = validateTraitTypes(data, validation.possibleAttributeKeys[0])
          setTraitValidation(traitValidationResult)
          setModalStep('trait-validation')
        } else {
          setModalStep('attribute-selection')
        }
      } else {
        setModalStep('validation')
      }
      
      setShowModal(true)
    } catch (error) {
      setSchemaValidation({
        isValid: false,
        itemCount: 0,
        sampleItem: null,
        possibleAttributeKeys: [],
        errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
      setModalStep('validation')
      setShowModal(true)
    } finally {
      setIsProcessing(false)
    }
  }

  // Process file when selected
  useEffect(() => {
    if (selectedFile && !isProcessing) {
      processFile(selectedFile)
    }
  }, [selectedFile])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setModalStep('validation')
    setAttributeSelection(null)
    setTraitValidation(null)
    setCsvColumnSelection(null)
    setRawCsvText('')
    
    // Always clear the selected file when modal is closed
    setSelectedFile(null)
    setJsonData([])
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleProceed = async () => {
    setShowModal(false)
    
    if (!attributeSelection || jsonData.length === 0) return
    
    setIsCalculating(true)
    setShowResults(false)
    
    try {
      const results = await calculateRarity(
        jsonData,
        attributeSelection.selectedKey,
        attributeSelection.selectedTraitTypes,
        setCalculationProgress
      )
      
      setRarityResults(results)
      setShowResults(true)
    } catch (error) {
      console.error('Error calculating rarity:', error)
      // TODO: Show error message to user
    } finally {
      setIsCalculating(false)
      setCalculationProgress(null)
    }
  }

  const handleStartOver = () => {
    setShowResults(false)
    setRarityResults([])
    setSelectedFile(null)
    setJsonData([])
    setAttributeSelection(null)
    setTraitValidation(null)
    setCsvColumnSelection(null)
    setRawCsvText('')
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  // Show results view
  if (showResults && rarityResults.length > 0) {
    return (
      <RarityResults
        rarityResults={rarityResults}
        attributeSelection={attributeSelection}
        traitValidation={traitValidation}
        onStartOver={handleStartOver}
      />
    )
  }

  // Show calculation progress
  if (isCalculating && calculationProgress) {
    return <CalculationProgressView calculationProgress={calculationProgress} />
  }

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
        {/* Top Section - Main Content */}
        <div className="top-section">
          {/* Header Text */}
          <div className="rarity-header">
            <h1 className="rarity-main-title">
              OPEN-SOURCE RARITY MADE SIMPLE
            </h1>
          </div>

          {/* File Drop Zone */}
          <FileDropZone
            selectedFile={selectedFile}
            isProcessing={isProcessing}
            onFileSelect={handleFileSelect}
          />

          {/* Link Buttons */}
          <div className="link-buttons-container">
        
            <a 
              href="/methodology" 
              target="_self"
              className="link-btn link-btn-left"
              title="View methodology documentation"
            >
              <span className="link-btn-text">Methodology</span>
            </a>
            <a 
              href="https://github.com/yourusername/rara_avis_v4" 
              target="_blank"
              rel="noopener noreferrer"
              className="link-btn link-btn-middle"
              title="View source code on GitHub"
            >
              <span className="link-btn-text">Github</span>
            </a>
            <a 
              href="/templates" 
              className="link-btn link-btn-right"
              title="View template files"
            >
              <span className="link-btn-text">Templates</span>
            </a>
          </div>
        </div>

        {/* Bottom Section - Email Capture and Footer */}
        <div className="bottom-section">
          {/* Email Capture */}
          <EmailCapture />

          {/* Footer Text */}
          <div className="rarity-info">

          </div>
        </div>
      </div>

      <Modal
        showModal={showModal}
        modalStep={modalStep}
        schemaValidation={schemaValidation}
        csvColumnSelection={csvColumnSelection}
        attributeSelection={attributeSelection}
        traitValidation={traitValidation}
        rawCsvText={rawCsvText}
        jsonData={jsonData}
        onClose={handleModalClose}
        onModalStepChange={setModalStep}
        onCsvColumnSelectionChange={setCsvColumnSelection}
        onAttributeSelectionChange={setAttributeSelection}
        onTraitValidationChange={setTraitValidation}
        onJsonDataChange={setJsonData}
        onSchemaValidationChange={setSchemaValidation}
        onProceed={handleProceed}
      />
    </main>
  )
}