import React from 'react';
import './App.css';
import CalendarHeader from "./components/CalendarHeader/CalendarHeader";
import {Provider} from "react-redux";
import {store} from "./store/store";
import CalendarBody from "./components/CalendarBody/CalendarBody";

function App() {
    return (
        <Provider store={store}>
            <CalendarHeader/>
            <CalendarBody/>
        </Provider>
    );
}

export default App;
