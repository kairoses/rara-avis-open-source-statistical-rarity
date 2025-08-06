# Rara Avis - Open-Source Rarity Made Simple

A privacy-first, browser-based tool for calculating statistical rarity scores for NFT PFP (Profile Picture) collections. All calculations are performed locally in your browser - your collection data never leaves your device.

Our open-source rarity calculator provides clear and simple statistical rarity calculations for NFT collections using a frequency-inverse approach. The rarer a trait, the higher its score. The tool helps collectors, creators, and traders understand the true statistical rarity of their NFTs based on trait frequency analysis including meta trait counts.

## 🔒 Privacy-First Design

**Your data stays on your device.** All rarity calculations are performed locally in your browser using JavaScript. No uploads, no servers, no data breaches - just instant, secure analysis of your NFT collection data.

## ✨ Key Features

- **🏠 Local Processing**: All calculations happen in your browser - no data ever leaves your device
- **📊 Statistical Accuracy**: Uses proven frequency-inverse methodology for precise rarity scoring
- **🎛️ Flexible Trait Selection**: Choose which traits to include in your rarity calculations
- **📁 Multiple Formats**: Supports both CSV and JSON collection data formats
- **📈 Real-time Progress**: Live updates during calculation with detailed progress tracking
- **💾 Comprehensive Export**: Detailed CSV export with individual trait scores and rankings
- **🎯 Tie Handling**: Proper ranking system that handles identical rarity scores correctly

## 🚀 How It Works

### Simple Formula
```
Trait Rarity Score = Collection Size ÷ Number of Items with This Trait
Total NFT Score = Sum of Selected Trait Scores + Trait Count Score
```

### Example
In a 10,000 NFT collection:
- If only 50 NFTs have "Red Eyes": Red Eyes score = 10,000 ÷ 50 = 200
- If only 100 NFTs have exactly 7 traits: 7-trait count score = 10,000 ÷ 100 = 100

## 📋 Getting Started

### 1. Prepare Your Data
Use one of our template formats:
- **CSV Format**: Simple spreadsheet with traits as columns ([template](public/templates/rara_avis-collection-template.csv))
- **JSON Format**: Rich metadata structure with nested attributes ([template](public/templates/rara_avis-collection-template.json))

### 2. Upload Your Collection
- Drag and drop your file into the upload zone
- The system auto-detects your data format and structure
- Follow the guided setup to map your trait fields

### 3. Configure Analysis
- Select which trait types to include in rarity calculations
- Preview your data structure and trait distributions
- Excluded traits are still analyzed but don't affect scores

### 4. Calculate & Export
- Watch real-time progress as calculations run locally
- Review detailed results with individual trait breakdowns
- Export comprehensive CSV with all rarity data

## 📊 Data Format Examples

### CSV Format
```csv
Token ID,Background,Body,Eyes,Mouth,Hat,Costume
0,Ultramarine,Lava,Fury,Croc,,Adventurer
1,Sky,Ice,Hero,Sharp,,Office Worker
```

### JSON Format
```json
{
  "name": "3721",
  "image": "punk3721.png",
  "tags": [
    {
      "trait_type": "Type",
      "value": "Female"
    },
    {
      "trait_type": "Eyes", 
      "value": "Green Eye Shadow"
    }
  ]
}
```

## 🧮 Statistical Methodology

Our rarity calculation uses a **frequency-inverse approach** with these key principles:

- **Rare traits get high scores**: Less common = higher rarity score
- **Common traits get low scores**: More common = lower rarity score  
- **Trait count matters**: Having an unusual number of traits affects rarity
- **Transparent calculation**: Every score is fully explainable and verifiable

For complete technical details, see our [Statistical Rarity Methodology](RARA_AVIS_STATISTICAL_RARITY_METHODOLOGY.md).

## 📁 Template Files

We provide ready-to-use templates to help format your collection data:

- [CSV Template](public/templates/rara_avis-collection-template.csv) - Simple spreadsheet format
- [JSON Template](public/templates/rara_avis-collection-template.json) - Rich metadata format

See [Template Documentation](RARA_AVIS_CSV_JSON_TEMPLATES.md) for detailed formatting guidelines.

## 🔧 Technical Features

- **Chunked Processing**: Smooth progress updates for large collections
- **Memory Efficient**: Optimized for collections of any size
- **Precision Handling**: Maintains full numerical precision during calculations
- **Format Flexibility**: Auto-detects common field naming conventions
- **Error Handling**: Graceful handling of missing or malformed data

## 🎨 Use Cases

- **Creators**: Analyze trait distribution in your collection
- **Collectors**: Verify the rarity of NFTs before buying or selling
- **Traders**: Make informed decisions based on statistical rarity
- **Researchers**: Study trait frequency patterns across collections
- **Marketplaces**: Provide consistent and accurate rarity data to users

## 🌐 Browser Compatibility

Works in all modern browsers with JavaScript enabled. No plugins or extensions required.

## 📞 Support

- **Documentation**: Check our methodology and template guides
- **Issues**: Report bugs or request features via GitHub issues
- **Community**: Follow us on [X](https://x.com/raraavisapp) for updates and support

## 📄 License

This project is open source and licensed under the [Apache License 2.0](LICENSE). You are free to use, modify, and distribute this software in accordance with the license terms.

## 🔮 Future Features

- Aesthetic rarity analysis featuring thematic rarity
- Visual collection QA tools
- Advanced filtering and sorting options

---

*Rara Avis is a product of Kai Roses, Inc. Essential tools for creators and collectors.*
