import { useState } from "react";
import "./App.css";
import FreeCalendar, {
    SimpleOneDayContent,
    CalendarUtil,
    WheelTypeType,
} from "react-free-calendar";

function App() {
    const [startMonth, setStartMonth] = useState<number>(0);
    const [endMonth, setEndMonth] = useState<number>(11);
    return (
        <>
            <div
                style={{
                    textAlign: "left",
                    height: "95%",
                    width: "95%",
                }}
            >
                <input
                    type="number"
                    value={startMonth}
                    onInput={(e) =>
                        setStartMonth(
                            parseInt((e.target as HTMLInputElement).value),
                        )
                    }
                />
                <input
                    type="number"
                    value={endMonth}
                    onInput={(e) =>
                        setEndMonth(
                            parseInt((e.target as HTMLInputElement).value),
                        )
                    }
                />
                <FreeCalendar
                    wheelType={"native" as WheelTypeType}
                    id={"test-free-calendar"}
                    start={new Date(new Date().getFullYear(), startMonth, 1)}
                    end={CalendarUtil.getMonthLastDay(
                        new Date(new Date().getFullYear(), endMonth, 1),
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
                                      : "inhert"
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
                    //   headerStyle={{marginRight: "0.4rem"}}
                    datesWrapper={(children, ref) => (
                        <div ref={ref} className="scrollbar">
                            {children}
                        </div>
                    )}
                    weekNameFormat={(d: Date) =>
                        ["日", "一", "二", "三", "四", "五", "六"][d.getDay()]
                    }
                />
            </div>
        </>
    );
}

export default App;
