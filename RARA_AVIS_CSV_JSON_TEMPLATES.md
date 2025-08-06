# Rara Avis Collection Templates

## Overview

These template files provide examples of the supported data formats for NFT collection rarity analysis. Use these templates as starting points for formatting your own collection data.

## Supported Formats

### 1. CSV Format

The CSV format provides a simple, spreadsheet-friendly approach for collection data.

**Template File:** [rara_avis-collection-template.csv](/templates/rara_avis-collection-template.csv)

**Structure:**
- Each row represents one NFT
- Each column represents a trait type
- First row contains trait type headers
- Empty cells represent missing/optional traits

**Example:**
```csv
Token ID,Background,Body,Eyes,Mouth,Hat,Costume
0,Ultramarine,Lava,Fury,Croc,,Adventurer
1,Sky,Ice,Hero,Sharp,,Office Worker
```

### 2. JSON Format

The JSON format supports rich metadata structure with nested attributes.

**Template File:** [rara_avis-collection-template.json](/templates/rara_avis-collection-template.json)

**Structure:**
- Each NFT is an object with metadata
- Traits are stored in a `tags` array (or other configurable attribute field)
- Each trait has a `trait_type` and `value`
- Supports empty trait values for optional attributes

**Example:**
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

## Getting Started

1. **Download a template** - Choose either CSV or JSON format based on your needs
2. **Replace sample data** - Update with your collection's actual trait data
3. **Upload to calculator** - Use the file drop zone on the main page
4. **Review and calculate** - Follow the guided setup process

## Tips

- Empty trait values are handled automatically
- The system will guide you through attribute field selection during upload

## Need Help?

If you encounter issues with the template formats, check the [Methodology](/methodology) page for detailed information about the rarity calculation process or reach out to us on X. 