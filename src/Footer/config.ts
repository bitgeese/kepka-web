import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      defaultValue: [
        {
          link: {
            type: 'custom',
            label: 'INSTAGRAM',
            url: 'https://instagram.com'
          }
        },
        {
          link: {
            type: 'custom',
            label: 'TWITTER',
            url: 'https://twitter.com'
          }
        },
        {
          link: {
            type: 'custom',
            label: 'LINKEDIN',
            url: 'https://linkedin.com'
          }
        }
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'copyright',
      type: 'text',
      defaultValue: '© Jakub Kępka. All rights reserved.',
      admin: {
        position: 'sidebar',
      }
    }
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
