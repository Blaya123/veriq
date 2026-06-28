"use client";

import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
      }}
      richColors
      closeButton
      {...props}
    />
  );
}

export { Toaster };
export { toast } from "sonner";
