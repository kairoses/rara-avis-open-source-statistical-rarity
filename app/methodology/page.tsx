import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import rehypeSlug from 'rehype-slug'

export default function MethodologyPage() {
    // Read the markdown file at build time
    const methodologyPath = path.join(process.cwd(), 'RARA_AVIS_STATISTICAL_RARITY_METHODOLOGY.md')
    const methodologyContent = fs.readFileSync(methodologyPath, 'utf8')
    
    // Get the file's last modified date
    const stats = fs.statSync(methodologyPath)
    const lastModified = stats.mtime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  
    // Insert the last updated date after the main header
    const contentWithDate = methodologyContent.replace(
      /^(# Rara Avis Statistical Rarity Calculation Methodology v1\.0)\n/,
      `$1\n*Last Updated: ${lastModified}*\n`
    )

  return (
    <main className="methodology-page">
      <div className="methodology-container">
        <div className="methodology-content">
          <ReactMarkdown rehypePlugins={[rehypeSlug]}>
            {contentWithDate}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  )
} 