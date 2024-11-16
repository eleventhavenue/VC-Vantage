// components/ui/Accordion.tsx

import React, { FC } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

interface AccordionItemProps {
  title: string
  children: React.ReactNode
}

const Accordion: FC<AccordionProps> = ({ children, className }) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  )
}

const AccordionItem: FC<AccordionItemProps> = ({ title, children }) => {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-blue-900 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span>{title}</span>
            <ChevronUpIcon
              className={`w-5 h-5 text-blue-500 transition-transform duration-200 ${
                open ? 'transform rotate-180' : ''
              }`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
            {children}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export { Accordion, AccordionItem }
