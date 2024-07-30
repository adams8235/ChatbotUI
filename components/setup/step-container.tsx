import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { FC, useRef } from "react"

interface StepContainerProps {
  stepDescription: string
  stepTitle: string
  onShouldProceed: (shouldProceed: boolean) => void
  children?: React.ReactNode
}

export const StepContainer: FC<StepContainerProps> = ({
  stepDescription,
  stepTitle,
  onShouldProceed,
  children
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (buttonRef.current) {
        buttonRef.current.click()
      }
    }
  }

  return (
    <Card
      className="w-[600px] max-h-[calc(100vh-60px)] overflow-auto"
      onKeyDown={handleKeyDown}
    >
      <CardHeader>
        <CardTitle>
          <div>{stepTitle}</div>
        </CardTitle>

        <CardDescription>{stepDescription}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">{children}</CardContent>

      <CardFooter className="flex justify-end">
        <Button ref={buttonRef} size="sm" onClick={() => onShouldProceed(true)}>
          Start
        </Button>
      </CardFooter>
    </Card>
  )
}
