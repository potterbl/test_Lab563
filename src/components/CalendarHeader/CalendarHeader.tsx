import styles from "./component.module.css"
import {RootState} from "../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {actions} from "../../store/slices/calendarSlice";

const CalendarHeader = () => {
    const {currentMonth} = useSelector((state: RootState) => state.calendar)
    const {currentYear} = useSelector((state: RootState) => state.calendar)

    const dispatch = useDispatch()

    const handleNextMonth = () => {
        dispatch(actions.nextMonth())
    }

    const handlePrevMonth = () => {
        dispatch(actions.prevMonth())
    }

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button onClick={handlePrevMonth} className={styles.btn}>
                    prev
                </button>
                <button onClick={handleNextMonth} className={styles.btn}>
                    next
                </button>
            </div>
            <div className={styles.center}>
                <h1>{currentMonth.label} {currentYear}</h1>
            </div>
        </header>
    );
};

export default CalendarHeader
