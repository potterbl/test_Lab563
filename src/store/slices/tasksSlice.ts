import {createSlice} from "@reduxjs/toolkit";

function generateRandomNumericId() {
    return Date.now();
}

export interface task {
    id?: number,
    text?: string,
    color?: string,
    day?: number,
    monthIndex?: number,
    year?: number,
    isCompleted?: boolean
}

interface tasksState {
    tasks: task[],
    currentDrag: number | null
}

const initialState: tasksState = {
    tasks: [],
    currentDrag: null
}

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        createTask: (state, actions: {payload: task}) => {
            const taskPayload = actions.payload

            const newTask: task = {
                id: generateRandomNumericId(),
                text: taskPayload.text,
                color: taskPayload.color,
                day: taskPayload.day,
                monthIndex: taskPayload.monthIndex,
                year: taskPayload.year,
                isCompleted: taskPayload.isCompleted
            }

            state.tasks.push(newTask)
        },
        moveTask: (state, actions: {payload: task}) => {
            const taskPayload = actions.payload

            state.tasks = state.tasks.map(task =>
                task.id === taskPayload.id
                    ? {
                        ...task,
                        day: taskPayload.day,
                        monthIndex: taskPayload.monthIndex,
                        year: taskPayload.year
                    }
                    : task
            );

            const taskIndex = state.tasks.findIndex(t => t.id === taskPayload.id)

            if(taskIndex){
                state.tasks[taskIndex].day = taskPayload.day
                state.tasks[taskIndex].monthIndex = taskPayload.monthIndex
                state.tasks[taskIndex].year = taskPayload.year
            }
        },
        toggleTask: (state, actions: {payload: task}) => {
            const taskId = actions.payload.id;
            state.tasks = state.tasks.map(task =>
                task.id === taskId ? { ...task, isCompleted: actions.payload.isCompleted } : task
            );
        },
        changeTask: (state, action: { payload: task }) => {
            const taskPayload = action.payload;

            console.log(taskPayload)

            state.tasks = state.tasks.map(task =>
                task.id === taskPayload.id
                    ? {
                        ...task,
                        text: taskPayload.text !== undefined ? taskPayload.text : task.text,
                        color: taskPayload.color !== undefined ? taskPayload.color : task.color,
                        isCompleted: taskPayload.isCompleted !== undefined ? taskPayload.isCompleted : task.isCompleted
                    }
                    : task
            );
        },
        setDrag: (state, actions: {payload: number | null}) => {
            state.currentDrag = actions.payload
        }
    }
})

export const {reducer, actions} = tasksSlice
