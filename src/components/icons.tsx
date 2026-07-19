import type { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function Base({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 3v9" />
      <path d="M6.5 9.5 10 13l3.5-3.5" />
      <path d="M4 14.5V16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.5" />
    </Base>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 6h12" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6" />
      <path d="M5.5 6 6 16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l.5-10" />
      <path d="M8.5 9v5M11.5 9v5" />
    </Base>
  )
}

export function IconKeyboard(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="6" width="14" height="9" rx="1.6" />
      <path d="M6 9h.01M9 9h.01M12 9h.01M15 9h.01M6.5 12.5h7" />
    </Base>
  )
}

export function IconCamera(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7.5a1.5 1.5 0 0 1 1.5-1.5h1l.7-1.2A1 1 0 0 1 8.06 4.3h3.88a1 1 0 0 1 .86.5L13.5 6h1A1.5 1.5 0 0 1 16 7.5v7A1.5 1.5 0 0 1 14.5 16h-9A1.5 1.5 0 0 1 4 14.5z" />
      <circle cx="10" cy="10.5" r="2.6" />
    </Base>
  )
}

export function IconMic(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="7.5" y="3" width="5" height="9" rx="2.5" />
      <path d="M5 9.5a5 5 0 0 0 10 0" />
      <path d="M10 14.5V17M7.5 17h5" />
    </Base>
  )
}

export function IconStop(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="5" y="5" width="10" height="10" rx="2" />
    </Base>
  )
}

export function IconX(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 5l10 10M15 5 5 15" />
    </Base>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 4v12M4 10h12" />
    </Base>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 4 6 10l6 6" />
    </Base>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8 4l6 6-6 6" />
    </Base>
  )
}

export function IconClipboardCheck(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 4.5h6a1 1 0 0 1 1 1V6h.5A1.5 1.5 0 0 1 16 7.5v8A1.5 1.5 0 0 1 14.5 17h-9A1.5 1.5 0 0 1 4 15.5v-8A1.5 1.5 0 0 1 5.5 6H6v-.5a1 1 0 0 1 1-1Z" />
      <path d="M8 4.2h4a.8.8 0 0 1 .8.8v.5a.8.8 0 0 1-.8.8H8a.8.8 0 0 1-.8-.8V5a.8.8 0 0 1 .8-.8Z" />
      <path d="m7.5 11.2 1.8 1.8L13 9.2" />
    </Base>
  )
}

export function IconSliders(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 6h5M13 6h3M4 14h2M10 14h6" />
      <circle cx="11" cy="6" r="2" />
      <circle cx="8" cy="14" r="2" />
    </Base>
  )
}

export function IconTag(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M11 4h4a1 1 0 0 1 1 1v4l-7 7-5-5 7-7Z" />
      <circle cx="13.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </Base>
  )
}

export function IconCalendarRange(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" />
      <path d="M3.5 8.5h13M7 3v3M13 3v3" />
    </Base>
  )
}

export function IconEye(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10Z" />
      <circle cx="10" cy="10" r="2.2" />
    </Base>
  )
}

export function IconUser(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="7" r="3" />
      <path d="M4.5 16.5a5.5 5.5 0 0 1 11 0" />
    </Base>
  )
}

export function IconBriefcase(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="7" width="14" height="9" rx="1.5" />
      <path d="M7.5 7V5.5A1.5 1.5 0 0 1 9 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M3 11.5h14" />
    </Base>
  )
}

export function IconBell(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 3.5a4 4 0 0 0-4 4v2.2c0 .5-.2 1-.5 1.4L4.5 12.5h11l-1-1.4a2.3 2.3 0 0 1-.5-1.4V7.5a4 4 0 0 0-4-4Z" />
      <path d="M8.3 15a1.8 1.8 0 0 0 3.4 0" />
    </Base>
  )
}
