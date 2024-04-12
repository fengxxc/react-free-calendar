import { formatDate } from "../CalendarUtil";
import React, { PropsWithChildren } from "react";

export interface Cell {
    height?: string | number;
    topBorder?: boolean;
    rightBorder?: boolean;
    bottomBorder?: boolean;
    leftBorder?: boolean;
}
interface OneProps extends Cell {
    id?: string;
    children?: React.ReactNode;
}
export const One: React.FC<OneProps> = ({
    id,
    children,
    height,
    topBorder,
    rightBorder,
    bottomBorder,
    leftBorder,
}) => {
    return (
        <div
            id={id || ""}
            style={{
                position: "relative",
                display: "inline-block",
                padding: "4px 0",
                width: "14.2%",
                boxSizing: "border-box",
                minHeight: "1rem",
                verticalAlign: "bottom",
                textAlign: "center",
                height: height,
                borderTop: topBorder ? "1px solid #DADCE0" : "none",
                borderLeft: leftBorder ? "1px solid #DADCE0" : "none",
                borderRight: rightBorder ? "1px solid #DADCE0" : "none",
                borderBottom: bottomBorder ? "1px solid #DADCE0" : "none",
            }}
        >
            {children}
        </div>
    );
};

interface OneDayProps extends Cell {
    calendarId: string | number;
    index?: number;
    date: Date;
    showContent?: boolean;
    firstDayAtWeek?: boolean;
    weekNumber?: number;
    weekNumberWrapper?: (weekNumber: number) => React.ReactNode;
}
export const OneDay: React.FC<PropsWithChildren<OneDayProps>> = ({
    children,
    calendarId,
    date,
    showContent = true /* , datas */,
    firstDayAtWeek,
    weekNumber,
    weekNumberWrapper,
    height,
    topBorder,
    rightBorder,
    bottomBorder,
    leftBorder,
}) => {
    weekNumberWrapper =
        weekNumberWrapper ||
        ((weekNumber) => (
            <span
                style={{
                    color: "gray",
                    fontSize: "0.75rem",
                    position: "absolute",
                    left: "1px",
                }}
            >
                {weekNumber}
            </span>
        ));
    return (
        <One
            height={height}
            topBorder={topBorder}
            rightBorder={rightBorder}
            bottomBorder={bottomBorder}
            leftBorder={leftBorder}
            id={`${calendarId}_calendar_${formatDate(date)}`}
        >
            {firstDayAtWeek && weekNumber && weekNumberWrapper(weekNumber)}
            {showContent && children}
        </One>
    );
};
