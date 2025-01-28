// components/Banner.tsx

"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

interface BannerProps {
  title: string
  description: string
  buttonText: string
  buttonLink?: string // Make buttonLink optional
  onButtonClick?: () => void // Optional click handler
  variant?: "primary" | "secondary"
  icon?: React.ReactNode // Optional: For adding icons if needed
}

const Banner: React.FC<BannerProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick,
  variant = "primary",
  icon,
}) => {
  return (
    <motion.div
      className={`w-full py-8 px-4 md:px-8 ${
        variant === "primary" ? "bg-gradient-to-r from-blue-500 to-cyan-600" : "bg-gradient-to-r from-gray-700 to-gray-900"
      } text-white flex flex-col md:flex-row items-center justify-between rounded-lg shadow-lg my-8`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {icon && <div className="mr-4">{icon}</div>}
      <div className="mb-4 md:mb-0 ">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-lg">{description}</p>
      </div>
      {buttonLink ? (
        <Link href={buttonLink} className="flex-shrink-0">
          <Button
            variant={variant === "primary" ? "default" : "outline"}
            size="lg"
            className="whitespace-nowrap"
          >
            {buttonText}
          </Button>
        </Link>
      ) : onButtonClick ? (
        <Button
          variant={variant === "primary" ? "default" : "outline"}
          size="lg"
          className="whitespace-nowrap"
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      ) : null}
    </motion.div>
  )
}

export default Banner
