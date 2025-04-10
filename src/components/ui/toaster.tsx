
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
        // Determine which icon to use based on toast title or variant
        const isSuccess = title?.toString().toLowerCase().includes("สำเร็จ") || 
                         description?.toString().toLowerCase().includes("สำเร็จ") ||
                         title?.toString().toLowerCase().includes("success");
                         
        const isWarning = title?.toString().toLowerCase().includes("warning") || 
                         title?.toString().toLowerCase().includes("เตือน") ||
                         description?.toString().toLowerCase().includes("เตือน");
                         
        const isInfo = !isSuccess && !isWarning && 
                      !variant?.toString().includes("destructive") &&
                      (title?.toString().toLowerCase().includes("info") || 
                       title?.toString().toLowerCase().includes("กำลัง"));
                       
        const Icon = variant === "destructive" 
          ? AlertCircle 
          : isWarning
            ? AlertTriangle 
            : isSuccess
              ? CheckCircle 
              : Info
              
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex gap-3">
              {Icon && (
                <Icon className={`h-5 w-5 ${
                  variant === "destructive" 
                    ? "text-destructive-foreground" 
                    : isSuccess
                      ? "text-green-600"
                      : isWarning
                        ? "text-yellow-600"
                        : "text-blue-600"
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
