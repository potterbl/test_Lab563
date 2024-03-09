import styles from "./component.module.css"
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import DateItem from "../DateItem/DateItem";
import {useRef, useState} from "react";
import {toPng} from "html-to-image"
import {actions as calendarActions, HolidaysData} from "../../store/slices/calendarSlice";
import {actions as tasksActions} from "../../store/slices/tasksSlice"
import {task} from "../../store/slices/tasksSlice";

const CalendarBody = () => {
    const bodyRef= useRef(null)

    const [color, setColor] = useState<string>("#000")

    const dispatch = useDispatch()

    const {days, searchParams, currentYear, holidaysForYear} = useSelector((state: RootState) => state.calendar)

    const {tasks: allTasks} = useSelector((state: RootState) => state.tasks)

    const getLocalizedDayNames = () => {
        const dayNames = [];

        const dateFormatter = new Intl.DateTimeFormat(navigator.language, { weekday: "short" });

        for (let i = 3; i <= 9; i++) {
            const dayIndex = i % 7;
            const date = new Date(2024, 2, dayIndex + 1);
            const dayNamePart = dateFormatter.formatToParts(date).find((part) => part.type === "weekday");

            if (dayNamePart) {
                dayNames.push(dayNamePart.value);
            }
        }

        return dayNames;
    };


    const localizedDayNames = getLocalizedDayNames();

    const handleSaveImage = () => {
        if(bodyRef.current){
            toPng(bodyRef.current)
                .then((dataUrl) => {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = dataUrl;
                    downloadLink.download = 'captured_image.png';
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                })
                .catch(error => {
                    console.error('Error while capturing and downloading div as image:', error);
                });
        }
    }

    interface Day {
        value: number;
        label: string;
        holidays?: any[];
        tasks?: any[];
    }

    const handleSaveJSON = () => {
        const months = [];

        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const maxDaysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
            const firstDayOfMonth = new Date(currentYear, monthIndex, 1).getDay();

            const startOffset = (firstDayOfMonth + 6) % 7;

            const days = [];

            for (let i = 0; i < startOffset; i++) {
                days.push({
                    value: 0,
                    label: '',
                    holidays: [],
                    tasks: []
                });
            }

            for (let day = 1; day <= maxDaysInMonth; day++) {
                const holidays = (holidaysForYear || []).filter(h => {
                    const holidayDate = new Date(h.date);
                    return holidayDate.getDate() === day && holidayDate.getMonth() === monthIndex && holidayDate.getFullYear() === currentYear;
                });
                const tasks = (allTasks || []).filter(t => t.day === day && t.year === currentYear && t.monthIndex === monthIndex);

                days.push({
                    value: day,
                    label: day.toString(),
                    holidays: holidays,
                    tasks: tasks
                });
            }

            const remainingDays = 35 - days.length;
            for (let i = 0; i < remainingDays; i++) {
                days.push({
                    value: 0,
                    label: '',
                    holidays: [],
                    tasks: []
                });
            }

            months.push({
                value: monthIndex,
                days: days,
                label: new Date(0, monthIndex).toLocaleString('default', { month: 'long' })
            });
        }

        const jsonContent = JSON.stringify({ year: currentYear, months: months }, null, 2);

        const blob = new Blob([jsonContent], { type: 'application/json' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'months_data.json';

        downloadLink.click();
    };

    const handleLoadJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const selectedFile = e.target.files?.[0];

            if (!selectedFile) {
                throw new Error('No file selected');
            }

            const fileReader = new FileReader();

            const fileLoaded = new Promise<string>((resolve, reject) => {
                fileReader.onload = () => resolve(fileReader.result as string);
                fileReader.onerror = reject;
            });

            fileReader.readAsText(selectedFile);

            const fileContents = await fileLoaded;

            const jsonData = JSON.parse(fileContents);

            const holidays: HolidaysData[] = [];
            const tasks: task[] = [];
            const days: Day[] = [];

            const restoredMonths = jsonData.months.map((month: any) => {
                const restoredDays = month.days.map((day: any) => {
                    holidays.push(...day.holidays);
                    tasks.push(...day.tasks);

                    const { holidays: removedHolidays, tasks: removedTasks, ...restDay } = day;
                    return restDay;
                });

                days.push(restoredDays)

                return {
                    value: month.value,
                    label: month.label,
                };
            });

            const restoredData = {
                year: jsonData.year,
                months: restoredMonths,
                holidays: holidays,
                tasks: tasks,
                days: days
            };

            dispatch(calendarActions.setByJSON({currentYear: restoredData.year, months: restoredData.months, days: restoredData.days[0], holidaysForYear: restoredData.holidays, currentMonthHolidays: holidays.filter((holiday) => {
                    const holidayDate = new Date(holiday.date);
                    return holidayDate.getMonth() === 0;
                })}))
            dispatch(tasksActions.setByJSON(restoredData.tasks))

        } catch (error: any) {
            console.error('Error loading or parsing JSON:', error.message);
        }
    };
    return (
        <main className={styles.main}>
                <div className={styles.bar}>
                    <div className={styles.flex}>
                        <input type="checkbox" onChange={e => dispatch(calendarActions.setColorParams(e.target.checked ? color : ""))}/>
                        <p>Filter by labels</p>
                        <label style={{backgroundColor: color}}>
                            <input
                                type="color"
                                className={styles.input}
                                onChange={(e) => {
                                    const newColor = e.target.value;
                                    setColor(newColor);

                                    const checkbox = e.target.parentNode?.parentNode?.querySelector('input[type="checkbox"]');
                                    if (checkbox instanceof HTMLInputElement) {
                                        dispatch(calendarActions.setColorParams(checkbox.checked ? newColor : ''));
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={"Filter tasks in current month"}
                        value={searchParams}
                        onChange={(e) => dispatch(calendarActions.setSearchParams(e.target.value))}
                    />
                    <button className={styles.btn} onClick={handleSaveImage}>
                        Download
                    </button>
                    <button className={styles.btn} onClick={handleSaveJSON}>
                        Download JSON
                    </button>
                    <label className={styles.labelFile} htmlFor="fileInput">Parse JSON</label>
                    <input id="fileInput" type="file" className={styles.file} onChange={handleLoadJSON}/>
                </div>
            <div className={styles.content} ref={bodyRef}>
                <div className={styles.days}>
                    {localizedDayNames.map((dayName, index) => (
                        <span key={index} className={styles.day}>
                        {dayName}
                    </span>
                    ))}
                </div>
                <div className={styles.main_content}>
                    {days &&
                        days.map((d, index) => (
                            <DateItem key={index} day={d}/>
                        ))}
                </div>
            </div>
        </main>
    );
};

export default CalendarBody
