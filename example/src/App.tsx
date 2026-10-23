import { useState, useMemo } from "react";
import "./App.css";
import FreeCalendar, {
    CalendarUtil,
    WheelTypeType,
} from "react-free-calendar";

interface Item {
    id: string;
    time: string;
    content: string;
}

interface AwesomeDateContentProps {
    date: Date;
    color: string;
    backgroundColor: string;
    showMonthAtFirstOfMonth?: boolean;
    onClick?: (date: Date) => void;
    datas: Item[];
}

const AwesomeDateContent: React.FC<AwesomeDateContentProps> = ({
    date,
    color,
    backgroundColor,
    showMonthAtFirstOfMonth,
    onClick,
    datas,
}) => {
    return (
        <div className="calendar-date-wrapper">
            <div
                className="calendar-date"
                style={{ backgroundColor, color }}
                onClick={() => onClick && onClick(date)}
            >
                {date.getDate() === 1 && showMonthAtFirstOfMonth && (
                    <>
                        <strong>{date.getMonth() + 1}</strong>
                        <span>/</span>
                    </>
                )}
                {date.getDate()}
            </div>

            <ul className="calendar-date-content scrollbar">
                {datas.map((item) => (
                    <li key={item.id} className="url-item">
                        <span className="url-item__time">
                            {new Date(item.time).toLocaleTimeString()}
                        </span>
                        {item.content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

function App() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [startMonth, setStartMonth] = useState<number>(1);
    const [endMonth, setEndMonth] = useState<number>(12);
    const [fixedDate, setFixedDate] = useState<Date>(() => new Date());
    const [viewYearMonth, setViewYearMonth] = useState<string>("");
    const fixedProp = useMemo(() => ({ date: fixedDate, smooth: true }), [fixedDate]);
    const [mondayIsFirstAtWeek, setMondayIsFirstAtWeek] = useState<boolean>(true);
    const [showMonthTags, setShowMonthTags] = useState<boolean>(true);
    const [showBorder, setShowBorder] = useState<boolean>(true);
    const [showWeekNumber, setShowWeekNumber] = useState<boolean>(true);
    const [viewRows, setViewRows] = useState<number>(5);
    const [wheelType, setWheelType] = useState<WheelTypeType>("row");
    const [datasMap, setDatasMap] = useState<Record<string, Item[]>>({
        "2026-10-1": [
            { id: "1", time: "2026-10-01 00:00", content: "Event 1" },
            { id: "2", time: "2026-10-01 14:00", content: "Event 2" },
            { id: "3", time: "2026-10-01 09:00", content: "Event 3" },
            { id: "4", time: "2026-10-01 16:00", content: "Event 4" },
            { id: "7", time: "2026-10-01 18:00", content: "Event 5" },
        ],
        "2026-10-2": [
            { id: "5", time: "2026-10-02 11:00", content: "Event 6" },
        ],
        "2026-10-3": [
            { id: "6", time: "2026-10-03 15:00", content: "Event 7" },
        ],
    });
    return (
        <>
            <div
                style={{
                    textAlign: "left",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                    <FreeCalendar
                        id={"test-free-calendar"}
                        start={new Date(year, startMonth - 1, 1)}
                        end={CalendarUtil.getMonthLastDay(
                            new Date(year, endMonth - 1, 1),
                        )}
                        DateContent={({ date, active }) => (
                            <AwesomeDateContent
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
                                datas={datasMap[CalendarUtil.formatDate(date)] || []}
                                onClick={
                                    (/* date: Date */) => {
                                        // onClick(date)
                                        // setFixedDate(date)
                                    }
                                }
                            />
                        )}
                        mondayIsFirstAtWeek={mondayIsFirstAtWeek}
                        fixed={fixedProp}
                        showMonthTags={showMonthTags}
                        showBorder={showBorder}
                        showWeekNumber={showWeekNumber}
                        viewRows={viewRows}
                        wheelType={wheelType}
                        //   headerStyle={{marginRight: "0.4rem"}}
                        datesWrapper={(children, ref) => (
                            <div ref={ref} className="scrollbar">
                                {children}
                            </div>
                        )}
                        weekNameFormat={(d: Date) =>
                            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
                        }
                        onMonthChange={(year, month) => {
                            setViewYearMonth(year + "-" + month);
                            console.log("onMonthChange", year, month);
                        }}
                    />
                </div>

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
                    <br /> <br />
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
                    <br /> <br />
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
                    <br /> <br />
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
                    <br /> <br />
                    <span>view: {viewYearMonth}</span>
                    <br /> <br />
                    <label htmlFor="mondayIsFirstAtWeek">
                        Monday is first at week:
                    </label>
                    <input
                        type="checkbox"
                        id="mondayIsFirstAtWeek"
                        checked={mondayIsFirstAtWeek}
                        onChange={(e) =>
                            setMondayIsFirstAtWeek(
                                (e.target as HTMLInputElement).checked
                            )
                        }
                    />
                    <br /> <br />
                    <label htmlFor="showMonthTags">Show Month Tags:</label>
                    <input
                        type="checkbox"
                        id="showMonthTags"
                        checked={showMonthTags}
                        onChange={(e) => {
                            setShowMonthTags((e.target as HTMLInputElement).checked);
                        }}
                    />
                    <br /> <br />
                    <label htmlFor="showBorder">Show Border:</label>
                    <input
                        type="checkbox"
                        id="showBorder"
                        checked={showBorder}
                        onChange={(e) => {
                            setShowBorder((e.target as HTMLInputElement).checked);
                        }}
                    />
                    <br /> <br />
                    <label htmlFor="showWeekNumber">Show Week Number:</label>
                    <input
                        type="checkbox"
                        id="showWeekNumber"
                        checked={showWeekNumber}
                        onChange={(e) => {
                            setShowWeekNumber((e.target as HTMLInputElement).checked);
                        }}
                    />
                    <br /> <br />
                    <label htmlFor="viewRows">View Rows:</label>
                    <input
                        type="number"
                        id="viewRows"
                        value={viewRows}
                        min={1}
                        max={12}
                        onInput={(e) =>
                            setViewRows(
                                parseInt((e.target as HTMLInputElement).value),
                            )
                        }
                    />
                    <br /> <br />
                    <label htmlFor="wheelType">Wheel Type:</label>
                    <select
                        id="wheelType"
                        value={wheelType}
                        onChange={(e) => {
                            setWheelType((e.target as HTMLSelectElement).value as WheelTypeType);
                        }}
                    >
                        <option value="native">native</option>
                        <option value="row">row</option>
                    </select>
                </div>
            </div>
        </>
    );
}

export default App;
