import { redirectLocalized } from "@/features/auth/session";

export default async function AdminDashboardPage() {
  await redirectLocalized("/admin/houses");
}