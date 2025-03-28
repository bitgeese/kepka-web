import Script from 'next/script'
import React from 'react'

import { themeLocalStorageKey } from '../ThemeSelector/types'

export const InitTheme: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  (function () {
    // Always set theme to dark
    var themeToSet = 'dark'
    
    // Store in localStorage to persist
    window.localStorage.setItem('${themeLocalStorageKey}', themeToSet)
    
    // Apply to document
    document.documentElement.setAttribute('data-theme', themeToSet)
  })();
  `,
      }}
      id="theme-script"
      strategy="beforeInteractive"
    />
  )
}
