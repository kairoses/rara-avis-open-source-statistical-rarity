# Rara Avis Statistical Rarity Calculation Methodology v1.0

## Table of Contents
1. [High-Level Overview](#high-level-overview)
2. [Detailed Methodology](#detailed-methodology)
3. [Technical Implementation](#technical-implementation)
4. [Example Calculation](#example-calculation)
5. [Key Features](#key-features)

## High-Level Overview

### What is Statistical Rarity?

Statistical rarity measures how rare an NFT is within its collection based on the frequency of its traits. The less common the trait, the higher the rarity score.

### Core Principle

The system uses a **frequency-inverse approach**: 
- Rare traits (appearing in few items) get high scores
- Common traits (appearing in many items) get low scores
- The total rarity score is the sum of all individual trait scores plus a meta "trait count" score

### Simple Formula

For each trait: `Rarity Score = Total Collection Size ÷ Number of Items with This Trait`

For the entire NFT: `Total Rarity Score = Sum of All Selected Trait Scores + Trait Count Score`

### Privacy & Data Processing

**All calculations are performed locally in your browser.** Your NFT collection data never leaves your device or gets sent to our servers. The entire rarity analysis process runs client-side using JavaScript, ensuring complete privacy and data security. This means:

- No data uploads to external servers
- No risk of data breaches or unauthorized access
- Instant processing without network delays
- Complete control over your collection data

---

## Detailed Methodology

### Phase 1: Data Analysis and Counting

#### 1.1 Trait Discovery
- Scans all NFTs in the collection to identify available trait types
- Extracts trait values from the specified attribute field (e.g., "attributes", "traits")
- Handles multiple field name formats: `trait_type`, `traitType`, `type`, `name`
- Handles multiple value field formats: `value`, `val`, `trait_value`

#### 1.2 Trait Value Counting
For each trait type and value combination:
```
trait_value_count[trait_type][value] = number of NFTs with this exact trait value
```

#### 1.3 Trait Count Meta-Trait
Counts how many NFTs have each number of selected traits:
```
trait_count_frequency[count] = number of NFTs with exactly 'count' selected traits
```

**Important**: Only selected traits contribute to the trait count calculation, but ALL traits are analyzed.

### Phase 2: Rarity Score Calculation

#### 2.1 Individual Trait Rarity
For each trait in an NFT:
```
trait_rarity_score = collection_size ÷ trait_value_count[trait_type][value]
```

**Example**: If a collection has 10,000 NFTs and only 50 have "Red Eyes":
```
Red Eyes rarity score = 10,000 ÷ 50 = 200
```

#### 2.2 Trait Count Rarity
For the number of traits an NFT has:
```
trait_count_rarity_score = collection_size ÷ trait_count_frequency[selected_trait_count]
```

**Example**: If 100 NFTs have exactly 7 traits:
```
7-trait rarity score = 10,000 ÷ 100 = 100
```

#### 2.3 Total Rarity Score
```
total_rarity_score = sum(selected_trait_rarity_scores) + trait_count_rarity_score
```

**Key Point**: Only traits selected by the user contribute to the total score.

### Phase 3: Ranking

#### 3.1 Sorting
NFTs are sorted by total rarity score in descending order (highest score = rarest = rank #1).

#### 3.2 Tie Handling
When multiple NFTs have identical rarity scores:
- They receive the same rank
- The next rank skips the appropriate number of positions
- Example: If 3 NFTs tie for rank #5, the next NFT gets rank #8

---

## Technical Implementation

### Data Structure

```typescript
interface NFTWithRarity {
  item: NFTItem                    // Original NFT data
  index: number                    // Original position in dataset
  rarityScore: number              // Total calculated rarity score
  rank: number                     // Final ranking (1 = rarest)
  traits: {                       // All trait information
    [traitType: string]: {
      value: string | number       // Trait value
      rarityScore: number          // Individual trait rarity score
      count: number                // How many NFTs have this trait value
      percentage: number           // Percentage of collection with this trait
    }
  }
}
```

### Processing Flow

1. **Initialization**: Create empty counting structures for all trait types
2. **First Pass**: Count all trait value occurrences and trait count frequencies
3. **Second Pass**: Calculate rarity scores for each NFT
4. **Sorting**: Sort by total rarity score (descending)
5. **Ranking**: Assign ranks handling ties appropriately

### Performance Optimizations

- **Chunked Processing**: Updates progress every 50-100 items during calculation
- **Efficient Counting**: Single pass through data for counting, single pass for scoring
- **Memory Management**: Uses JavaScript's native sorting for final ranking

---

## Example Calculation

### Sample Collection
Let's say we have a 1,000 NFT collection with these traits:

| NFT | Background | Eyes | Hat |
|-----|------------|------|-----|
| #1  | Blue       | Red  | Cap |
| #2  | Blue       | Blue | None|
| #3  | Red        | Red  | Cap |
| ... | ...        | ...  | ... |

### Trait Frequencies
- Blue Background: 400 NFTs (40%)
- Red Background: 600 NFTs (60%)
- Red Eyes: 50 NFTs (5%)
- Blue Eyes: 950 NFTs (95%)
- Cap: 200 NFTs (20%)
- No Hat: 800 NFTs (80%)

### NFT #1 Calculation
Selected traits: Background, Eyes, Hat

**Individual Trait Scores:**
- Blue Background: 1,000 ÷ 400 = 2.5
- Red Eyes: 1,000 ÷ 50 = 20.0
- Cap: 1,000 ÷ 200 = 5.0

**Trait Count Score:**
- NFT #1 has 3 traits
- Let's say 300 NFTs have exactly 3 traits
- Trait count score: 1,000 ÷ 300 = 3.33

**Total Rarity Score:**
```
2.5 + 20.0 + 5.0 + 3.33 = 30.83
```

---

## Key Features

### 1. Flexible Trait Selection
- Users can choose which trait types to include in rarity calculation
- Excluded traits are still analyzed and displayed but don't contribute to the total score
- This allows for focused rarity analysis on specific trait categories

### 2. Comprehensive Data Export
The system exports detailed CSV files including:
- Token identification (ID, name)
- Statistical rarity score and rank
- Placeholder columns for aesthetic rarity (pro feature)
- Individual trait values, counts, and scores for all traits
- Excluded traits show empty score columns

### 3. Trait Count Meta-Analysis
- Automatically includes a "trait_count" meta-trait
- Accounts for the rarity of having a specific number of traits
- Helps identify NFTs that are rare due to being "complete" or "minimal"

### 4. Precision and Accuracy
- Maintains full JavaScript numerical precision to 10 decimals during calculations
- Only rounds values for display purposes
- Handles large collections efficiently
- Accurate tie-breaking in rankings

### 5. Multiple Data Formats
- Supports both JSON and CSV input formats
- Auto-detects common field naming conventions
- Flexible column mapping for CSV files
- Handles missing or empty trait values gracefully

### 6. Real-time Progress Tracking
- Shows calculation progress with detailed phase information
- Provides time estimates for large collections
- Non-blocking UI updates during processing

This methodology ensures accurate, transparent, and comprehensive rarity analysis that can handle collections of various sizes and trait structures while providing detailed insights into what makes each NFT statistically rare. 