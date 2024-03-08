import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type Month = { value: number; label: string };
export type Day = { value: number; label: string };

type HolidaysData = {
    date: string,
    localName: string | null,
    name: string | null,
    countryCode: string | null,
    fixed: boolean,
    global: boolean,
    countries: string[] | null,
    launchYear?: number,
    types: string[]
}

const fetchData = createAsyncThunk("calendar/fetchData", async (year: number | undefined): Promise<HolidaysData[]> => {
    try {
        const res = await fetch("https://ipinfo.io/json");

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const ipInfo = await res.json();

        const holidaysResponse = await fetch(`https://date.nager.at/api/v3/publicholidays/${year || new Date().getFullYear()}/${ipInfo.country}`);

        if (!holidaysResponse.ok) {
            throw new Error(`HTTP error! Status: ${holidaysResponse.status}`);
        }

        const fetchHolidays: HolidaysData[] = await holidaysResponse.json();

        return fetchHolidays;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
});


const createMonthList = (): Month[] => {
    return Array.from({ length: 12 }, (_, index: number): Month => ({
        value: index,
        label: new Date(0, index).toLocaleString('default', { month: 'long' }),
    }));
};

const createDayList = (year: number, month: number): Day[] => {
    const maxDaysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 - воскресенье, 1 - понедельник, и так далее

    const startOffset = (firstDayOfMonth + 6) % 7;

    const days: Day[] = Array.from({ length: startOffset }, () => ({ value: 0, label: '' }));

    for (let day = 1; day <= maxDaysInMonth; day++) {
        days.push({ value: day, label: day.toString() });
    }

    return days;
};

const getCurrentMonth = (): Month => {
    const currentMonthIndex = new Date().getMonth();
    return {
        value: currentMonthIndex,
        label: new Date(0, currentMonthIndex).toLocaleString('default', { month: 'long' }),
    };
};

interface calendarState {
    currentMonth: Month;
    currentYear: number;
    months: Month[];
    days: Day[];
    holidaysForYear: HolidaysData[] | null;
    currentMonthHolidays: HolidaysData[] | null
}

const initialState: calendarState = {
    currentMonth: getCurrentMonth(),
    currentYear: new Date().getFullYear(),
    months: createMonthList(),
    days: createDayList(new Date().getFullYear(), new Date().getMonth()),
    holidaysForYear: null,
    currentMonthHolidays: null
}

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        nextMonth: (state) => {
            const nextMonthIndex = (state.currentMonth.value + 1) % 12;
            if (nextMonthIndex === 0) {
                state.currentYear += 1
                fetchData(state.currentYear)
            }
            state.currentMonth = state.months[nextMonthIndex];

            const maxDaysInNextMonth = new Date(state.currentYear, nextMonthIndex + 1, 0).getDate();
            const firstDayOfMonth = new Date(state.currentYear, nextMonthIndex, 1).getDay();
            const startOffset = (firstDayOfMonth + 6) % 7;

            state.currentMonthHolidays = state.holidaysForYear !== null
                ? state.holidaysForYear.filter((holiday) => {
                    const holidayMonth = new Date(holiday.date).getMonth() + 1;
                    return holidayMonth === state.currentMonth.value;
                })
                : null;
            state.days.forEach((day, index) => {
                if (index < startOffset || index >= startOffset + maxDaysInNextMonth) {
                    day.value = 0;
                    day.label = '';
                } else {
                    day.value = index - startOffset + 1;
                    day.label = (index - startOffset + 1).toString();
                }
            });
        },
        prevMonth: (state) => {
            const prevMonthIndex = (state.currentMonth.value - 1 + 12) % 12;
            if (prevMonthIndex === 11) {
                state.currentYear -= 1
                fetchData(state.currentYear)
            }
            state.currentMonth = state.months[prevMonthIndex];

            const maxDaysInPrevMonth = new Date(state.currentYear, prevMonthIndex + 1, 0).getDate();
            const firstDayOfMonth = new Date(state.currentYear, prevMonthIndex, 1).getDay();
            const startOffset = (firstDayOfMonth + 6) % 7;

            state.currentMonthHolidays = state.holidaysForYear !== null
                ? state.holidaysForYear.filter((holiday) => {
                    const holidayMonth = new Date(holiday.date).getMonth() + 1;
                    return holidayMonth === state.currentMonth.value;
                })
                : null;
            state.days.forEach((day, index) => {
                if (index < startOffset || index >= startOffset + maxDaysInPrevMonth) {
                    day.value = 0;
                    day.label = '';
                } else {
                    day.value = index - startOffset + 1;
                    day.label = (index - startOffset + 1).toString();
                }
            });
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchData.fulfilled, (state, action) => {
            const currentMonth = new Date().getMonth() + 1;
            state.holidaysForYear = action.payload;
            state.currentMonthHolidays = state.holidaysForYear.filter((holiday) => {
                const holidayMonth = new Date(holiday.date).getMonth() + 1;
                return holidayMonth === currentMonth;
            });
        });
    }
})

export {fetchData}
export const { actions, reducer } = calendarSlice;
