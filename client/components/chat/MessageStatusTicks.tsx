import { Check, CheckCheck } from "lucide-react";
import { MessageStatus } from "../../types";

export function MessageStatusTicks({ status }: { status: MessageStatus }) {
  if (status === "READ") {
    return <CheckCheck className="h-4 w-4 text-blue-400" aria-label="Read" />;
  }
  if (status === "DELIVERED") {
    return <CheckCheck className="h-4 w-4 text-gray-400" aria-label="Delivered" />;
  }
  return <Check className="h-4 w-4 text-gray-400" aria-label="Sent" />;
}
