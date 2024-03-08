import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {fetchData, reducer as calendarReducer} from "./slices/calendarSlice"
import {reducer as tasksReducer} from "./slices/tasksSlice"

const reducers = combineReducers({
    calendar: calendarReducer,
    tasks: tasksReducer
})

export const store = configureStore({
    reducer: reducers
})

store.dispatch(fetchData())

export type RootState = ReturnType<typeof store.getState>
