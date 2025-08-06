import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import rehypeSlug from 'rehype-slug'

export default function TemplatesPage() {
    // Read the markdown file at build time
    const templatesPath = path.join(process.cwd(), 'RARA_AVIS_CSV_JSON_TEMPLATES.md')
    const templatesContent = fs.readFileSync(templatesPath, 'utf8')
    
    // Get the file's last modified date
    const stats = fs.statSync(templatesPath)
    const lastModified = stats.mtime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  
    // Insert the last updated date after the main header
    const contentWithDate = templatesContent.replace(
      /^(# Rara Avis Collection Templates)\n/,
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