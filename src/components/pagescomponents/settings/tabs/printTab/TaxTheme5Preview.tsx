import { TaxTheme4Preview } from "./TaxTheme4Preview";

export function TaxTheme5Preview({ color }: { color?: string }) {
  // Tax Theme 5 is structurally identical to Tax Theme 4 in the reference images, 
  // with potentially only minor CSS/color changes. Reusing TaxTheme4Preview for now.
  return <TaxTheme4Preview color={color} />;
}
