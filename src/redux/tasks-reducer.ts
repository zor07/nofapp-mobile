import {TASKS_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
import {refreshToken} from "./auth-reducer";
import {LevelType} from "./levels-reducer";
import {AppDispatch} from "./redux-store";
import {RemirrorJSON} from "./note-editor-reducer";
// TODO remirror :(
// import {RemirrorJSON} from "remirror";

export type TaskType = {
    id: string,
    order: number,
    name: string,
    description: string,
    level: LevelType,
    fileUri: string | null,
    data: RemirrorJSON | null,
}

type SetTasksActionType = {
    type: typeof SET_TASKS
    payload: Array<TaskType>
}

type UnmountTasksActionType = {
    type: typeof UNMOUNT_TASKS
}


type TasksStateType = {
    tasks: Array<TaskType>
}



const initialState: TasksStateType = {
    tasks: []
}

const SET_TASKS = 'TASKS/SET_TASKS'
const UNMOUNT_TASKS = 'TASKS/UNMOUNT_TASKS'

const tasksReducer = (state: TasksStateType = initialState, action: SetTasksActionType | UnmountTasksActionType): TasksStateType => {
    switch (action.type) {
        case SET_TASKS:
            return {
                ...state,
                tasks: action.payload
            }
        case UNMOUNT_TASKS:
            return {
                ...state,
                tasks: []
            }
        default:
            return state
    }
}

const setTasks = (payload: Array<TaskType>): SetTasksActionType => ({type: SET_TASKS, payload})
const unmountTasksAction = (): UnmountTasksActionType => ({type: UNMOUNT_TASKS})

export const requestTasks = (levelId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await TASKS_API.getLevelTasks(levelId)
        if (response.status === 200) {
            await dispatch(setTasks(response.data))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
                .then(() => dispatch(setTasks(response.data)))
        }
    }
}

export const saveTask = (levelId: string, task: TaskType) => {
    return async (dispatch: AppDispatch) => {
        const response = await TASKS_API.createLevelTask(levelId, task)
        if (response.status === 201) {
            await dispatch(requestTasks(levelId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
                .then(() => dispatch(saveTask(levelId, task)))
        }
    }
}

export const deleteTask = (levelId: string, taskId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await TASKS_API.deleteTask(levelId, taskId)
        if (response.status === 204) {
            await dispatch(requestTasks(levelId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
                .then(() => deleteTask(levelId, taskId))
        }
    }
}

export const unmountTasks = () => {
    return (dispatch: AppDispatch)=> {
        dispatch(unmountTasksAction())
    }
}

export default tasksReducer