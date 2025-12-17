
/**
 * @fileoverview Defines custom error types for Firebase interactions.
 */

/**
 * The context for a Firestore security rule violation.
 * This provides detailed information for debugging permission errors.
 */
export type SecurityRuleContext = {
  path: string;
  operation: "get" | "list" | "create" | "update" | "delete";
  // The data being sent with a write/update/create request.
  requestResourceData?: any;
};

/**
 * A custom error class representing a Firestore permission-denied error.
 * It encapsulates rich contextual information about the failed request,
 * which is invaluable for debugging security rules.
 */
export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore permission denied for ${context.operation} on path: ${context.path}`;
    super(message);
    this.name = "FirestorePermissionError";
    this.context = context;

    // This is necessary for extending a built-in class like Error
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }

  /**
   * Generates a detailed debug message, typically for console logging.
   */
  public generateDebugMessage(): string {
    let message = `
    -------------------------------------------
    🔥 Firestore Security Rule Violation 🔥
    -------------------------------------------
    Operation: ${this.context.operation}
    Path: ${this.context.path}
    `;

    if (this.context.requestResourceData) {
      message += `
    Request Data: ${JSON.stringify(this.context.requestResourceData, null, 2)}
      `;
    }

    message += `
    -------------------------------------------
    Check your Firestore Security Rules to ensure this operation is allowed.
    `;

    return message;
  }
}
