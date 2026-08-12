import { Theme1Preview } from "./Theme1Preview";

export function Theme3Preview({ color }: { color?: string }) {
  // Theme 3 is visually grouped as a minor variation of Theme 1/2 in the user's intent.
  // Given no explicit screenshot, falling back to Theme 1 which is the base of this theme series.
  return <Theme1Preview color={color} />;
}
