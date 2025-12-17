
"use client";

import { useEffect } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

/**
 * A client component that listens for Firestore permission errors and displays
 * a detailed toast notification in development environments. This provides
 * immediate, rich feedback for debugging security rules.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(
        "Firestore Security Rule Error:",
        error.generateDebugMessage()
      );

      toast({
        variant: "destructive",
        title: "Firestore Permission Error",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white text-xs">
              {JSON.stringify(error.context, null, 2)}
            </code>
          </pre>
        ),
        duration: 20000, // Keep it on screen longer for debugging
      });
    };

    errorEmitter.on("permission-error", handleError);

    return () => {
      errorEmitter.off("permission-error", handleError);
    };
  }, [toast]);

  // This component does not render anything itself.
  return null;
}
