# react-free-calendar

一个**极简、零内置样式、高度可定制**的 React 日历组件。  
样式完全由你掌控 —— 本库只提供结构与逻辑。

[![npm version](https://img.shields.io/npm/v/react-free-calendar)](https://www.npmjs.com/package/react-free-calendar)
[![license](https://img.shields.io/npm/l/react-free-calendar)](./LICENSE)

---

## 特性

- 📅 一个组件渲染整年（或任意日期区间）日历
- 🎨 **零内置样式** —— 每个单元格的外观完全由你决定
- 🧩 通过 `DateContent` prop 插入任意 React 组件作为日期格内容渲染器
- 📆 可选的左侧月份导航栏
- 🔢 可选的周数显示
- 🖱️ 原生滚动或逐行滚轮两种交互模式
- 🔗 通过 `fixed` prop 以编程方式滚动并高亮指定日期
- 📦 同时提供 ESM 与 CJS 格式，附带完整 TypeScript 类型声明

---

## 安装

```bash
npm install react-free-calendar
# 或
pnpm add react-free-calendar
# 或
yarn add react-free-calendar
```

> **同伴依赖（Peer dependencies）：** 项目中需已安装 `react >= 18` 和 `react-dom >= 18`。

---

## 快速上手

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
        weekNameFormat={(d) => ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}
        DateContent={({ date, active }) => (
          <SimpleOneDayContent
            date={date}
            color={active || CalendarUtil.isToday(date) ? 'white' : 'inherit'}
            backgroundColor={
              active ? 'blue' : CalendarUtil.isToday(date) ? 'lightblue' : 'transparent'
            }
            onClick={(d) => console.log('点击日期:', d)}
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

## API 参考

### `<FreeCalendar />` Props

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `id` | `string \| number` | — | ✅ | 日历唯一 ID，用于内部 DOM 元素定位 |
| `start` | `Date` | — | ✅ | 日历起始日期 |
| `end` | `Date` | — | ✅ | 日历结束日期 |
| `DateContent` | `React.FC<DateContentProps>` | — | ✅ | **核心定制点**：每个日期格子的内容渲染组件，接收 `date` 和 `active` prop |
| `weekNameFormat` | `(date: Date) => string \| JSX.Element` | — | ✅ | 表头星期名称格式化函数 |
| `mondayIsFirstAtWeek` | `boolean` | `true` | — | `true` 表示周一为一周起始，`false` 表示周日为起始 |
| `fixed` | `{ date: Date; smooth: boolean }` | — | — | 指定高亮/定位日期，`smooth` 控制是否使用平滑滚动动画 |
| `showMonthTags` | `boolean` | `true` | — | 是否显示左侧月份导航栏 |
| `showBorder` | `boolean` | `true` | — | 是否显示单元格边框 |
| `showWeekNumber` | `boolean` | — | — | 是否显示 ISO 周数 |
| `viewRows` | `number` | `5` | — | 可视区域显示的行数，决定单元格高度百分比 |
| `wheelType` | `"native" \| "row"` | — | — | 滚轮交互模式：`"native"` 为原生滚动，`"row"` 为按行逐步滚动 |
| `headerStyle` | `React.CSSProperties` | — | — | 表头区域自定义内联样式 |
| `datesWrapper` | `(children: ReactNode, ref: Ref<HTMLDivElement>) => ReactNode` | — | — | 替换日期区域外层容器（需透传 `ref`） |
| `weekNumberWrapper` | `(weekNumber: number) => ReactNode` | — | — | 自定义周数渲染器 |
| `monthTagNameFormat` | `(date: Date) => string \| JSX.Element` | — | — | 月份导航标签名称格式化函数 |
| `monthTagsWrapper` | `(children: ReactNode) => ReactNode` | `<nav>` | — | 替换月份导航的外层容器 |
| `monthTagColor` | `string` | `"#777"` | — | 月份标签默认颜色 |
| `monthTagActiveColor` | `string` | `"#000"` | — | 月份标签激活状态颜色 |
| `onMonthChange` | `(year: number, month: number) => void` | — | — | 滚动时当前可视月份发生变化时触发 |

---

### `SimpleOneDayContent`

内置的简单日期内容渲染器，可直接作为 `DateContent` prop 的值使用，也可作为自定义渲染器的参考实现。

```tsx
import { SimpleOneDayContent } from 'react-free-calendar';
```

| Prop | 类型 | 说明 |
|------|------|------|
| `date` | `Date` | 当前渲染的日期 |
| `color` | `string` | 文字颜色 |
| `backgroundColor` | `string` | 背景颜色 |
| `showMonthAtFirstOfMonth` | `boolean`（默认 `true`） | 每月第一天是否在日期前显示月份前缀 |
| `onClick` | `(date: Date) => void` | 点击回调 |

---

### `CalendarUtil`

日期工具函数集合，以命名空间对象形式导出。

```tsx
import { CalendarUtil } from 'react-free-calendar';
```

| 函数 | 返回值 | 说明 |
|------|--------|------|
| `getDates(startDate, endDate)` | `Date[]` | 返回 `[startDate, endDate]` 闭区间内所有日期 |
| `getMonthLastDay(date)` | `Date` | 获取 `date` 所在月份的最后一天 |
| `formatDate(date)` | `string` | 将日期格式化为 `YYYY-M-D` 字符串 |
| `isDateEquals(date1, date2)` | `boolean` | 判断两个日期是否为同一天 |
| `isToday(someDate)` | `boolean` | 判断是否为今天 |
| `getDaysInMonth(date)` | `number` | 获取 `date` 所在月份的总天数 |
| `isFirstDayOfWeek(date, mondayIsFirstAtWeek)` | `boolean` | 判断是否为该周的第一天 |
| `offsetOfFristInWeek(date, mondayIsFirstAtWeek)` | `number` | 获取该日期在本周中的零起始偏移量 |
| `offsetOfLastInWeek(date, mondayIsFirstAtWeek)` | `number` | 获取该日期距本周末的偏移量 |
| `leftPaddingDate(date, mondayIsFirstAtWeek)` | `Date[]` | 获取首行起始日期前需要补齐的日期数组 |
| `getFirstWeekDays(year, mondayIsFirstAtWeek)` | `Date[]` | 获取某年第一个完整周的 7 天日期 |

---

### TypeScript 类型

```tsx
import type { DateContentProps, WheelTypeType } from 'react-free-calendar';

// DateContent 组件接收的 props
interface DateContentProps {
  date: Date;
  active: boolean;
}

// 滚轮交互模式
type WheelTypeType = "native" | "row";
```

---

## 进阶示例

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
        <button onClick={() => setFixedDate(new Date())}>今天</button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <FreeCalendar
          id="demo"
          start={new Date(year, 0, 1)}
          end={CalendarUtil.getMonthLastDay(new Date(year, 11, 1))}
          mondayIsFirstAtWeek={true}
          wheelType={"row" as WheelTypeType}
          fixed={fixedProp}
          weekNameFormat={(d) => ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}
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
          onMonthChange={(y, m) => console.log('当前可视月份:', y, m)}
        />
      </div>
    </div>
  );
}
```

---

## 设计理念

- **永远不内置样式。** 本库有意不附带任何 CSS。所有视觉决策完全交由使用者掌控。
- **结构优先，不强加观点。** 每个单元格宽度固定为 `14.2%`（`100% / 7` 列），采用纯 `inline-block` 实现，无需 CSS Grid 或 Flexbox。
- **高度可组合。** 可替换任意层级：日期格内容（`DateContent`）、滚动容器（`datesWrapper`）、月份导航（`monthTagsWrapper`）或周数渲染器（`weekNumberWrapper`）。

---

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（使用 example/ 示例应用）
pnpm dev

# 构建库（产物输出至 dist/）
pnpm build

# 单独运行示例应用
cd example && pnpm install && pnpm dev
```

> 本项目使用 **pnpm** 作为包管理器，请勿使用 npm 或 yarn。

---

## 许可证

[MIT](./LICENSE) © [fengxxc](https://github.com/fengxxc)
