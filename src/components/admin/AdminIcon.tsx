import type { SVGProps } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

const ADMIN_ONLY = ["gear", "logout", "drag", "copy", "history", "more"] as const;
type AdminOnlyIcon = (typeof ADMIN_ONLY)[number];

export type AdminIconName = IconName | AdminOnlyIcon;

function isAdminOnly(name: AdminIconName): name is AdminOnlyIcon {
  return (ADMIN_ONLY as readonly string[]).includes(name);
}

export type AdminIconProps = Omit<SVGProps<SVGSVGElement>, "name" | "dangerouslySetInnerHTML" | "children"> & {
  name: AdminIconName;
  sw?: number;
  label?: string;
};

export function AdminIcon({
  name,
  sw = 1.5,
  label,
  className,
  ...rest
}: AdminIconProps): React.JSX.Element {
  if (isAdminOnly(name)) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={label ? undefined : true}
        role={label ? "img" : undefined}
        aria-label={label}
        focusable="false"
        className={cn("block", className)}
        {...rest}
      >
        {name === "gear" && (
          <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </>
        )}
        {name === "logout" && (
          <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </>
        )}
        {name === "drag" && (
          <>
            <circle cx="9" cy="6" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="9" cy="12" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="9" cy="18" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="15" cy="6" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="15" cy="12" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="15" cy="18" r="1.25" fill="currentColor" stroke="none" />
          </>
        )}
        {name === "copy" && (
          <>
            <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
            <path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
          </>
        )}
        {name === "history" && (
          <>
            <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9" />
            <path d="M4.5 4.5V9H9M12 8v4.5l3 2" />
          </>
        )}
        {name === "more" && (
          <>
            <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    );
  }

  return <Icon name={name} sw={sw} label={label} className={className} {...rest} />;
}
