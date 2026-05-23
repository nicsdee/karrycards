declare module "lucide-react" {
  import type { FC, SVGProps } from "react";

  export type LucideIcon = FC<
    SVGProps<SVGSVGElement> & {
      absoluteStrokeWidth?: boolean;
      color?: string;
      size?: number | string;
      strokeWidth?: number | string;
    }
  >;

  export const ArrowRight: LucideIcon;
  export const BadgeCheck: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Clock3: LucideIcon;
  export const CreditCard: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Gift: LucideIcon;
  export const LockKeyhole: LucideIcon;
  export const Mail: LucideIcon;
  export const Menu: LucideIcon;
  export const Minus: LucideIcon;
  export const Plus: LucideIcon;
  export const Search: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const ShoppingCart: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Star: LucideIcon;
  export const Tag: LucideIcon;
  export const Trash2: LucideIcon;
  export const Truck: LucideIcon;
  export const WalletCards: LucideIcon;
  export const X: LucideIcon;
}
