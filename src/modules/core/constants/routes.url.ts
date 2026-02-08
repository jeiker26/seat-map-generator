export const ROUTER_URL = {
  HOME: () => '/',
  EDITOR: () => '/editor',
  EDITOR_BY_ID: (id: string) => `/editor/${id}`,
  EMBED: (id: string) => `/embed/${id}`,
} as const
