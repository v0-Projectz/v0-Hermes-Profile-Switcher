'use client'

import {
  CalendarDays,
  ExternalLink,
  KanbanSquare,
  LayoutGrid,
  Plus,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ExtraLink = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  /** External URL to open, or null for a not-yet-wired placeholder. */
  href: string | null
}

/**
 * Temporary holding spot for future add-ons and tool links. Add entries here
 * (or point `href` at a real URL) as new tools come online.
 */
const EXTRA_LINKS: ExtraLink[] = [
  {
    id: 'taskboard',
    label: 'TaskBoard Manager',
    description: 'Plan and track your tasks',
    icon: LayoutGrid,
    href: null,
  },
  {
    id: 'hermes-kanban',
    label: 'Hermes Kanban Board',
    description: 'Drag-and-drop workflow board',
    icon: KanbanSquare,
    href: null,
  },
  {
    id: 'postiz-calendar',
    label: 'Postiz Calendar',
    description: 'Schedule and publish content',
    icon: CalendarDays,
    href: null,
  },
]

export function ExtrasMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Extras and tools"
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold data-[popup-open]:border-gold/30 data-[popup-open]:text-gold"
      >
        <Sparkles className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="eyebrow text-[10px] text-muted-foreground">
            Extras &amp; Tools
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {EXTRA_LINKS.map((link) => {
          const Icon = link.icon
          const isLinked = Boolean(link.href)
          if (isLinked) {
            return (
              <DropdownMenuItem
                key={link.id}
                className="gap-3 py-2"
                render={
                  <a
                    href={link.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Icon className="size-4 text-gold" />
                <span className="flex flex-1 flex-col">
                  <span className="text-sm text-foreground">{link.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {link.description}
                  </span>
                </span>
                <ExternalLink className="size-3.5 text-muted-foreground" />
              </DropdownMenuItem>
            )
          }
          return (
            <DropdownMenuItem
              key={link.id}
              disabled
              className="gap-3 py-2"
              // Keep placeholder rows clickable-looking but inert.
              onSelect={(e) => e.preventDefault()}
            >
              <Icon className="size-4 text-muted-foreground" />
              <span className="flex flex-1 flex-col">
                <span className="text-sm text-foreground">{link.label}</span>
                <span className="text-xs text-muted-foreground">
                  {link.description}
                </span>
              </span>
              <span className="eyebrow rounded-full border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">
                Soon
              </span>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="gap-3 py-2 text-muted-foreground">
          <Plus className="size-4" />
          <span className="text-xs">More tools coming soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
