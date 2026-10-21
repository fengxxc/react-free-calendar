function genMonthsSeries(start: Date, end: Date) {
    const result = [];
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();
    for (let year = startYear; year <= endYear; year++) {
        for (
            let month = year === startYear ? startMonth : 0;
            month <= (year === endYear ? endMonth : 11);
            month++
        ) {
            const yearMonth = {
                year: year,
                month: month + 1,
            };
            result.push(yearMonth);
        }
    }
    return result;
}

interface MonthTagsProps {
    start: Date;
    end: Date;
    activeMonth: number; // from 1 to 12
    activeYear?: number;
    monthTagNameFormat?: (date: Date) => string | JSX.Element;
    color?: string;
    activeColor?: string;
    onClick: (yearMonth: { year: number; month: number }) => void;
}
const MonthTags: React.FC<MonthTagsProps> = ({
    start,
    end,
    activeMonth,
    activeYear,
    monthTagNameFormat,
    color = "#777",
    activeColor = "#000",
    onClick,
}) => {
    const isActive = (yearMonth: { year: number; month: number }) => {
        return (
            yearMonth.month == activeMonth &&
            (activeYear == undefined || yearMonth.year == activeYear)
        );
    };
    return (
        <>
            {genMonthsSeries(start, end).map((yearMonth, index) => (
                <button
                    key={index}
                    style={{
                        color: isActive(yearMonth) ? activeColor : color,
                        display: "block",
                        textAlign: "right",
                        fontWeight: isActive(yearMonth) ? "bold" : "normal",
                        minWidth: "60px",
                        textTransform: "none",
                        border: "none",
                        background: "transparent",
                        padding: "7px",
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        onClick(yearMonth);
                    }}
                >
                    {monthTagNameFormat
                        ? monthTagNameFormat(
                              new Date(yearMonth.year, yearMonth.month - 1, 1),
                          )
                        : yearMonth.month}
                </button>
            ))}
        </>
    );
};

export default MonthTags;
