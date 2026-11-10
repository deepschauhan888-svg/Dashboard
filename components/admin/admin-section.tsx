"use client";

import { DataValidation } from "./data-validation";
import { DatasetUpload } from "./dataset-upload";
import { CityManagement, ClientManagement, MicromarketManagement } from "./management";
import { AccessPermissions, PlatformSettings, SubscriptionManagement } from "./platform-config";
import { UploadHistory } from "./upload-history";
import type { AdminSectionSlug } from "@/lib/config/admin-sections";

export function AdminSection({ slug }: { slug: AdminSectionSlug }) {
  switch (slug) {
    case "upload":
      return <DatasetUpload />;
    case "validation":
      return <DataValidation />;
    case "history":
      return <UploadHistory />;
    case "cities":
      return <CityManagement />;
    case "micromarkets":
      return <MicromarketManagement />;
    case "clients":
      return <ClientManagement />;
    case "subscriptions":
      return <SubscriptionManagement />;
    case "permissions":
      return <AccessPermissions />;
    case "settings":
      return <PlatformSettings />;
  }
}
