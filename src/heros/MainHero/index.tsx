'use client'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { useHeaderTheme } from '@/providers/HeaderTheme'

export const MainHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    // Set header theme to dark for better contrast
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  return (
    <div className="relative py-16" data-theme="dark">
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Content section */}
        <div className="flex flex-col space-y-6">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Media section - no padding, no rounded corners, no shadows */}
        <div className="relative h-[400px]">
          {media && typeof media === 'object' && (
            <Media fill imgClassName="object-cover" priority resource={media} />
          )}
        </div>
      </div>
    </div>
  )
} 