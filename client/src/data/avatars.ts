export interface Avatar {
  alias: string;
  icon: string;
}

export const usableAvatars = [
  { alias: "dinosaur", icon: "🦖" },
  { alias: "ghost", icon: "👻" },
  { alias: "robot", icon: "🤖" },
  { alias: "alien", icon: "👽" },
  { alias: "shit", icon: "💩" },
  { alias: "cool", icon: "😎" },
  { alias: "unicorn", icon: "🦄" },
  { alias: "frog", icon: "🐸" },
] as const satisfies readonly Avatar[];

export type AvatarAlias = (typeof usableAvatars)[number]["alias"];
