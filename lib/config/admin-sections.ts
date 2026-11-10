export const ADMIN_SECTIONS = {
  upload: "Dataset Upload",
  validation: "Data Validation",
  history: "Upload History",
  cities: "City Management",
  micromarkets: "Micromarket Management",
  clients: "Client Management",
  subscriptions: "Subscription Management",
  permissions: "Access Permissions",
  settings: "Platform Settings",
} as const;

export type AdminSectionSlug = keyof typeof ADMIN_SECTIONS;
