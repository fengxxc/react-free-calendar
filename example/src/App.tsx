import { useState, useMemo } from "react";
import "./App.css";
import FreeCalendar, {
    SimpleOneDayContent,
    CalendarUtil,
    WheelTypeType,
} from "react-free-calendar";

function App() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [startMonth, setStartMonth] = useState<number>(1);
    const [endMonth, setEndMonth] = useState<number>(12);
    const [fixedDate, setFixedDate] = useState<Date>(() => new Date());
    const [viewYearMonth, setViewYearMonth] = useState<string>("");
    const fixedProp = useMemo(() => ({ date: fixedDate, smooth: true }), [fixedDate]);
    return (
        <>
            <div
                style={{
                    textAlign: "left",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ flexShrink: 0, marginBottom: "0.5rem" }}>
                    <label htmlFor="year">Year:</label>
                    <input
                        type="number"
                        id="year"
                        min={1900}
                        max={2100}
                        value={year}
                        onInput={(e) =>
                            setYear(
                                parseInt((e.target as HTMLInputElement).value),
                            )
                        }
                    />
                    &emsp;
                    <label htmlFor="startMonth">Start Month:</label>
                    <input
                        type="number"
                        id="startMonth"
                        value={startMonth}
                        min={1}
                        max={12}
                        onInput={(e) =>
                            setStartMonth(
                                parseInt((e.target as HTMLInputElement).value),
                            )
                        }
                    />
                    &emsp;
                    <label htmlFor="endMonth">End Month:</label>
                    <input
                        type="number"
                        id="endMonth"
                        value={endMonth}
                        min={1}
                        max={12}
                        onInput={(e) =>
                            setEndMonth(
                                parseInt((e.target as HTMLInputElement).value),
                            )
                        }
                    />
                    &emsp;
                    <button onClick={() => {
                        const today = new Date();
                        setYear(today.getFullYear());
                        if (today.getMonth() + 1 < startMonth) {
                            setStartMonth(today.getMonth() + 1);
                        }
                        if (today.getMonth() + 1 > endMonth) {
                            setEndMonth(today.getMonth() + 1);
                        }
                        setFixedDate(today);
                    }}>
                        today
                    </button>
                    &emsp;
                    <span>view: {viewYearMonth}</span>
                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                    <FreeCalendar
                        wheelType={"native" as WheelTypeType}
                        id={"test-free-calendar"}
                        start={new Date(year, startMonth - 1, 1)}
                        end={CalendarUtil.getMonthLastDay(
                            new Date(year, endMonth - 1, 1),
                        )}
                        mondayIsFirstAtWeek={true}
                        DateContent={({ date, active }) => (
                            <SimpleOneDayContent
                                date={date}
                                color={
                                    active || CalendarUtil.isToday(date)
                                        ? "white"
                                        : "inherit"
                                }
                                backgroundColor={
                                    active
                                        ? "blue"
                                        : CalendarUtil.isToday(date)
                                            ? "lightblue"
                                            : "inherit"
                                }
                                showMonthAtFirstOfMonth={true}
                                onClick={
                                    (/* date: Date */) => {
                                        // onClick(date)
                                        // setFixedDate(date)
                                    }
                                }
                            />
                        )}
                        // fixed={{ date: fixedDate, smooth: true }}
                        fixed={fixedProp}
                        //   headerStyle={{marginRight: "0.4rem"}}
                        datesWrapper={(children, ref) => (
                            <div ref={ref} className="scrollbar">
                                {children}
                            </div>
                        )}
                        weekNameFormat={(d: Date) =>
                            ["日", "一", "二", "三", "四", "五", "六"][d.getDay()]
                        }
                        onMonthChange={(year, month) => {
                            setViewYearMonth(year + "-" + month);
                            console.log("onMonthChange", year, month);
                        }}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
