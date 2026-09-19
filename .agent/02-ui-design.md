# PBX Dashboard — UI Design System

## Visual direction

Use the uploaded PBX Console prototype as the visual reference.

### Typography
- UI: Space Grotesk
- Technical/config values: JetBrains Mono

### Dark theme baseline
- Background: `#12161d`
- Panel: `#1b212c`
- Secondary panel: `#212836`
- Tertiary panel: `#262e3d`
- Border: `#2c3444`
- Main text: `#e7ecf2`
- Muted text: `#7c8698`
- Amber/action: `#ffb454`
- Teal/success: `#5ec9a6`
- Violet: `#b39ddb`
- Red/error: `#e0685c`

A light theme may exist, but dark mode is the primary visual language.

## Layout

### Sidebar
Width around 240px on desktop.

Navigation groups:
- PRODUK
- Call to Dial
- DeskCall Koor
- Predictive
- Call Center

The active module should be visually obvious but restrained.

### Main area
Use:
- Breadcrumb
- Module title
- Short module description
- Horizontal tabs
- Content sections/cards

Avoid excessive decoration, gradients, oversized hero sections, or marketing-style visuals.

## Components

Reusable components should include:
- StatusBadge
- MetricCard
- DataTable
- SectionCard
- Tabs
- RuleList
- EmptyState
- LockedState
- ConfigPreview
- ConfirmDialog
- FormDrawer or FormModal
- Toast/notification

## Status language

Use clear operational statuses such as:
- Online
- Offline
- Registered
- Unreachable
- Disabled
- Error
- Pending

Color must not be the only status indicator. Include text/icon where appropriate.

## Responsive behavior

Desktop is the primary target.

For smaller screens:
- Sidebar can collapse
- Tables may scroll horizontally
- Forms should remain usable
- Do not destroy technical information merely to make the layout mobile-friendly
