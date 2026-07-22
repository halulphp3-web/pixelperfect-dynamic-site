import { createFileRoute } from "@tanstack/react-router";
import { AdminOutlet } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminOutlet,
});
