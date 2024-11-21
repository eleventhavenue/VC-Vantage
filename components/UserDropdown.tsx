// components/UserDropdown.tsx

'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, Settings, LogOut } from 'lucide-react'
import { useSession, signOut } from "next-auth/react"

export default function UserDropdown() {
  const { data: session } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Avatar>
            <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
            <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white shadow-lg rounded-md border border-gray-200" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-900">{session?.user?.name || "User"}</p>
            <p className="text-xs text-gray-500">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center w-full hover:bg-gray-100 p-2 rounded-md">
            <User className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center w-full hover:bg-gray-100 p-2 rounded-md">
            <Settings className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ callbackUrl: '/auth' })} className="cursor-pointer flex items-center hover:bg-gray-100 p-2 rounded-md">
          <LogOut className="mr-2 h-4 w-4 text-gray-600" />
          <span className="text-gray-700">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
