import styles from "./component.module.css"
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import DateItem from "../DateItem/DateItem";
import {useRef} from "react";
import {toPng} from "html-to-image"

const CalendarBody = () => {
    const bodyRef= useRef(null)

    const {days} = useSelector((state: RootState) => state.calendar)

    const getLocalizedDayNames = () => {
        const dayNames = [];

        const dateFormatter = new Intl.DateTimeFormat(navigator.language, { weekday: "short" });

        // Начнем с пятницы (5) и закончим в четверг (4)
        for (let i = 3; i <= 9; i++) {
            const dayIndex = i % 7; // Дни недели от 0 до 6
            const date = new Date(2024, 2, dayIndex + 1); // Добавляем 1, так как месяцы начинаются с 0
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

    return (
        <main className={styles.main}>
                <div className={styles.bar}>
                    <button className={styles.btn} onClick={handleSaveImage}>
                        Download
                    </button>
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
