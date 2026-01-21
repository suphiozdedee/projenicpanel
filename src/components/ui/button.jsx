
import * as React from "react"
import { MasterButton, buttonVariants } from "@/components/MasterButton"

// Re-export MasterButton as Button for compatibility with existing codebase
// This ensures all existing Button imports use the new styles and logic
const Button = MasterButton

export { Button, buttonVariants }
