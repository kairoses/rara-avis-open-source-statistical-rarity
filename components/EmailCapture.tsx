'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [fingerprint, setFingerprint] = useState('')

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        // Create a hash-based fingerprint instead of storing raw data
        const data = {
          ua: navigator.userAgent.slice(0, 100), // Truncate user agent
          lang: navigator.language,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: `${screen.width}x${screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          platform: navigator.platform,
          cookie: navigator.cookieEnabled,
          canvas: getCanvasFingerprint(),
          webgl: getWebGLFingerprint()
        }

        // Create a simple hash of the data instead of base64 encoding everything
        const fingerprint = await simpleHash(JSON.stringify(data))
        setFingerprint(fingerprint)
      } catch (error) {
        console.warn('Fingerprinting failed:', error)
        // Fallback fingerprint
        setFingerprint(`fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      }
    }

    const getCanvasFingerprint = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return 'no-canvas'
        
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('fingerprint', 2, 2)
        
        // Return just a short hash of the canvas data instead of the full data URL
        return canvas.toDataURL().slice(-20) // Just last 20 chars
      } catch {
        return 'canvas-error'
      }
    }

    const getWebGLFingerprint = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl')
        if (!gl) return 'no-webgl'
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        const renderer = debugInfo ? 
          gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'
        
        // Return just a hash of the renderer string
        return renderer.slice(0, 20) // Truncate to 20 chars
      } catch {
        return 'webgl-error'
      }
    }

    const simpleHash = async (str: string): Promise<string> => {
      // Simple hash function using Web Crypto API
      const encoder = new TextEncoder()
      const data = encoder.encode(str)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32) // 32 char hash
    }

    generateFingerprint()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!fingerprint) {
      setError('Security check in progress, please wait...')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { error: supabaseError } = await supabase
        .from('email_signups')
        .insert([{ 
          email,
          fingerprint,
          user_agent: navigator.userAgent.slice(0, 200), // Truncate user agent
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }])

      if (supabaseError) {
        if (supabaseError.code === '23505') {
          setError('This email is already subscribed')
        } else if (supabaseError.message.includes('rate_limit')) {
          setError('Too many attempts. Please try again in a few minutes.')
        } else {
          setError('Something went wrong. Please try again.')
        }
        if (process.env.NODE_ENV === 'development') {
          console.error('Supabase error:', supabaseError)
        }
      } else {
        setIsSubmitted(true)
        setEmail('')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="email-capture-container">
        <div className="email-capture-success">
          <div className="email-capture-success-icon">✓</div>
          <div className="email-capture-success-text">
            Thanks for subscribing! We'll keep you updated.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="email-capture-container">
      <div className="email-capture-header">
        <p className="email-capture-subtitle">
          EMAIL SUBSCRIBERS GET FIRST ACCESS TO NEW FEATURES
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="email-capture-form">
        <div className="email-capture-input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="enter your email"
            className="email-capture-input"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !fingerprint}
            className="email-capture-button"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        
        {error && (
          <div className="email-capture-error">
            {error}
          </div>
        )}
      </form>
    </div>
  )
} 