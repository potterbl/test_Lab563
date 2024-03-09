import {createSlice} from "@reduxjs/toolkit";

function generateRandomNumericId() {
    return Date.now();
}

export interface task {
    id?: number,
    text?: string,
    color?: string[],
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
        createTask: (state, actions: { payload: { task: task, colorInput: string } }) => {
            const { task, colorInput} = actions.payload

            const newTask: task = {
                id: generateRandomNumericId(),
                text: task.text,
                color: [],
                day: task.day,
                monthIndex: task.monthIndex,
                year: task.year,
                isCompleted: task.isCompleted
            }

            newTask.color?.push(colorInput)

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
        changeTask: (state, action: { payload: { task: task, colorInput?: string, colorIndex?: number } }) => {
            const { task, colorInput, colorIndex } = action.payload;

            state.tasks = state.tasks.map((currentTask: task) => {
                if (currentTask.id === task.id) {

                    if (colorIndex !== undefined && currentTask.color && currentTask.color[colorIndex]) {
                        currentTask.color[colorIndex] = colorInput !== undefined ? colorInput : "";
                    } else if(colorInput) {
                        if (!currentTask.color) {
                            currentTask.color = [];
                        }
                        currentTask.color.push(colorInput);
                    }

                    return {
                        ...currentTask,
                        text: task.text !== undefined ? task.text : currentTask.text,
                        isCompleted: task.isCompleted !== undefined ? task.isCompleted : currentTask.isCompleted
                    };
                }

                return currentTask;
            });
        },
        setDrag: (state, actions: {payload: number | null}) => {
            state.currentDrag = actions.payload
        },
        setByJSON: (state, actions) => {
            state.tasks = actions.payload
        }
    }
})

export const {reducer, actions} = tasksSlice
