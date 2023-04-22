import {PROFILE_API, USER_POSTS_API, RELAPSE_LOG_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
import {refreshToken} from "./auth-reducer";
import {adjustForTimezone} from "../utils/dateUtils";
import {NoteType} from "./note-editor-reducer";
import {s3Url} from "../utils/s3Utils";
import {AppDispatch} from "./redux-store";

export type ProfileType = {
    id: string | null
    avatarUri: string | null
    timerStart: Date | null
    user: {
        id: string
        name: string
        username: string
    } | null
}

type InitialStateType =  {
    profile: ProfileType
    posts: Array<NoteType>
    relapseLogs: Array<RelapseLog>
};

export type RelapseLog = {
    id: string
    start: Date
    stop: Date
}

type SetProfileActionType = {
    type: typeof SET_PROFILE
    payload: ProfileType
}

type SetPostsActionType = {
    type: typeof SET_POSTS
    payload: Array<NoteType>
}

type SetRelapseLogsActionType = {
    type: typeof SET_RELAPSE_LOGS
    payload: Array<RelapseLog>
}

const SET_POSTS = 'PROFILE/SET_POSTS'
const SET_PROFILE = 'PROFILE/SET_PROFILE'
const SET_RELAPSE_LOGS = 'PROFILE/SET_RELAPSE_LOGS'

const initialState: InitialStateType = {
    profile: {
        id: null,
        avatarUri: null,
        timerStart: null,
        user: null
    },
    posts: [],
    relapseLogs: []
}

const profileReducer = (state: InitialStateType = initialState,
                        action: SetProfileActionType | SetPostsActionType | SetRelapseLogsActionType): InitialStateType => {
    switch (action.type) {
        case SET_PROFILE:
            return {
                ...state,
                profile: action.payload
            }
        case SET_POSTS:
            return {
                ...state,
                posts: action.payload
            }
        case SET_RELAPSE_LOGS:
            return {
                ...state,
                relapseLogs: action.payload
            }
        default:
            return state;
    }
}

const setProfileActionCreator = (payload : ProfileType) : SetProfileActionType => ({type: SET_PROFILE, payload})
const setProfilePostsActionCreator = (payload :  Array<NoteType>) => ({type: SET_POSTS, payload})
const setRelapseLogsActionCreator = (payload : Array<RelapseLog>) => ({type: SET_RELAPSE_LOGS, payload})

export const getProfile = (userId : string) => {
    return async (dispatch: Function) => {
        const response = await PROFILE_API.getProfile(userId)
        if (response.status === 200) {
            const profile = response.data
            if (profile.avatarUri) {
                profile.avatarUri = `${s3Url()}${profile.avatarUri}`
            }
            profile.timerStart = new Date(adjustForTimezone(profile.timerStart!.toString()))
            dispatch(setProfileActionCreator(profile))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(getProfile(userId))
        }
    }
}

export const getUserPosts = (userId: string) => {
    return async (dispatch: Function) => {
        const response = await USER_POSTS_API.getUserPosts(userId)
        if (response.status === 200) {
            dispatch(setProfilePostsActionCreator(response.data))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(getUserPosts(userId))
        }
    }
}

export const deleteUserPost = (userId: string, noteId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await USER_POSTS_API.deleteUserPost(userId, noteId)
        if (response.status === 204) {
            dispatch(getUserPosts(userId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(getUserPosts(userId))
        }
    }
}

export const uploadAvatar = (userId: string, file: File) => {
    return async (dispatch: Function) => {
        const response = await PROFILE_API.uploadAvatar(userId, file);
        if (response.status === 202) {
            dispatch(getProfile(userId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(uploadAvatar(userId, file))
        }
    }
}

export const removeAvatar = (userId: string) => {
    return async (dispatch: Function) => {
        const response = await PROFILE_API.deleteAvatar(userId)
        if (response.status == 204) {
            dispatch(getProfile(userId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(removeAvatar(userId))
        }
    }
}

export const getRelapseLogs = (userId: string) => {
    return async (dispatch: Function) => {
        const response = await RELAPSE_LOG_API.getRelapseLogEntries(userId)
        if (response.status === 200) {
            dispatch(setRelapseLogsActionCreator(response.data))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(getRelapseLogs(userId))
        }
    }
}

export const relapsed = (userId : string) => {
    return async (dispatch: AppDispatch) => {
        const  response = await RELAPSE_LOG_API.relapsed(userId)
        if (response.status === 202) {
            dispatch(getProfile(userId))
            dispatch(getRelapseLogs(userId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(relapsed(userId))
        }
    }
}

export const deleteRelapseLog = (userId: string, relapseLogId: string) => {
    return async (dispatch: Function) => {
        const response = await RELAPSE_LOG_API.deleteRelapseLogEntry(userId, relapseLogId)
        if (response.status === 204) {
            dispatch(getRelapseLogs(userId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(deleteRelapseLog(userId, relapseLogId))
        }
    }
}

export default profileReducer