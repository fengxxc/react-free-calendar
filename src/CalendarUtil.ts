export function getDates(startDate: Date, endDate: Date) {
    var dateArray = [];
    var currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    while (currentDate <= endDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
}

export function getMonthLastDay(date: Date) {
    const month = date.getMonth();
    const nextMonthFirstDay = new Date(date.getFullYear(), month + 1, 1);
    const lastDay = new Date(nextMonthFirstDay);
    lastDay.setDate(lastDay.getDate() - 1);
    return lastDay;
}

export function formatDate(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function isDateEquals(date1: Date, date2: Date) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function isToday(someDate: Date) {
    const today = new Date();
    return isDateEquals(today, someDate);
}

export function offsetOfFristInWeek(date: Date, mondayIsFirstAtWeek: boolean) {
    let offset = 0;
    if (mondayIsFirstAtWeek) {
        if (date.getDay() == 0) {
            offset = 6;
        } else {
            offset = date.getDay() - 1;
        }
    } else {
        offset = date.getDay();
    }
    return offset;
}

export function offsetOfLastInWeek(date: Date, mondayIsFirstAtWeek: boolean) {
    return 7 - offsetOfFristInWeek(date, mondayIsFirstAtWeek) - 1;
}

export function isFirstDayOfWeek(date: Date, mondayIsFirstAtWeek: boolean) {
    return offsetOfFristInWeek(date, mondayIsFirstAtWeek) == 0;
}

export function leftPaddingDate(date: Date, mondayIsFirstAtWeek: boolean) {
    const offset = offsetOfFristInWeek(date, mondayIsFirstAtWeek);
    const _start = new Date(new Date(date).setDate(date.getDate() - offset));
    const _end = new Date(new Date(date).setDate(date.getDate() - 1));
    const dates = getDates(_start, _end);
    return dates;
}

/**
 * date所在月份有多少天
 * */
export function getDaysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 *  获取year年第一个从周一至周日
 * @param year
 * @param mondayIsFirstAtWeek 周一是一周的开始吗
 */
export function getFirstWeekDays(year: number, mondayIsFirstAtWeek: boolean) {
    const d = new Date(year, 0, 7);
    let index = d.getDay();
    index = index == 0 ? 7 : index;
    index = mondayIsFirstAtWeek ? index - 1 : index;
    const prevDate = [];
    const nextDate = [];
    for (let i = 0; i < index; i++) {
        prevDate.push(new Date(year, 0, d.getDate() - (index - i)));
    }
    if (prevDate.length == 7) {
        return prevDate;
    }
    for (let j = 0; j < 7 - index - 1; j++) {
        nextDate.push(new Date(year, 0, d.getDate() + j + 1));
    }
    return [...prevDate, d, ...nextDate];
}

/* function getSeconds(timestamp: string) {
    const sp = timestamp.split(":").map(Number)
    let seconds = 0
    for (let i = 0; i < sp.length; i++) {
        seconds += sp[i] * (60 ** (sp.length - i - 1))
    }
    return seconds
} */

export function getSecondsByYoutubeUrl(url: string) {
    const reg = /t=(\d+)/;
    const result = url.match(reg);
    if (result == null) return 0;
    return parseInt(result[1]);
}
