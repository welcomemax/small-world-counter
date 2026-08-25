import { useMemo, useState } from 'react'
import styles from './NameCombobox.module.css'

type Props = {
  id: string
  label: string
  value: string
  placeholder: string
  suggestions: string[]
  onChange: (value: string) => void
  disabled?: boolean
}

export function NameCombobox({
  id,
  label,
  value,
  placeholder,
  suggestions,
  onChange,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = `${id}-suggestions`
  const options = useMemo(() => {
    const query = value.trim().toLocaleLowerCase('ru')
    return suggestions.filter(
      (name) => !query || name.toLocaleLowerCase('ru').includes(query),
    )
  }, [suggestions, value])

  const select = (name: string) => {
    onChange(name)
    setOpen(false)
    setActive(0)
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <span className={styles.inputWrap}>
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && options.length > 0}
          aria-controls={listId}
          aria-activedescendant={
            open && options[active] ? `${id}-option-${active}` : undefined
          }
          autoComplete="off"
          required
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
            setActive(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && options.length > 0) {
              event.preventDefault()
              setOpen(true)
              setActive((current) => (current + 1) % options.length)
            } else if (event.key === 'ArrowUp' && options.length > 0) {
              event.preventDefault()
              setOpen(true)
              setActive((current) => (current - 1 + options.length) % options.length)
            } else if (event.key === 'Enter' && open && options[active]) {
              event.preventDefault()
              select(options[active])
            } else if (event.key === 'Escape') {
              setOpen(false)
            }
          }}
        />
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
        {open && options.length > 0 && (
          <span className={styles.list} id={listId} role="listbox">
            {options.map((name, index) => (
              <button
                key={name}
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={index === active}
                className={index === active ? styles.active : styles.option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(name)}
              >
                {name}
              </button>
            ))}
          </span>
        )}
      </span>
    </div>
  )
}
