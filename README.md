# react-free-calendar

A **minimal, zero-style, highly customizable** React calendar component.  
Bring your own styles — the library provides structure and logic only.

[![npm version](https://img.shields.io/npm/v/react-free-calendar)](https://www.npmjs.com/package/react-free-calendar)
[![license](https://img.shields.io/npm/l/react-free-calendar)](./LICENSE)

🌐 **Live Demo:** [https://fengxxc.github.io/react-free-calendar/](https://fengxxc.github.io/react-free-calendar/)

---

## Features

- 📅 Render a full-year (or any date range) calendar in one component
- 🎨 **Zero built-in styles** — every cell is fully yours to design
- 🧩 Plug in any React component as the day-cell renderer (`DateContent`)
- 📆 Optional month-navigation sidebar
- 🔢 Optional week numbers
- 🖱️ Native scroll or row-by-row wheel interaction
- 🔗 Programmatically scroll to and highlight any date (`fixed` prop)
- 📦 Ships as ESM + CJS with full TypeScript types

---

## Installation

```bash
npm install react-free-calendar
# or
pnpm add react-free-calendar
# or
yarn add react-free-calendar
```

> **Peer dependencies:** `react >= 18` and `react-dom >= 18` must be installed in your project.

---

## Quick Start

```tsx
import FreeCalendar, { SimpleOneDayContent, CalendarUtil } from 'react-free-calendar';

const year = new Date().getFullYear();

export default function App() {
  return (
    <div style={{ height: '100vh' }}>
      <FreeCalendar
        id="my-calendar"
        start={new Date(year, 0, 1)}
        end={CalendarUtil.getMonthLastDay(new Date(year, 11, 1))}
        mondayIsFirstAtWeek={true}
        weekNameFormat={(d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
        DateContent={({ date, active }) => (
          <SimpleOneDayContent
            date={date}
            color={active || CalendarUtil.isToday(date) ? 'white' : 'inherit'}
            backgroundColor={
              active ? 'blue' : CalendarUtil.isToday(date) ? 'lightblue' : 'transparent'
            }
            onClick={(d) => console.log('clicked:', d)}
          />
        )}
        datesWrapper={(children, ref) => (
          <div ref={ref} style={{ overflow: 'auto', flex: 1 }}>
            {children}
          </div>
        )}
      />
    </div>
  );
}
```

---

## API Reference

### `<FreeCalendar />` Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `id` | `string \| number` | — | ✅ | Unique calendar ID used for internal DOM targeting |
| `start` | `Date` | — | ✅ | First date to render |
| `end` | `Date` | — | ✅ | Last date to render |
| `DateContent` | `React.FC<DateContentProps>` | — | ✅ | **Core customization**: component rendered inside every day cell, receives `date` and `active` |
| `weekNameFormat` | `(date: Date) => string \| JSX.Element` | — | ✅ | Formats the weekday header labels |
| `mondayIsFirstAtWeek` | `boolean` | `true` | — | `true` = week starts Monday, `false` = week starts Sunday |
| `fixed` | `{ date: Date; smooth: boolean }` | — | — | Scroll to and highlight a specific date; `smooth` enables animated scrolling |
| `showMonthTags` | `boolean` | `true` | — | Show or hide the left-side month navigation sidebar |
| `showBorder` | `boolean` | `true` | — | Show or hide cell borders |
| `showWeekNumber` | `boolean` | — | — | Show ISO week numbers |
| `viewRows` | `number` | `5` | — | Number of rows visible in the viewport; controls cell height percentage |
| `wheelType` | `"native" \| "row"` | — | — | `"native"` = default scroll, `"row"` = scroll one row at a time |
| `headerStyle` | `React.CSSProperties` | — | — | Custom inline styles for the weekday header row |
| `datesWrapper` | `(children: ReactNode, ref: Ref<HTMLDivElement>) => ReactNode` | — | — | Replace the scrollable date area container (must forward `ref`) |
| `weekNumberWrapper` | `(weekNumber: number) => ReactNode` | — | — | Custom renderer for week number cells |
| `monthTagNameFormat` | `(date: Date) => string \| JSX.Element` | — | — | Format the label shown in the month sidebar tags |
| `monthTagsWrapper` | `(children: ReactNode) => ReactNode` | `<nav>` | — | Replace the container wrapping all month tags |
| `monthTagColor` | `string` | `"#777"` | — | Default month tag text color |
| `monthTagActiveColor` | `string` | `"#000"` | — | Month tag text color when the month is in view |
| `onMonthChange` | `(year: number, month: number) => void` | — | — | Fires when the visible month changes while scrolling |

---

### `SimpleOneDayContent`

A built-in day-cell renderer you can use directly or as a reference implementation.

```tsx
import { SimpleOneDayContent } from 'react-free-calendar';
```

| Prop | Type | Description |
|------|------|-------------|
| `date` | `Date` | The date to render |
| `color` | `string` | Text color |
| `backgroundColor` | `string` | Cell background color |
| `showMonthAtFirstOfMonth` | `boolean` (default `true`) | Show a month prefix on the 1st of each month |
| `onClick` | `(date: Date) => void` | Click handler |

---

### `CalendarUtil`

A collection of date utility functions exported as a namespace object.

```tsx
import { CalendarUtil } from 'react-free-calendar';
```

| Function | Returns | Description |
|----------|---------|-------------|
| `getDates(startDate, endDate)` | `Date[]` | All dates in the inclusive range `[startDate, endDate]` |
| `getMonthLastDay(date)` | `Date` | Last day of the month containing `date` |
| `formatDate(date)` | `string` | Format a date as `YYYY-M-D` |
| `isDateEquals(date1, date2)` | `boolean` | Check if two dates fall on the same calendar day |
| `isToday(someDate)` | `boolean` | Check if a date is today |
| `getDaysInMonth(date)` | `number` | Number of days in the month containing `date` |
| `isFirstDayOfWeek(date, mondayIsFirstAtWeek)` | `boolean` | Check if a date is the first day of its week |
| `offsetOfFristInWeek(date, mondayIsFirstAtWeek)` | `number` | Zero-based offset of the date within its week |
| `offsetOfLastInWeek(date, mondayIsFirstAtWeek)` | `number` | Distance from the date to the end of its week |
| `leftPaddingDate(date, mondayIsFirstAtWeek)` | `Date[]` | Padding dates needed before `date` to fill the first row |
| `getFirstWeekDays(year, mondayIsFirstAtWeek)` | `Date[]` | The 7 dates of the first full week of a year |

---

### TypeScript Types

```tsx
import type { DateContentProps, WheelTypeType } from 'react-free-calendar';

// Props received by your DateContent component
interface DateContentProps {
  date: Date;
  active: boolean;
}

// Wheel interaction mode
type WheelTypeType = "native" | "row";
```

---

## Advanced Example

```tsx
import { useState, useMemo } from 'react';
import FreeCalendar, { SimpleOneDayContent, CalendarUtil, WheelTypeType } from 'react-free-calendar';

export default function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [fixedDate, setFixedDate] = useState(new Date());
  const fixedProp = useMemo(() => ({ date: fixedDate, smooth: true }), [fixedDate]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div>
        <input type="number" value={year} onInput={(e) => setYear(+e.currentTarget.value)} />
        <button onClick={() => setFixedDate(new Date())}>Today</button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <FreeCalendar
          id="demo"
          start={new Date(year, 0, 1)}
          end={CalendarUtil.getMonthLastDay(new Date(year, 11, 1))}
          mondayIsFirstAtWeek={true}
          wheelType={"row" as WheelTypeType}
          fixed={fixedProp}
          weekNameFormat={(d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
          DateContent={({ date, active }) => (
            <SimpleOneDayContent
              date={date}
              color={active || CalendarUtil.isToday(date) ? 'white' : 'inherit'}
              backgroundColor={
                active ? 'blue' : CalendarUtil.isToday(date) ? 'lightblue' : 'inherit'
              }
              showMonthAtFirstOfMonth={true}
              onClick={(d) => setFixedDate(d)}
            />
          )}
          datesWrapper={(children, ref) => (
            <div ref={ref} style={{ overflow: 'auto', height: '100%' }}>
              {children}
            </div>
          )}
          onMonthChange={(y, m) => console.log('visible month:', y, m)}
        />
      </div>
    </div>
  );
}
```

---

## Design Philosophy

- **No styles, ever.** The library intentionally ships with no CSS. Every visual decision belongs to the consumer.
- **Structure over opinion.** Each cell is `14.2%` wide (`100% / 7` columns) using `inline-block` — no CSS Grid or Flexbox magic needed.
- **Composable.** Swap out any layer: the day cell (`DateContent`), the scroll container (`datesWrapper`), month navigation (`monthTagsWrapper`), or week numbers (`weekNumberWrapper`).

---

## Local Development

```bash
# Install dependencies
pnpm install

# Run dev server (uses the example/ app)
pnpm dev

# Build the library (output → dist/)
pnpm build

# Run the example app standalone
cd example && pnpm install && pnpm dev
```

> This project uses **pnpm**. Please do not use npm or yarn.

---

## License

[MIT](./LICENSE) © [fengxxc](https://github.com/fengxxc)
