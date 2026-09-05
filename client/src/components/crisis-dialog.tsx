import { LifeBuoy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * The crisis numbers also sit in the footer, but a reader who needs them is
 * usually part-way down a twelve-thousand-word chapter about the thing that
 * just landed on them. This puts them one keystroke away from every page
 * instead of one long scroll.
 */
const lines = [
  {
    name: "988 Suicide & Crisis Lifeline",
    contact: "Call or text 988",
    href: "tel:988",
    note: "24/7, free, across the United States. Press 1 for the Veterans Crisis Line.",
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    href: "sms:741741",
    note: "If talking out loud is not possible right now.",
  },
  {
    name: "SAMHSA National Helpline",
    contact: "1-800-662-4357",
    href: "tel:18006624357",
    note: "Treatment referral and information for substance use and mental health.",
  },
  {
    name: "National Domestic Violence Hotline",
    contact: "1-800-799-7233",
    href: "tel:18007997233",
    note: "Also at thehotline.org, which has a quick-exit button.",
  },
];

export function CrisisDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" />
            If you need help right now
          </DialogTitle>
          <DialogDescription>
            You do not have to be in danger to call. Not knowing what else to do is reason
            enough.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-4">
          {lines.map((line) => (
            <li key={line.name}>
              <p className="font-medium">{line.name}</p>
              <a
                href={line.href}
                className="text-primary underline underline-offset-2"
                data-testid={`crisis-${line.href}`}
              >
                {line.contact}
              </a>
              <p className="text-sm text-muted-foreground">{line.note}</p>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground border-t pt-4">
          These numbers are for the United States. Elsewhere,{" "}
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2"
          >
            findahelpline.com
          </a>{" "}
          lists services by country. If someone is in immediate physical danger, call your
          local emergency number.
        </p>
      </DialogContent>
    </Dialog>
  );
}
