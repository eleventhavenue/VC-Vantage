import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"

interface ExecutiveProfileProps {
  name: string
  role: string
  description?: string
}

export function ExecutiveProfile({ name, role, description }: ExecutiveProfileProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">{name}</CardTitle>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-sm">{description}</p>
        </CardContent>
      )}
    </Card>
  )
}

