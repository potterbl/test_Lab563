import React, {useEffect, useState} from 'react';
import styles from "./component.module.css";
import { Day } from "../../store/slices/calendarSlice";
import {useDispatch, useSelector} from "react-redux";
import {actions as tasksActions, task} from "../../store/slices/tasksSlice";
import {RootState} from "../../store/store";

const DateItem = ({ day }: { day: Day }) => {
    const dispatch = useDispatch()

    const [newTask, setNewTask] = useState<string | undefined>(undefined);
    const [color, setColor] = useState<string | null>(null)

    const {currentMonth, currentYear, currentMonthHolidays, searchParams, colorParams} = useSelector((state: RootState) => state.calendar)

    const handleClick = () => {
        setNewTask(prevState => {
            if(prevState === undefined){
                setColor(null)
                return ""
            } else {
                return undefined
            }
        });
    };

    const handleCreate = () => {
        const newColor = color !== null && color !== "" ? color : "#000000";

        if(color !== null){
            dispatch(tasksActions.createTask({
                task: {
                    day: day.value,
                    monthIndex: currentMonth.value,
                    year: currentYear,
                    text: newTask || "",
                    isCompleted: false
                },
                colorInput: newColor
            }));

            setColor(null);
            setNewTask(undefined);
        } else {
            setColor("")
        }
    };

    const allTasks = useSelector((state: RootState) => state.tasks.tasks)

    const [filteredTasks, setFilteredTasks] = useState<task[]>([]);

    useEffect(() => {
        if (searchParams !== "") {
            const textFiltered = allTasks.filter((task) =>
                task?.text?.match(new RegExp(searchParams, "i")) &&
                task.day === day.value &&
                task.monthIndex === currentMonth.value &&
                task.year === currentYear
            );
            setFilteredTasks(textFiltered);
        } else if (colorParams !== "") {
            const textFiltered = allTasks.filter((task) =>
                task?.color?.includes(colorParams) &&
                task.day === day.value &&
                task.monthIndex === currentMonth.value &&
                task.year === currentYear
            );
            setFilteredTasks(textFiltered);
        } else {
            const dateFiltered = allTasks.filter(
                (task) =>
                    task.day === day.value &&
                    task.monthIndex === currentMonth.value &&
                    task.year === currentYear
            );
            setFilteredTasks(dateFiltered);
        }
    }, [allTasks, day.value, currentMonth.value, currentYear, searchParams, colorParams]);


    const handleDrag = (e: React.DragEvent, taskId: number | undefined) => {
        if (taskId !== undefined) {
            dispatch(tasksActions.setDrag(taskId))
        }
    }

    const taskId: number | null = useSelector((state: RootState) => state.tasks.currentDrag);

    const handleDragDrop = (e: React.DragEvent) => {
        e.preventDefault();

        if (taskId !== null) {
            const foundTaskIndex = filteredTasks.findIndex((task) => task.id === taskId);

            if (foundTaskIndex !== -1) {
                const updatedTasks = [...filteredTasks];
                updatedTasks[foundTaskIndex] = { ...updatedTasks[foundTaskIndex], isCompleted: false };

                setFilteredTasks(updatedTasks);
                dispatch(tasksActions.toggleTask({id: taskId, isCompleted: false}))
                dispatch(tasksActions.setDrag(null));
            } else {
                dispatch(tasksActions.moveTask({ id: taskId, day: day.value, monthIndex: currentMonth.value, year: currentYear }));
                dispatch(tasksActions.setDrag(null));
            }
        }
    };

    const handleAddColor = (id?: number) => {
        if(id){
            dispatch(tasksActions.changeTask({
                task: {
                    id: id
                },
                colorInput: "#000"
            }))
        }
    }

    return (
        <>
            {
                day.label !== "" ?
                    <div
                        className={styles.day_item}
                        onDragOver={event => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move"
                        }}
                        onDrop={handleDragDrop}
                    >
                        <p className={styles.day_label}>{day.label}</p>
                        <div className={styles.tasks}>
                            {currentMonthHolidays !== null && (
                                <>
                                    {currentMonthHolidays.map((h) => {
                                        if (new Date(h.date).getDate() === day.value) {
                                            return (
                                                <div key={h.date} className={styles.holiday}>
                                                    <div className={styles.holiday_body}>
                                                        <p>{h.localName}</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </>
                            )}
                            {
                                newTask !== undefined &&
                                <div className={styles.input_wrapper}>
                                    {
                                        color === null ?
                                            <input value={newTask} onChange={e => setNewTask(e.target.value)}
                                                   className={styles.input} type="text"
                                                   placeholder={"Enter new task text"}/>
                                            :
                                            <input value={color}
                                                   onChange={e => {
                                                       setColor(e.target.value)
                                                   }}
                                                   defaultValue={"#000"}
                                                   className={styles.input} type="color"
                                            />
                                    }

                                    <button className={styles.btn_cancel} onClick={handleCreate}>+</button>
                                </div>
                            }
                            {
                                filteredTasks && filteredTasks.map(t => (
                                    <div
                                        key={t.id}
                                        className={styles.task}
                                        draggable={true}
                                        onDrag={(e) => handleDrag(e, t.id)}
                                    >
                                        <div className={styles.task_head}>
                                            {
                                                t.color?.map((c, index) => (
                                                    <label key={index} className={styles.color_label}
                                                           style={{backgroundColor: c}}>
                                                        <input
                                                            className={styles.color}
                                                            type="color"
                                                            value={c}
                                                            onChange={e => dispatch(tasksActions.changeTask({
                                                                task: {
                                                                    id: t.id,
                                                                },
                                                                colorInput: e.target.value,
                                                                colorIndex: index
                                                            }))}
                                                        />
                                                    </label>
                                                ))
                                            }
                                            <button className={styles.button_add_color} onClick={() => handleAddColor(t.id)}>+</button>
                                        </div>
                                        <div className={styles.task_body}>
                                            <input type="checkbox" checked={t.isCompleted}
                                                   onChange={() => dispatch(tasksActions.toggleTask({
                                                       id: t.id,
                                                       isCompleted: !t.isCompleted
                                                   }))}/>
                                            <textarea onChange={e => dispatch(tasksActions.changeTask({
                                                task: {
                                                    id: t.id,
                                                    text: e.target.value
                                                }
                                            }))}>{t.text}</textarea>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <button type={"button"} className={styles.btn}
                                onClick={handleClick}>{newTask === undefined ? "+" : "X"}</button>
                    </div>
                    :
                    <span className={styles.day_item + " " + styles.day_empty}></span>
            }
        </>
    );
};

export default React.memo(DateItem);
