import type { ViewMode } from '../types'
import { PERIOD_LABELS, PERIOD_ORDER } from '../types'
import './PeriodSettings.css'

interface PeriodSettingsProps {
  enabledPeriods: ViewMode[]
  onChange: (periods: ViewMode[]) => void
}

export default function PeriodSettings({ enabledPeriods, onChange }: PeriodSettingsProps) {
  function toggle(period: ViewMode, checked: boolean) {
    if (checked) {
      onChange(PERIOD_ORDER.filter((p) => enabledPeriods.includes(p) || p === period))
    } else {
      if (enabledPeriods.length <= 1) return
      onChange(enabledPeriods.filter((p) => p !== period))
    }
  }

  return (
    <div className="period-settings">
      {PERIOD_ORDER.map((period) => (
        <label key={period} className="period-settings__item">
          <input
            type="checkbox"
            checked={enabledPeriods.includes(period)}
            onChange={(e) => toggle(period, e.target.checked)}
            disabled={enabledPeriods.length === 1 && enabledPeriods.includes(period)}
          />
          {PERIOD_LABELS[period]}
        </label>
      ))}
    </div>
  )
}
