"use client"

import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean
}

export function SubmitButton({ loading, children, disabled, ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
