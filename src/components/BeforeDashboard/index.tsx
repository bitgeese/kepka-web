import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your portfolio dashboard</h4>
      </Banner>
      <div className="p-4 bg-black text-white rounded-md mb-4">
        <h3 className="text-xl mb-2 font-medium">KĘPKA | Artist & Fashion Designer</h3>
        <p className="text-sm text-gray-300 mb-3">Here&apos;s how to get started with your portfolio:</p>
      </div>
      
      <ul className={`${baseClass}__instructions`}>
        <li>
          {'Upload your artwork and fashion designs in the '}
          <strong>Media</strong>
          {' collection, organizing them by collections or series.'}
        </li>
        <li>
          {'Create exhibition pages and portfolio showcase pages using the '}
          <strong>Pages</strong>
          {' collection with the layout builder.'}
        </li>
        <li>
          {'Share news about your exhibitions and fashion collections through the '}
          <strong>Posts</strong>
          {' collection.'}
        </li>
        <li>
          {'Customize your site navigation and footer in the '}
          <strong>Globals</strong>
          {' section.'}
        </li>
      </ul>
      <div className="mt-4 text-sm text-gray-600 p-3 border border-gray-200 rounded">
        <p>
          <strong className="text-red-600">Artist&apos;s Note:</strong> This dashboard is fully customizable to match your unique artistic vision. You can modify any aspect of the site through the content collections.
        </p>
      </div>
    </div>
  )
}

export default BeforeDashboard
