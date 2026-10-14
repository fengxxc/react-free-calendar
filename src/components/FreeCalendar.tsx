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
    getDaysInMonth,
    getFirstWeekDays,
} from "../CalendarUtil";
import { DateContentProps, WheelTypeType } from "./ExportTypes";

function getDayElementByDate(prevId: string | number, date: Date) {
    return document.getElementById(
        `${prevId}_calendar_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
    );
}

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
    start,
    end,
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
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const scrollToDateRef = useRef<Date>(fixed?.date || start);
    const scrollTo = useCallback(
        (scrollToDate: Date | undefined, smooth: boolean) => {
            if (scrollToDate == undefined) return;
            scrollToDateRef.current = scrollToDate;
            const _year = scrollToDate.getFullYear();
            if (smooth) {
                let delay = 0;
                if (_year < start.getFullYear() || _year > end.getFullYear()) {
                    delay = 200;
                }
                setTimeout(() => {
                    getDayElementByDate(
                        id,
                        new Date(
                            scrollToDate.getFullYear(),
                            scrollToDate.getMonth(),
                            1,
                        ),
                    )?.scrollIntoView({ behavior: "smooth" });
                }, delay);
            } else {
                getDayElementByDate(
                    id,
                    new Date(
                        scrollToDate.getFullYear(),
                        scrollToDate.getMonth(),
                        1,
                    ),
                )?.scrollIntoView({ behavior: "auto" });
            }
        },
        [fixed],
    );

    useEffect(() => {
        scrollTo(fixed?.date, fixed?.smooth || false);
    }, [fixed]);

    const [currentScrollMonth, setCurrentScrollMonth] = useState(1);

    // 所有1日的dom id
    const [firstDayIds, setFirstDayIds] = useState<string[]>([]);

    useEffect(() => {
        for (let i = start.getFullYear(); i <= end.getFullYear(); i++) {
            for (let j = 1; j <= 12; j++) {
                firstDayIds.push(`${id}_calendar_${i}-${j}-1`);
                setFirstDayIds(firstDayIds);
            }
        }
    }, [start, end]);

    const onScroll = () => {
        if (bodyRef.current == null) return;
        const candidate = [];
        for (let i = 0; i < firstDayIds.length; i++) {
            const el = document.querySelector(`#${firstDayIds[i]}`);
            if (el == null) continue;
            const rect = el.getBoundingClientRect();
            const date = new Date(firstDayIds[i].split("_")[2]);
            const row = Math.floor(
                (offsetOfFristInWeek(date, mondayIsFirstAtWeek) +
                    getDaysInMonth(date)) /
                    7,
            );
            if (0 - row * rect.height <= rect.top && rect.top <= rect.height) {
                candidate.push(date);
            }
        }
        const currentScrollDate =
            candidate.length > 0 ? candidate[candidate.length - 1] : null;
        if (currentScrollDate == null) return;
        setCurrentScrollMonth(currentScrollDate.getMonth() + 1);
        onMonthChange?.(currentScrollDate.getFullYear(), currentScrollDate.getMonth() + 1 );
    };

    const wheelStepRef = useRef<number>(0);
    const onWheel = (e: WheelEvent) => {
        if (bodyRef.current == null) return;
        e.preventDefault();
        if (wheelStepRef.current < 2) {
            wheelStepRef.current++;
            return;
        }
        const newDate = new Date(scrollToDateRef.current.getTime());
        newDate.setDate(
            scrollToDateRef.current.getDate() + Math.sign(e.deltaY) * 7,
        );
        const year = scrollToDateRef.current.getFullYear();
        if (year == newDate.getFullYear() && newDate < new Date(year, 11, 8)) {
            scrollToDateRef.current = newDate;
            // getDayElementByDate(id, newDate)?.scrollIntoView({ behavior: "smooth" })
            getDayElementByDate(id, newDate)?.scrollIntoView({
                behavior: "auto",
            });
        }
        wheelStepRef.current = 0;
    };

    const [headerPaddingRight, setHeaderPaddingRight] = useState<number>();
    useEffect(() => {
        if (bodyRef.current == null) return;
        const rightPadding =
            bodyRef.current.offsetWidth - bodyRef.current.clientWidth;
        setHeaderPaddingRight(rightPadding);
    }, [bodyRef, start, end, viewRows]);

    useEffect(() => {
        if (wheelType == "row") {
            bodyRef.current?.addEventListener("wheel", onWheel);
        }
        bodyRef.current?.addEventListener("scroll", onScroll);

        return () => {
            if (wheelType == "row") {
                bodyRef.current?.removeEventListener("wheel", onWheel);
            }
            bodyRef.current?.removeEventListener("scroll", onScroll);
        };
    }, []);

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
