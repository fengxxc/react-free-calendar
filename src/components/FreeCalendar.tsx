import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import MonthTags from "./MonthTags";
import { OneDay, One } from "./OneDay";
import {
    getDates,
    isDateEquals,
    leftPaddingDate,
    isFirstDayOfWeek,
    offsetOfFristInWeek,
    getFirstWeekDays,
    formatDate,
    addDays,
    diffDays,
} from "../CalendarUtil";
import { DateContentProps, WheelTypeType } from "./ExportTypes";

/** 滚轮累积多少像素算作一行（触摸板会产生很小的 delta，需要累积） */
const WHEEL_STEP_THRESHOLD = 40;
/**
 * 两次行步进的最小间隔。
 * 高分辨率鼠标滚轮 / Chrome 平滑滚动会把一格滚轮拆成一串小 delta 事件（每个 2~16px），
 * 单靠像素累积会把一格算成好几行；用时间窗把一“波”事件归并为一行。
 */
const WHEEL_STEP_COOLDOWN = 150;
/** 判定“这次 scroll 事件是程序触发的”时间窗口 */
const PROGRAMMATIC_WINDOW = 120;
/** 用户手动滚动停止后多久做对齐 */
const SNAP_IDLE_DELAY = 150;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * 事件是否发生在「容器内部某个还能继续滚动的可滚动元素」中。
 * DateContent 里常见自带 overflow:auto 的列表；
 * 行步进模式下如果无条件 preventDefault，这些内部滚动条就滚不动了。
 */
const isInnerScrollable = (
    target: EventTarget | null,
    container: HTMLElement,
    delta: number,
) => {
    let node: HTMLElement | null =
        target instanceof Element ? (target as HTMLElement) : null;
    while (node != null && node !== container && container.contains(node)) {
        const style = getComputedStyle(node);
        const overflowY = style.overflowY;
        const scrollable =
            (overflowY === "auto" ||
                overflowY === "scroll" ||
                overflowY === "overlay") &&
            node.scrollHeight > node.clientHeight + 1;
        if (scrollable) {
            const max = node.scrollHeight - node.clientHeight;
            // 还没滚到尽头 → 交给内部元素自己消费这次滚轮
            if (delta < 0 ? node.scrollTop > 0 : node.scrollTop < max - 1) {
                return true;
            }
        }
        node = node.parentElement;
    }
    return false;
};

