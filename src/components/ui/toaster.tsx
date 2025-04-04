
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = variant === "destructive" 
          ? AlertCircle 
          : title?.toString().toLowerCase().includes("warning") 
            ? AlertTriangle 
            : title?.toString().toLowerCase().includes("success") 
              ? CheckCircle 
              : Info
              
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex gap-3">
              {Icon && (
                <Icon className={`h-5 w-5 ${
                  variant === "destructive" 
                    ? "text-destructive-foreground" 
                    : "text-foreground"
                }`} />
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
