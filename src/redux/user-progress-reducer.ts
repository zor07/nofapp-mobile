import {USER_PROGRESS_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
import {refreshToken} from "./auth-reducer";
import {AppDispatch} from "./redux-store";
import {TaskType} from "./tasks-reducer";
import {s3Url} from "../utils/s3Utils";

type InitialStateType = {
    userProgress: UserProgressType | null
};

export type UserProgressType = {
    uncompletedTask: UserTaskType
    userTasks: Array<UserTaskType>
}

export type UserTaskType = {
    task: TaskType
    completed: boolean
}

type SetUserProgressActionType = {
    type: typeof SET_USER_PROGRESS
    payload: UserProgressType
}


const SET_USER_PROGRESS = 'USER_PROGRESS/SET_USER_PROGRESS'

const initialState: InitialStateType = {
    userProgress: null
}

const userProgressReducer = (state: InitialStateType = initialState,
                             action: SetUserProgressActionType): InitialStateType => {
    switch (action.type) {
        case SET_USER_PROGRESS:
            return {
                ...state,
                userProgress: action.payload
            }
        default:
            return state;
    }
}

const setUserProgressActionCreator = (payload: UserProgressType): SetUserProgressActionType => ({
    type: SET_USER_PROGRESS,
    payload
})

export const fetchUserProgress = () => {
    return async (dispatch: AppDispatch) => {
        const userProgressResponse = await USER_PROGRESS_API.fetchUserProgress()

        if (userProgressResponse.status === 200) {
            const responseData = userProgressResponse.data
            if (responseData.uncompletedTask
                            && responseData.uncompletedTask.task
                            && responseData.uncompletedTask.task.fileUri) {
                responseData.uncompletedTask.task.fileUri = `${s3Url()}${responseData.uncompletedTask.task.fileUri}`
            }
            if (responseData.userTasks) {
                responseData.userTasks.map(userTask => {
                    if (userTask.task && userTask.task.fileUri) {
                        userTask.task.fileUri = `${s3Url()}${userTask.task.fileUri}`
                    }
                })
            }

            await dispatch(setUserProgressActionCreator(responseData))
        } else if (isTokenExpired(userProgressResponse)) {
            dispatch(refreshToken())
                .then(() => dispatch(fetchUserProgress()))
        }
    }
}

export const finishCurrentTask = () => {
    return async (dispatch: AppDispatch) => {
        const response = await USER_PROGRESS_API.finishCurrentTask()
        if (response.status === 201) {
            await dispatch(fetchUserProgress())
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
                .then(() => dispatch(finishCurrentTask()))
        }
    }
}

export default userProgressReducer