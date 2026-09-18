import { toast } from "sonner";

type CreditGateOptions = {
  balance: number;
  required?: number;
  isFreeAllowed?: boolean;
  navigate: (options: { to: "/wallet" }) => unknown;
  context?: string;
};

/**
 * Shared client-side guard for paid actions. The worker remains authoritative
 * for the final balance check and credit deduction.
 */
export function checkCreditGate({
  balance,
  required = 1,
  isFreeAllowed = false,
  navigate,
}: CreditGateOptions): boolean {
  if (isFreeAllowed || balance >= required) return true;

  toast.error(`You need ${required} credit${required === 1 ? "" : "s"} to continue.`);
  navigate({ to: "/wallet" });
  return false;
}
