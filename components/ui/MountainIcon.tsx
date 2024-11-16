// components/ui/MountainIcon.tsx

import { Icon, IconProps } from '@chakra-ui/react'
import { ReactElement } from 'react'

const MountainIcon = (props: IconProps): ReactElement => {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        d="M8 3l4 8 5-5 5 15H2L8 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}

export default MountainIcon
