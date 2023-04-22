import {TIMER_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
import {adjustForTimezone, getCurrentDateISOString} from "../utils/dateUtils";
import {refreshToken} from "./auth-reducer";

type SetTimersActionType = {
    type: typeof SET_TIMERS,
    payload: Array<TimerType>
}

type InitialStateType =  {
    timers: Array<TimerType>
};

export type TimerFormDataType = {
    start?: string,
    fromNow: boolean,
    description: string
}

type TimerDtoType = {
    id: string,
    isRunning: boolean,
    start: string,
    stop?: string | null,
    description: string
}

export type TimerType = {
    id: string,
    isRunning: boolean,
    start: Date,
    stop?: Date | null,
    description: string
}

const SET_TIMERS = 'TIMER/SET_TIMERS'

const initialState: InitialStateType = {
    timers: [
        {
            id: "1",
            isRunning: true,
            start: new Date("2021-11-08T01:00:00.000"),
            stop: null,
            description: "Default timer. Start your server."
        }
    ]
}

const timerReducer = (state: InitialStateType = initialState, action: SetTimersActionType): InitialStateType => {
    switch (action.type) {
        case SET_TIMERS:
            return {
                ...state,
                timers: action.payload
            }
        default:
            return state;
    }
}

const setTimers = (payload: Array<TimerType>) : SetTimersActionType => ({type: SET_TIMERS, payload})

export const startTimer = (timerData: TimerFormDataType) => {
    return async (dispatch: Function) => {

        const timerDto = {
            description: timerData.description,
            start: timerData.fromNow ? getCurrentDateISOString(): adjustForTimezone(timerData.start!)
        }

        const response = await TIMER_API.startTimer(timerDto)
        if (response.status === 201) {
            dispatch(requestTimers())
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(startTimer(timerData))
        }
    }
}

export const stopTimer = (timerId: string) => {
    return async (dispatch: Function) => {
        const response = await TIMER_API.stopTimer(timerId)
        if (response.status === 202) {
            dispatch(requestTimers())
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(stopTimer(timerId))
        }
    }
}

export const deleteTimer = (timerId: string) => {
    return async (dispatch: Function) => {
        const response = await TIMER_API.deleteTimer(timerId)
        if (response.status === 204) {
            dispatch(requestTimers())
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(deleteTimer(timerId))
        }
    }
}

export const requestTimers = () => {
    return async (dispatch: Function) => {
        const response = await TIMER_API.getTimers()
        if (response.status === 200) {
            const timersResp: Array<TimerDtoType> = response.data
            const timers = timersResp.map(timer => {
                return {
                    id: timer.id,
                    isRunning: timer.isRunning,
                    start: new Date(Date.parse(timer.start)),
                    stop: timer.stop ? new Date(Date.parse(timer.stop)) : null,
                    description: timer.description
                } as TimerType;
            })
            dispatch(setTimers(timers))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(requestTimers())
        }
    }
}

export default timerReducer;