import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
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
            label: 'HOME',
            url: '/'
          }
        },
        {
          link: {
            type: 'custom',
            label: 'PORTFOLIO',
            url: '/portfolio'
          }
        },
        {
          link: {
            type: 'custom',
            label: 'COLLECTIONS',
            url: '/collections'
          }
        },
        {
          link: {
            type: 'custom',
            label: 'EXHIBITIONS',
            url: '/exhibitions'
          }
        },
        {
          link: {
            type: 'custom',
            label: 'ABOUT',
            url: '/about'
          }
        },
        {
          link: {
            type: 'custom',
            label: 'CONTACT',
            url: '/contact'
          }
        }
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
