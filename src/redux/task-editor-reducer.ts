import {TASKS_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
import {refreshToken} from "./auth-reducer";
import {AppDispatch} from "./redux-store";
import {TaskType} from "./tasks-reducer";
import {s3Url} from "../utils/s3Utils";

type SetTaskActionType = {
    type: typeof SET_TASK
    payload: TaskType
}

type UnmountTaskActionType = {
    type: typeof UNMOUNT_TASK
}

type TasksStateType = {
    task: TaskType | null
}

const initialState: TasksStateType = {
    task: null
}
export const DEFAULT_TASK_DATA = `{
    "type": "doc",
    "content": [
        {
            "type": "heading",
            "attrs": {
                "level": 1
            },
            "content": [
                {
                    "type": "text",
                    "text": "Enter task name"
                }
            ]
        }
    ]
}`

const SET_TASK = 'TASK_EDITOR/SET_TASK'
const UNMOUNT_TASK = 'TASK_EDITOR/UNMOUNT_TASK'

const taskEditorReducer = (state: TasksStateType = initialState, action: SetTaskActionType | UnmountTaskActionType): TasksStateType => {
    switch (action.type) {
        case SET_TASK:
            return {
                ...state,
                task: action.payload
            }
        case UNMOUNT_TASK:
            return {
                ...state,
                task: null
            }
        default:
            return state
    }
}

const setTask = (payload: TaskType): SetTaskActionType => ({type: SET_TASK, payload})
const unmountTaskAction = (): UnmountTaskActionType => ({type: UNMOUNT_TASK})

export const saveTask = (levelId: string, task: TaskType) => {
    return async (dispatch: AppDispatch) => {
        const response = await TASKS_API.createLevelTask(levelId, task)
        if (response.status === 201) {
            const responseTask: TaskType = response.data
            if (!responseTask.data) {
                responseTask.data = JSON.parse(DEFAULT_TASK_DATA)
            }
            if (responseTask.fileUri) {
                responseTask.fileUri = `${s3Url()}${responseTask.fileUri}`
            }
            await dispatch(requestTask(levelId, responseTask.id))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
                .then(() => dispatch(saveTask(levelId, task)))
        }
    }
}


export const requestTask = (levelId: string, taskId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await TASKS_API.getLevelTask(levelId, taskId)
        if (response.status === 200) {
            const task: TaskType = response.data
            if (!task.data) {
                task.data = JSON.parse(DEFAULT_TASK_DATA)
            }
            if (task.fileUri) {
                task.fileUri = `${s3Url()}${task.fileUri}`
            }
            await dispatch(setTask(task))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
                .then(() => dispatch(requestTask(levelId, taskId)))
        }
    }
}

export const uploadVideo = (levelId: string, taskId: string, file: File) => {
    return async (dispatch: AppDispatch) => {
        const response = await TASKS_API.uploadMediaToTask(levelId, taskId, file);
        if (response.status === 200) {
            await dispatch(requestTask(levelId, taskId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
                .then(() => dispatch(uploadVideo(levelId, taskId, file)))
        }
    }
}

export const deleteVideo = (levelId: string, taskId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await TASKS_API.deleteMediaFromTask(levelId, taskId);
        if (response.status === 204) {
            await dispatch(requestTask(levelId, taskId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
                .then(() => dispatch(deleteVideo(levelId, taskId)))
        }
    }
}


export const unmountTask = () => {
    return (dispatch: AppDispatch)=> {
        dispatch(unmountTaskAction())
    }
}

export default taskEditorReducer