interface FreeCalendarProps {
    id: string | number;
    start: Date;
    end: Date;
    mondayIsFirstAtWeek: boolean;
    DateContent: React.FC<DateContentProps>;
    weekNumberWrapper?: (weekNumber: number) => React.ReactNode;
    fixed?: { date: Date; smooth: boolean };
    showMonthTags?: boolean;
    headerStyle?: React.CSSProperties;
    showBorder?: boolean;
    wheelType?: WheelTypeType;
    showWeekNumber?: boolean;
    viewRows?: number;
    weekNameFormat: (date: Date) => string | JSX.Element;
    datesWrapper?: (
        children: React.ReactNode,
        ref: React.Ref<HTMLDivElement> | undefined,
    ) => React.ReactNode | JSX.Element;
    monthTagNameFormat?: (date: Date) => string | JSX.Element;
    monthTagsWrapper?: (
        children: React.ReactNode,
    ) => React.ReactNode | JSX.Element;
    monthTagColor?: string;
    monthTagActiveColor?: string;
    onMonthChange?: (year: number, month: number ) => void;
}
const FreeCalendar: React.FC<FreeCalendarProps> = ({
    id,
    start: startProp,
    end: endProp,
    mondayIsFirstAtWeek = true,
    DateContent,
    showMonthTags = true,
    headerStyle,
    showBorder = true,
    fixed,
    wheelType,
    showWeekNumber,
    weekNumberWrapper,
    viewRows = 5,
    weekNameFormat,
    datesWrapper,
    monthTagNameFormat,
    monthTagsWrapper,
    monthTagColor,
    monthTagActiveColor,
    onMonthChange,
}) => {
    // const _start = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    // const _end = end || getMonthLastDay(new Date())
    // 调用方常直接写 start={new Date(...)}，每次渲染都是新对象。
    // 这里按「日期值」稳定化，避免下游 memo / 事件监听 / 滚动定位被无意义地重建
    const startKey = formatDate(startProp);
    const endKey = formatDate(endProp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const start = useMemo(() => startProp, [startKey]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const end = useMemo(() => endProp, [endKey]);

    // 用 callback ref 持有真实的滚动容器：datesWrapper 重新渲染/换节点时也能重新绑定事件
    const [bodyEl, setBodyEl] = useState<HTMLDivElement | null>(null);
    const bodyRef = useCallback(
        (node: HTMLDivElement | null) => setBodyEl(node),
        [],
    );

    const smooth = fixed?.smooth !== false;

    /* ---------------- 行几何：一切定位都基于「行号 → scrollTop」 ---------------- */

    // 第一行的第一天（含 start 之前用于补齐的日期）
    const firstRowDate = useMemo(
        () => addDays(start, -offsetOfFristInWeek(start, mondayIsFirstAtWeek)),
        [start, mondayIsFirstAtWeek],
    );
    const totalRows = useMemo(
        () => Math.max(1, Math.ceil((diffDays(firstRowDate, end) + 1) / 7)),
        [firstRowDate, end],
    );
    // 行高从真实布局反推（scrollHeight / 总行数），避免 height: 百分比 的取整误差累积
    const rowHeightOf = useCallback(
        (el: HTMLElement) => el.scrollHeight / totalRows,
        [totalRows],
    );
    const rowOfDate = useCallback(
        (date: Date) =>
            Math.min(
                totalRows - 1,
                Math.max(0, Math.floor(diffDays(firstRowDate, date) / 7)),
            ),
        [firstRowDate, totalRows],
    );

    /* ---------------- 滚动动画（自己实现，可随时重定向） ---------------- */

    const rafRef = useRef<number | null>(null);
    const targetTopRef = useRef<number>(0);
    const targetRowRef = useRef<number>(0);
    const lastProgrammaticRef = useRef<number>(0);

    const cancelAnim = () => {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };
    const isProgrammatic = () =>
        rafRef.current != null ||
        performance.now() - lastProgrammaticRef.current < PROGRAMMATIC_WINDOW;

    const scrollToTop = useCallback(
        (top: number, animate: boolean) => {
            const el = bodyEl;
            if (el == null) return;
            const max = Math.max(0, el.scrollHeight - el.clientHeight);
            const to = Math.min(Math.max(0, top), max);
            cancelAnim();
            targetTopRef.current = to;
            targetRowRef.current = to / (rowHeightOf(el) || 1);
            const from = el.scrollTop;
            const distance = to - from;
            if (!animate || Math.abs(distance) < 1) {
                lastProgrammaticRef.current = performance.now();
                el.scrollTop = to;
                return;
            }
            const rowHeight = rowHeightOf(el) || 1;
            const duration = Math.min(
                600,
                Math.max(160, (Math.abs(distance) / rowHeight) * 90),
            );
            const t0 = performance.now();
            const step = (now: number) => {
                const p = Math.min(1, (now - t0) / duration);
                lastProgrammaticRef.current = now;
                el.scrollTop = from + distance * easeOutCubic(p);
                rafRef.current = p < 1 ? requestAnimationFrame(step) : null;
            };
            rafRef.current = requestAnimationFrame(step);
        },
        [bodyEl, rowHeightOf],
    );

    useEffect(() => cancelAnim, []);

    const scrollTo = useCallback(
        (scrollToDate: Date | undefined, animate: boolean) => {
            if (scrollToDate == undefined || bodyEl == null) return;
            scrollToTop(rowOfDate(scrollToDate) * rowHeightOf(bodyEl), animate);
        },
        [bodyEl, rowOfDate, rowHeightOf, scrollToTop],
    );

    // fixed 变化（或容器就绪）时滚动到目标日期。
    // 只依赖 fixed 和容器：scrollTo 身份变化（start/end/行高）不该触发回滚，
    // 否则父组件任意一次重渲染都会把日历拉回 fixed.date 所在行
    const scrollToRef = useRef(scrollTo);
    scrollToRef.current = scrollTo;
    useEffect(() => {
        if (bodyEl == null || fixed?.date == undefined) return;
        const firstDayOfMonth = new Date(fixed.date.getFullYear(), fixed.date.getMonth(), 1);
        scrollToRef.current(firstDayOfMonth, smooth);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bodyEl, fixed]);

    /* ---------------- 当前月份（由 scrollTop 直接算出，不再遍历 DOM） ---------------- */

    const [currentScrollMonth, setCurrentScrollMonth] = useState(
        (fixed?.date || start).getMonth() + 1,
    );
    const [currentScrollYear, setCurrentScrollYear] = useState(
        (fixed?.date || start).getFullYear(),
    );
    const lastMonthRef = useRef<string>("");
    const updateCurrentMonth = useCallback(
        (el: HTMLElement) => {
            const rowHeight = rowHeightOf(el);
            if (!rowHeight) return;
            // 与旧逻辑一致：取“最晚的、其 1 号落在顶部可见行或更上方”的月份。
            // 等价写法：顶部可见行最后一天所在的月份
            // （若新月的 1 号落在该行内，该行末日即新月；否则仍为覆盖该行的月份）
            const topRow = Math.max(0, Math.round(el.scrollTop / rowHeight));
            const refRow = Math.min(totalRows - 1, topRow);
            let refDate = addDays(firstRowDate, refRow * 7 + 6);
            if (refDate > end) refDate = end;
            if (refDate < start) refDate = start;
            const key = `${refDate.getFullYear()}-${refDate.getMonth() + 1}`;
            if (key === lastMonthRef.current) return;
            lastMonthRef.current = key;
            setCurrentScrollYear(refDate.getFullYear());
            setCurrentScrollMonth(refDate.getMonth() + 1);
            onMonthChange?.(refDate.getFullYear(), refDate.getMonth() + 1);
        },
        [firstRowDate, totalRows, rowHeightOf, start, end, onMonthChange],
    );

    /* ---------------- 滚轮：按行步进 ---------------- */

    const wheelAccRef = useRef<number>(0);
    const lastWheelStepRef = useRef<number>(0);
    useEffect(() => {
        if (bodyEl == null || wheelType !== "row") return;
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey) return; // 缩放手势交还浏览器
            if (e.defaultPrevented) return; // DateContent 已自行处理
            const rowHeight = rowHeightOf(bodyEl);
            if (!rowHeight) return;
            // 归一化不同 deltaMode 到像素
            const delta =
                e.deltaMode === 1
                    ? e.deltaY * 16
                    : e.deltaMode === 2
                      ? e.deltaY * bodyEl.clientHeight
                      : e.deltaY;
            if (delta === 0) return;
            // 滚轮发生在 DateContent 内部仍可滚动的区域里：放行，不做行步进
            if (isInnerScrollable(e.target, bodyEl, delta)) return;
            e.preventDefault();
            const now = performance.now();
            const direction = Math.sign(delta);
            // 反向滚动时丢弃旧累积量与冷却，保证立即响应
            if (direction !== Math.sign(wheelAccRef.current)) {
                wheelAccRef.current = 0;
            }
            // 距上一次步进太近：视为同一格滚轮拆出来的余波，直接吞掉
            if (now - lastWheelStepRef.current < WHEEL_STEP_COOLDOWN) {
                wheelAccRef.current = 0;
                return;
            }
            wheelAccRef.current += delta;
            const threshold = Math.min(rowHeight, WHEEL_STEP_THRESHOLD);
            if (Math.abs(wheelAccRef.current) < threshold) return;
            // 一次只走一行：只取方向，并清空累积量
            const rows = direction;
            wheelAccRef.current = 0;
            lastWheelStepRef.current = now;
            // 以「上一次的目标行」为基准累加：动画未结束时连续滚动也不会丢步或错位
            const baseRow = Math.round(targetTopRef.current / rowHeight);
            scrollToTop((baseRow + rows) * rowHeight, smooth);
        };
        bodyEl.addEventListener("wheel", onWheel, { passive: false });
        return () => bodyEl.removeEventListener("wheel", onWheel);
    }, [bodyEl, wheelType, rowHeightOf, scrollToTop, smooth]);

    /* ---------------- scroll：更新月份 + 手动滚动后对齐到整行 ---------------- */

    useEffect(() => {
        if (bodyEl == null) return;
        let idleTimer: ReturnType<typeof setTimeout> | undefined;
        const onScroll = () => {
            updateCurrentMonth(bodyEl);
            if (isProgrammatic()) return;
            // 拖动滚动条/键盘/触摸等非程序滚动：同步目标位置，并在停止后对齐
            targetTopRef.current = bodyEl.scrollTop;
            if (wheelType !== "row") return;
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                if (isProgrammatic()) return;
                const rowHeight = rowHeightOf(bodyEl);
                if (!rowHeight) return;
                scrollToTop(
                    Math.round(bodyEl.scrollTop / rowHeight) * rowHeight,
                    smooth,
                );
            }, SNAP_IDLE_DELAY);
        };
        bodyEl.addEventListener("scroll", onScroll, { passive: true });
        updateCurrentMonth(bodyEl);
        return () => {
            clearTimeout(idleTimer);
            bodyEl.removeEventListener("scroll", onScroll);
        };
    }, [bodyEl, wheelType, updateCurrentMonth, rowHeightOf, scrollToTop, smooth]);

    // 容器尺寸变化（行高是百分比）后重新对齐到原来的行
    useEffect(() => {
        if (bodyEl == null || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(() => {
            const rowHeight = rowHeightOf(bodyEl);
            if (!rowHeight) return;
            scrollToTop(Math.round(targetRowRef.current) * rowHeight, false);
        });
        ro.observe(bodyEl);
        return () => ro.disconnect();
    }, [bodyEl, rowHeightOf, scrollToTop]);

    const [headerPaddingRight, setHeaderPaddingRight] = useState<number>();
    useEffect(() => {
        if (bodyEl == null) return;
        setHeaderPaddingRight(bodyEl.offsetWidth - bodyEl.clientWidth);
    }, [bodyEl, start, end, viewRows]);

    const height = (100 / viewRows).toFixed(4) + "%";

    monthTagsWrapper =
        monthTagsWrapper || ((children) => <nav>{children}</nav>);

    const calendarHeaderMemo = useMemo(() => {
        return (
            <FreeCalendarHeader
                headerStyle={
                    headerPaddingRight
                        ? { paddingRight: headerPaddingRight, ...headerStyle }
                        : headerStyle
                }
                start={start}
                mondayIsFirstAtWeek={mondayIsFirstAtWeek}
                showBorder={showBorder}
                weekNameFormat={weekNameFormat}
            />
        );
    }, [
        headerStyle,
        start,
        mondayIsFirstAtWeek,
        showBorder,
        weekNameFormat,
        headerPaddingRight,
    ]);

    const _datesWrapper: (
        children: React.ReactNode,
        ref: React.Ref<HTMLDivElement> | undefined,
    ) => React.ReactNode | JSX.Element =
        datesWrapper == undefined
            ? (children, ref) => (
                  <div ref={ref} style={{ overflow: "auto" }}>
                      {children}
                  </div>
              )
            : datesWrapper;
    const calendarBodyMemo = useMemo(() => {
        return _datesWrapper(
            <FreeCalendarBody
                id={id}
                start={start}
                end={end}
                height={height}
                showBorder={showBorder}
                mondayIsFirstAtWeek={mondayIsFirstAtWeek}
                showWeekNumber={showWeekNumber}
                weekNumberWrapper={weekNumberWrapper}
                DateContent={DateContent}
                fixed={fixed}
            />,
            bodyRef,
        );
    }, [
        start,
        end,
        id,
        height,
        showBorder,
        mondayIsFirstAtWeek,
        showWeekNumber,
        weekNumberWrapper,
        DateContent,
        fixed,
    ]);

    return (
        <div style={{ display: "flex", height: "100%" }}>
            {showMonthTags &&
                monthTagsWrapper(
                    <MonthTags
                        start={start}
                        end={end}
                        activeMonth={currentScrollMonth}
                        activeYear={currentScrollYear}
                        monthTagNameFormat={monthTagNameFormat}
                        color={monthTagColor}
                        activeColor={monthTagActiveColor}
                        onClick={(yearMonth) =>
                            scrollTo(
                                new Date(
                                    yearMonth.year,
                                    yearMonth.month - 1,
                                    1,
                                ),
                                true,
                            )
                        }
                    />,
                )}
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minWidth: 0,
                    height: "100%",
                }}
            >
                {calendarHeaderMemo}
                {calendarBodyMemo}
            </div>
        </div>
    );
};

