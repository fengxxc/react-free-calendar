interface SimpleOneDayContentProps {
    date: Date;
    color: string;
    backgroundColor: string;
    showMonthAtFirstOfMonth?: boolean;
    onClick?: (date: Date) => void;
}
const SimpleOneDayContent: React.FC<SimpleOneDayContentProps> = ({
    date,
    color,
    backgroundColor,
    showMonthAtFirstOfMonth = true,
    onClick,
}) => {
    return (
        <div
            style={{
                display: "inline-block",
                marginBottom: "3px",
                backgroundColor: backgroundColor,
                color: color,
                padding: "0px 1px",
                borderRadius: "0.5rem",
                minWidth: "1.4rem",
            }}
            onClick={() => onClick && onClick(date)}
        >
            {date.getDate() == 1 && showMonthAtFirstOfMonth && (
                <>
                    <strong>{date.getMonth() + 1}</strong>
                    <span>/</span>
                </>
            )}
            {date.getDate()}
        </div>
    );
};
export default SimpleOneDayContent;
