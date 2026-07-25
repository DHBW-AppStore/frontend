import type { UserRole } from "@/types"

/**
 * Central role-label registry. Views call ``t(roleLabelKey(role))`` for a single
 * canonical translation per role that survives locale switches. Keys live in
 * ``i18n/locales/{de,en}.ts`` under ``roleLabels.*``.
 */
export function roleLabelKey(role: string | undefined | null): string {
  switch (role) {
    case "admin":
    case "teacher":
    case "student":
      return `roleLabels.${role}`
    default:
      return "roleLabels.unknown"
  }
}

/** Tailwind badge class per role, for places where the colour is co-located
 *  with the label (avatars / chips). Keeps the inline ``switch`` blocks
 *  out of view files. */
export function roleBadgeClass(role: string | undefined | null): string {
  switch (role) {
    case "admin":
      return "bg-red-50 text-red-700"
    case "teacher":
      return "bg-purple-50 text-purple-700"
    case "student":
      return "bg-blue-50 text-blue-700"
    default:
      return "bg-gray-50 text-gray-700"
  }
}

/** Variant name for the ``<Badge>`` UI component. */
export function roleBadgeVariant(role: string | undefined | null): 'yellow' | 'green' | 'red' | 'purple' | 'blue' | 'gray' {
  switch (role) {
    case "admin":
      return "purple"
    case "teacher":
      return "blue"
    case "student":
      return "green"
    default:
      return "gray"
  }
}

export type { UserRole }
