"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast border border-border bg-white text-foreground shadow-lg rounded-xl",
          description: "text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground",
          cancelButton:
            "bg-secondary text-secondary-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
