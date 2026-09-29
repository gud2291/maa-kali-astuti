import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/* Locale-aware wrappers around Next's navigation APIs. Always import Link/useRouter from here. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