export default FreeCalendar;

interface FreeCalendarBodyProps {
    id: string | number;
    start: Date;
    end: Date;
    mondayIsFirstAtWeek: boolean;
    DateContent: React.FC<DateContentProps>;
    weekNumberWrapper?: (weekNumber: number) => React.ReactNode;
    fixed?: { date: Date; smooth: boolean };
    height: string;
    showBorder: boolean;
    showWeekNumber: boolean | undefined;
}
const FreeCalendarBody: React.FC<FreeCalendarBodyProps> = ({
    id,
    start,
    end,
    height,
    showBorder,
    mondayIsFirstAtWeek,
    showWeekNumber,
    weekNumberWrapper,
    DateContent: DateContent,
    fixed,
}) => {
    const leftDates = leftPaddingDate(start, mondayIsFirstAtWeek);
    const dates = getDates(start, end);
    return (
        <>
            {leftDates.map((d, index) => (
                <OneDay
                    key={d.toString()}
                    calendarId={id}
                    date={d}
                    showContent={false}
                    height={height}
                    topBorder={false}
                    rightBorder={showBorder}
                    bottomBorder={showBorder}
                    leftBorder={showBorder && index == 0}
                    firstDayAtWeek={
                        mondayIsFirstAtWeek ? d.getDay() == 1 : d.getDay() == 0
                    }
                    weekNumber={showWeekNumber ? 1 : undefined}
                    weekNumberWrapper={weekNumberWrapper}
                />
            ))}
            {dates.map((date, index) => (
                <OneDay
                    key={date.toString()}
                    calendarId={id}
                    date={date}
                    height={height}
                    topBorder={false}
                    rightBorder={showBorder}
                    bottomBorder={showBorder}
                    leftBorder={
                        showBorder &&
                        isFirstDayOfWeek(date, mondayIsFirstAtWeek)
                    }
                    firstDayAtWeek={
                        mondayIsFirstAtWeek
                            ? date.getDay() == 1
                            : date.getDay() == 0
                    }
                    weekNumber={
                        showWeekNumber
                            ? Math.floor((leftDates.length + index) / 7) + 1
                            : undefined
                    }
                    weekNumberWrapper={weekNumberWrapper}
                >
                    <DateContent
                        date={date}
                        active={Boolean(
                            fixed &&
                                fixed.date &&
                                isDateEquals(fixed.date, date),
                        )}
                    />
                </OneDay>
            ))}
        </>
    );
};

interface FreeCalendarHeaderProps {
    headerStyle?: React.CSSProperties;
    start: Date;
    mondayIsFirstAtWeek: boolean;
    showBorder: boolean;
    weekNameFormat: (date: Date) => string | JSX.Element;
}
const FreeCalendarHeader: React.FC<FreeCalendarHeaderProps> = ({
    headerStyle,
    start,
    mondayIsFirstAtWeek,
    showBorder,
    weekNameFormat,
}) => {
    return (
        <div style={headerStyle}>
            {getFirstWeekDays(start.getFullYear(), mondayIsFirstAtWeek).map(
                (d, index) => (
                    <One
                        key={index}
                        height="2rem"
                        topBorder={showBorder}
                        rightBorder={showBorder}
                        bottomBorder={showBorder}
                        leftBorder={showBorder && index == 0}
                    >
                        {weekNameFormat(d)}
                    </One>
                ),
            )}
        </div>
    );
};
