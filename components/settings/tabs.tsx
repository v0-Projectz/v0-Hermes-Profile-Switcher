'use client'

import { FolderOpen, Play, Square, Terminal } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  CopyableValue,
  SectionHeader,
  SettingCard,
  SettingRow,
  SettingSelect,
} from '@/components/settings/setting-row'
import { ServiceTable } from '@/components/settings/service-table'
import { ShortcutTable } from '@/components/settings/shortcut-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { listProfiles, testBackend } from '@/lib/api'
import {
  ACCENT_PRESETS,
  APP_VERSION,
  DEFAULT_SETTINGS,
  HERMES_DESKTOP_VERSION,
} from '@/lib/settings'
import type { Settings } from '@/lib/types'
import { cn } from '@/lib/utils'

export type TabProps = {
  draft: Settings
  setSection: <K extends keyof Settings>(
    section: K,
    patch: Partial<Settings[K]>,
  ) => void
  runAction: (factory: () => Promise<{ ok: boolean; message: string }>) => void
  onOpenLastOutput: () => void
  onResetAllSettings: () => void
}

const MODEL_OPTIONS = [
  { value: 'vader-3-flash', label: 'vader-3-flash' },
  { value: 'vader-3.5-flash', label: 'vader-3.5-flash' },
]

/* ----------------------------- GENERAL ----------------------------- */
export function GeneralTab({ draft, setSection }: TabProps) {
  const g = draft.general
  return (
    <div className="space-y-3">
      <SectionHeader>General</SectionHeader>
      <SettingCard>
        <SettingRow
          label="Default new-profile location"
          helper="Where new profiles are created unless you choose a custom path."
          stacked
        >
          <div className="flex gap-2">
            <Input
              value={g.defaultLocation}
              onChange={(e) =>
                setSection('general', { defaultLocation: e.target.value })
              }
              className="bg-secondary/40 font-mono text-xs"
            />
            <Button
              variant="outline"
              className="shrink-0 gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
            >
              <FolderOpen className="size-4" /> Browse
            </Button>
          </div>
        </SettingRow>
        <SettingRow
          label="Default model for new profiles"
          helper="Applied to each freshly created profile."
        >
          <SettingSelect
            value={g.defaultModel}
            onValueChange={(v) =>
              setSection('general', {
                defaultModel: v as Settings['general']['defaultModel'],
              })
            }
            options={MODEL_OPTIONS}
          />
        </SettingRow>
        <SettingRow
          label="Default description template"
          helper="Use {name} as a placeholder for the profile name."
          stacked
        >
          <Input
            value={g.descriptionTemplate}
            onChange={(e) =>
              setSection('general', { descriptionTemplate: e.target.value })
            }
            className="bg-secondary/40 text-sm"
          />
        </SettingRow>
      </SettingCard>

      <SectionHeader>Switch Behavior</SectionHeader>
      <SettingCard>
        <SettingRow
          label="Auto-Launch Hermes on Switch"
          helper="Open the Hermes desktop app right after switching."
        >
          <Switch
            checked={g.autoLaunchOnSwitch}
            onCheckedChange={(v) =>
              setSection('general', { autoLaunchOnSwitch: v })
            }
          />
        </SettingRow>
        <SettingRow
          label="Confirm Before Switch"
          helper="Ask for confirmation before changing the active profile."
        >
          <Switch
            checked={g.confirmBeforeSwitch}
            onCheckedChange={(v) =>
              setSection('general', { confirmBeforeSwitch: v })
            }
          />
        </SettingRow>
        <SettingRow
          label="Switch Behavior"
          helper="Keep Running leaves your current Hermes window open (maps to -NoKill)."
        >
          <SettingSelect
            value={g.switchBehavior}
            onValueChange={(v) =>
              setSection('general', {
                switchBehavior: v as Settings['general']['switchBehavior'],
              })
            }
            options={[
              { value: 'close', label: 'Close Hermes' },
              { value: 'keep', label: 'Keep Running' },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Auto-Sync CLI Profile on Switch"
          helper="Runs the profile's sync-hermes-profile.ps1 after switching."
        >
          <Switch
            checked={g.autoSyncCliOnSwitch}
            onCheckedChange={(v) =>
              setSection('general', { autoSyncCliOnSwitch: v })
            }
          />
        </SettingRow>
      </SettingCard>
    </div>
  )
}

/* --------------------------- APPEARANCE ---------------------------- */
export function AppearanceTab({ draft, setSection }: TabProps) {
  const a = draft.appearance
  const isPreset = ACCENT_PRESETS.some(
    (p) => p.value.toLowerCase() === a.accentColor.toLowerCase(),
  )
  return (
    <div className="space-y-3">
      <SectionHeader>Theme &amp; Accent</SectionHeader>
      <SettingCard>
        <SettingRow label="Theme" helper="Dark is the canonical Hermes look.">
          <SettingSelect
            value={a.theme}
            onValueChange={(v) =>
              setSection('appearance', {
                theme: v as Settings['appearance']['theme'],
              })
            }
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
              { value: 'system', label: 'System' },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Accent Color"
          helper="Recolors the entire interface live."
          stacked
        >
          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setSection('appearance', { accentColor: p.value })
                }
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
                  a.accentColor.toLowerCase() === p.value.toLowerCase()
                    ? 'border-gold/50 bg-accent text-foreground'
                    : 'border-border bg-secondary/40 text-muted-foreground hover:border-gold/30',
                )}
              >
                <span
                  className="size-3 rounded-full"
                  style={{ background: p.value }}
                />
                {p.label}
              </button>
            ))}
            <label
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs',
                isPreset
                  ? 'border-border bg-secondary/40 text-muted-foreground'
                  : 'border-gold/50 bg-accent text-foreground',
              )}
            >
              <input
                type="color"
                value={a.accentColor}
                onChange={(e) =>
                  setSection('appearance', { accentColor: e.target.value })
                }
                className="size-4 cursor-pointer rounded-full border-0 bg-transparent p-0"
                aria-label="Custom accent color"
              />
              Custom
            </label>
          </div>
        </SettingRow>
        <SettingRow
          label="Active Profile Color"
          helper="Green reads as a distinct status; Gold restores the classic look."
        >
          <SettingSelect
            value={a.activeColor}
            onValueChange={(v) =>
              setSection('appearance', {
                activeColor: v as Settings['appearance']['activeColor'],
              })
            }
            options={[
              { value: 'green', label: 'Saber Green' },
              { value: 'gold', label: 'Jedi Gold' },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Accent Intensity"
          helper="Controls glow strength and border alpha."
        >
          <SettingSelect
            value={a.accentIntensity}
            onValueChange={(v) =>
              setSection('appearance', {
                accentIntensity:
                  v as Settings['appearance']['accentIntensity'],
              })
            }
            options={[
              { value: 'subtle', label: 'Subtle' },
              { value: 'medium', label: 'Medium' },
              { value: 'bold', label: 'Bold' },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Glass Intensity"
          helper="Controls backdrop blur and saturation."
        >
          <SettingSelect
            value={a.glassIntensity}
            onValueChange={(v) =>
              setSection('appearance', {
                glassIntensity: v as Settings['appearance']['glassIntensity'],
              })
            }
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
        </SettingRow>
      </SettingCard>

      <SectionHeader>Cinematic Depth</SectionHeader>
      <SettingCard>
        <ToggleRow
          label="Film Grain"
          checked={a.filmGrain}
          onChange={(v) => setSection('appearance', { filmGrain: v })}
        />
        <ToggleRow
          label="Edge Vignette"
          checked={a.vignette}
          onChange={(v) => setSection('appearance', { vignette: v })}
        />
        <ToggleRow
          label="Wordmark Glow"
          checked={a.wordmarkGlow}
          onChange={(v) => setSection('appearance', { wordmarkGlow: v })}
        />
      </SettingCard>

      <SectionHeader>Layout &amp; Motion</SectionHeader>
      <SettingCard>
        <ToggleRow
          label="Show Monograms"
          checked={a.showMonograms}
          onChange={(v) => setSection('appearance', { showMonograms: v })}
        />
        <ToggleRow
          label="Show CLI Status pills"
          checked={a.showCliStatus}
          onChange={(v) => setSection('appearance', { showCliStatus: v })}
        />
        <ToggleRow
          label="Compact Mode"
          helper="Denser cards and rows."
          checked={a.compact}
          onChange={(v) => setSection('appearance', { compact: v })}
        />
        <SettingRow
          label="Animation Speed"
          helper="Off also respects your system reduced-motion setting."
        >
          <SettingSelect
            value={a.animationSpeed}
            onValueChange={(v) =>
              setSection('appearance', {
                animationSpeed: v as Settings['appearance']['animationSpeed'],
              })
            }
            options={[
              { value: 'full', label: 'Full' },
              { value: 'reduced', label: 'Reduced' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </SettingRow>
        <SettingRow label="UI Font">
          <SettingSelect
            value={a.font}
            onValueChange={(v) =>
              setSection('appearance', {
                font: v as Settings['appearance']['font'],
              })
            }
            options={[
              { value: 'geist', label: 'Geist' },
              { value: 'space-grotesk', label: 'Space Grotesk' },
            ]}
          />
        </SettingRow>
      </SettingCard>
    </div>
  )
}

/* ----------------------------- CONSOLE ----------------------------- */
export function ConsoleTab({ draft, setSection, runAction }: TabProps) {
  const c = draft.console
  const [googleOn, setGoogleOn] = useState(false)
  return (
    <div className="space-y-3">
      <SectionHeader>J.A.R.V.I.S. Console</SectionHeader>
      <SettingCard>
        <ToggleRow
          label="Show J.A.R.V.I.S. Footer"
          checked={c.showFooter}
          onChange={(v) => setSection('console', { showFooter: v })}
        />
        <ToggleRow
          label="Waveform Animation"
          checked={c.waveformAnimation}
          onChange={(v) => setSection('console', { waveformAnimation: v })}
        />
        <SettingRow label="Waveform Color">
          <SettingSelect
            value={c.waveformColor}
            onValueChange={(v) =>
              setSection('console', {
                waveformColor: v as Settings['console']['waveformColor'],
              })
            }
            options={[
              { value: 'gold', label: 'Gold' },
              { value: 'white', label: 'White' },
              { value: 'gradient', label: 'Gradient' },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Service Polling Interval"
          helper="How often monitored services are probed."
        >
          <SettingSelect
            value={String(c.pollIntervalMs)}
            onValueChange={(v) =>
              setSection('console', {
                pollIntervalMs: Number(
                  v,
                ) as Settings['console']['pollIntervalMs'],
              })
            }
            options={[
              { value: '2000', label: '2s' },
              { value: '5000', label: '5s' },
              { value: '10000', label: '10s' },
              { value: '30000', label: '30s' },
            ]}
          />
        </SettingRow>
        <ToggleRow
          label="Show Service Ports"
          checked={c.showPorts}
          onChange={(v) => setSection('console', { showPorts: v })}
        />
        <SettingRow label="Service Capsule Style">
          <SettingSelect
            value={c.capsuleStyle}
            onValueChange={(v) =>
              setSection('console', {
                capsuleStyle: v as Settings['console']['capsuleStyle'],
              })
            }
            options={[
              { value: 'pill', label: 'Pill' },
              { value: 'rounded', label: 'Rounded' },
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
        </SettingRow>
      </SettingCard>

      <SectionHeader>Monitored Services</SectionHeader>
      <ServiceTable
        services={c.services}
        onChange={(services) => setSection('console', { services })}
      />

      <SectionHeader>Google API Stack</SectionHeader>
      <SettingCard>
        <SettingRow
          label="Google API"
          helper="Runs your D:\Hermes\custom-scriptz\google-api start/stop scripts."
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{
                  background: googleOn ? 'var(--success)' : 'var(--text-muted-2)',
                  boxShadow: googleOn ? '0 0 8px var(--success)' : 'none',
                }}
              />
              {googleOn ? 'Running' : 'Stopped'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGoogleOn(true)
                runAction(async () => ({
                  ok: true,
                  message: 'Google API stack started',
                }))
              }}
              className="gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
            >
              <Play className="size-3.5" /> Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGoogleOn(false)
                runAction(async () => ({
                  ok: true,
                  message: 'Google API stack stopped',
                }))
              }}
              className="gap-1.5 border-border bg-secondary/40 hover:border-danger/40 hover:text-danger"
            >
              <Square className="size-3.5" /> Stop
            </Button>
          </div>
        </SettingRow>
      </SettingCard>
    </div>
  )
}

/* ---------------------------- SHORTCUTS ---------------------------- */
export function ShortcutsTab({ draft, setSection }: TabProps) {
  return (
    <div className="space-y-3">
      <SectionHeader>Keyboard Shortcuts</SectionHeader>
      <p className="text-xs text-muted-foreground">
        Click a binding to record a new key combination. Conflicts are flagged.
      </p>
      <ShortcutTable
        shortcuts={draft.shortcuts}
        onChange={(id, binding) =>
          setSection('shortcuts', { [id]: binding } as Partial<
            Settings['shortcuts']
          >)
        }
        onResetAll={() =>
          setSection('shortcuts', { ...DEFAULT_SETTINGS.shortcuts })
        }
      />
    </div>
  )
}

/* -------------------------- INTEGRATIONS --------------------------- */
export function IntegrationsTab({ draft, setSection, runAction }: TabProps) {
  const i = draft.integrations
  return (
    <div className="space-y-3">
      <SectionHeader>Detected Paths</SectionHeader>
      <SettingCard>
        <SettingRow label="Hermes Desktop Path" stacked>
          <CopyableValue value={i.hermesPath} />
        </SettingRow>
        <SettingRow label="Cursor Path" stacked>
          <CopyableValue value={i.cursorPath} />
        </SettingRow>
      </SettingCard>

      <SectionHeader>PowerShell &amp; Scripts</SectionHeader>
      <SettingCard>
        <SettingRow
          label="PowerShell Execution Policy"
          helper="Applied when invoking the switcher scripts."
        >
          <SettingSelect
            value={i.executionPolicy}
            onValueChange={(v) =>
              setSection('integrations', {
                executionPolicy:
                  v as Settings['integrations']['executionPolicy'],
              })
            }
            options={[
              { value: 'Bypass', label: 'Bypass' },
              { value: 'RemoteSigned', label: 'RemoteSigned' },
              { value: 'AllSigned', label: 'AllSigned' },
            ]}
          />
        </SettingRow>
        <SettingRow label="Profile Template Source" stacked>
          <Input
            value={i.templateSource}
            onChange={(e) =>
              setSection('integrations', { templateSource: e.target.value })
            }
            className="bg-secondary/40 font-mono text-xs"
          />
        </SettingRow>
        <SettingRow label="Switcher Script Path" stacked>
          <div className="flex gap-2">
            <Input
              value={i.switcherScript}
              onChange={(e) =>
                setSection('integrations', { switcherScript: e.target.value })
              }
              className="bg-secondary/40 font-mono text-xs"
            />
            <Button
              variant="outline"
              onClick={() => runAction(testBackend)}
              className="shrink-0 gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
            >
              <Terminal className="size-4" /> Test Backend
            </Button>
          </div>
        </SettingRow>
      </SettingCard>

      <SectionHeader>Behavior</SectionHeader>
      <SettingCard>
        <SettingRow label="Open folders with">
          <SettingSelect
            value={i.openFoldersWith}
            onValueChange={(v) =>
              setSection('integrations', {
                openFoldersWith:
                  v as Settings['integrations']['openFoldersWith'],
              })
            }
            options={[
              { value: 'explorer', label: 'File Explorer' },
              { value: 'wt', label: 'Windows Terminal' },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Sync on Launch"
          helper="Re-sync CLI profiles when Profile Jedi starts."
        >
          <Switch
            checked={i.syncOnLaunch}
            onCheckedChange={(v) =>
              setSection('integrations', { syncOnLaunch: v })
            }
          />
        </SettingRow>
      </SettingCard>
    </div>
  )
}

/* ----------------------------- DATA -------------------------------- */
export function DataTab({
  draft,
  setSection,
  runAction,
  onResetAllSettings,
}: TabProps) {
  const d = draft.data
  return (
    <div className="space-y-3">
      <SectionHeader>Data &amp; Storage</SectionHeader>
      <SettingCard>
        <SettingRow label="Profiles Registry Path" stacked>
          <CopyableValue value={d.registryPath} />
        </SettingRow>
        <SettingRow label="Active Profile File" stacked>
          <CopyableValue value={d.activeProfileFile} />
        </SettingRow>
        <SettingRow label="Mem0 Store Path" stacked>
          <Input
            value={d.mem0Path}
            onChange={(e) => setSection('data', { mem0Path: e.target.value })}
            className="bg-secondary/40 font-mono text-xs"
          />
        </SettingRow>
        <SettingRow label="Local API Port" helper="The local-only server port.">
          <Input
            value={String(d.apiPort)}
            inputMode="numeric"
            onChange={(e) =>
              setSection('data', {
                apiPort: Number(e.target.value.replace(/\D/g, '')) || 0,
              })
            }
            className="w-28 bg-secondary/40 font-mono text-xs"
          />
        </SettingRow>
      </SettingCard>

      <SectionHeader>Backup &amp; Restore</SectionHeader>
      <SettingCard>
        <div className="flex flex-wrap gap-2 p-4">
          <ActionButton
            label="Import Registry"
            onClick={() =>
              runAction(async () => ({
                ok: true,
                message: 'Registry imported successfully',
              }))
            }
          />
          <ActionButton
            label="Export Registry"
            onClick={() =>
              runAction(async () => ({
                ok: true,
                message: 'Registry exported to profiles.backup.json',
              }))
            }
          />
          <ActionButton
            label="Backup Now"
            onClick={() =>
              runAction(async () => ({
                ok: true,
                message: 'Snapshot saved (settings + registry)',
              }))
            }
          />
          <ActionButton
            label="Restore from Backup"
            onClick={() =>
              runAction(async () => ({
                ok: true,
                message: 'Restored from latest backup',
              }))
            }
          />
          <ActionButton
            label="Open App Data / Logs Folder"
            onClick={() =>
              runAction(async () => ({
                ok: true,
                message: 'Opening logs folder…',
              }))
            }
          />
        </div>
      </SettingCard>

      <SectionHeader>Danger Zone</SectionHeader>
      <SettingCard>
        <SettingRow
          label="Reset All Settings"
          helper="Restores all defaults. Profiles are not affected."
        >
          <Button
            variant="outline"
            onClick={onResetAllSettings}
            className="border-danger/40 bg-danger/10 text-danger hover:bg-danger/20"
          >
            Reset All Settings
          </Button>
        </SettingRow>
      </SettingCard>
    </div>
  )
}

/* ---------------------------- ADVANCED ----------------------------- */
export function AdvancedTab({ draft, setSection, onOpenLastOutput }: TabProps) {
  const a = draft.advanced
  return (
    <div className="space-y-3">
      <SectionHeader>Advanced</SectionHeader>
      <SettingCard>
        <SettingRow
          label="Dry-Run Mode"
          helper="Show each action's exact PowerShell command without executing it."
        >
          <Switch
            checked={a.dryRun}
            onCheckedChange={(v) => setSection('advanced', { dryRun: v })}
          />
        </SettingRow>
        <SettingRow
          label="Confirm Destructive Actions"
          helper="Require confirmation for deletes and resets."
        >
          <Switch
            checked={a.confirmDestructive}
            onCheckedChange={(v) =>
              setSection('advanced', { confirmDestructive: v })
            }
          />
        </SettingRow>
        <SettingRow
          label="Verbose Logging"
          helper="Capture detailed backend stdout/stderr."
        >
          <Switch
            checked={a.verboseLogging}
            onCheckedChange={(v) =>
              setSection('advanced', { verboseLogging: v })
            }
          />
        </SettingRow>
        <SettingRow
          label="View Last Command Output"
          helper="Inspect stdout/stderr from the most recent backend call."
        >
          <Button
            variant="outline"
            onClick={onOpenLastOutput}
            className="gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
          >
            <Terminal className="size-4" /> Open
          </Button>
        </SettingRow>
        <SettingRow
          label="Bind Address"
          helper="Local only — this app runs shell commands and is never exposed publicly."
        >
          <CopyableValue value={a.bindAddress} className="w-44" />
        </SettingRow>
      </SettingCard>
    </div>
  )
}

/* ------------------------------ ABOUT ------------------------------ */
export function AboutTab(_props: TabProps) {
  const [count, setCount] = useState<number | null>(null)
  const [status, setStatus] = useState<'ok' | 'unreachable' | 'checking'>(
    'checking',
  )

  useEffect(() => {
    let active = true
    Promise.all([listProfiles(), testBackend()]).then(([profiles, res]) => {
      if (!active) return
      setCount(profiles.length)
      setStatus(res.ok ? 'ok' : 'unreachable')
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-3">
      <SectionHeader>About</SectionHeader>
      <div className="glass flex flex-col items-center gap-3 rounded-xl p-8 text-center">
        <span
          className="flex size-12 rotate-45 items-center justify-center rounded-[10px] border border-gold/40 bg-accent glow-gold"
          aria-hidden
        >
          <span className="size-3.5 -rotate-45 rounded-[3px] bg-gold shadow-[0_0_12px_rgba(245,184,65,0.9)]" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Profile Jedi</h2>
          <p className="font-mono text-xs text-muted-foreground">
            v{APP_VERSION}
          </p>
        </div>
      </div>
      <SettingCard>
        <InfoRow label="Hermes Desktop" value={`v${HERMES_DESKTOP_VERSION}`} />
        <InfoRow
          label="Switcher Backend"
          value={
            status === 'checking'
              ? 'Checking…'
              : status === 'ok'
                ? 'OK'
                : 'Unreachable'
          }
          tone={status === 'ok' ? 'success' : status === 'checking' ? 'muted' : 'danger'}
        />
        <InfoRow
          label="Profiles Resolved"
          value={count === null ? '…' : String(count)}
        />
      </SettingCard>
    </div>
  )
}

/* --------------------------- small helpers ------------------------- */
function ToggleRow({
  label,
  helper,
  checked,
  onChange,
}: {
  label: string
  helper?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <SettingRow label={label} helper={helper}>
      <Switch checked={checked} onCheckedChange={onChange} />
    </SettingRow>
  )
}

function ActionButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="border-border bg-secondary/40 text-xs hover:border-gold/30 hover:text-gold"
    >
      {label}
    </Button>
  )
}

function InfoRow({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger' | 'muted'
}) {
  const color =
    tone === 'success'
      ? 'text-success'
      : tone === 'danger'
        ? 'text-danger'
        : tone === 'muted'
          ? 'text-muted-foreground'
          : 'text-foreground'
  return (
    <div className="compact-pad flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('font-mono text-sm', color)}>{value}</span>
    </div>
  )
}
