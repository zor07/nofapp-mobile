import {AppDispatch} from "./redux-store";
import AsyncStorage from "@react-native-async-storage/async-storage/lib/typescript/AsyncStorage.native";
import {AUTH_API, ACCESS_TOKEN, REFRESH_TOKEN} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";

type UserDataType = {
    id: string | null,
    name: string | null,
    username: string | null,
    isAuth: boolean
}

type SetUserDataActionType = {
    type: typeof SET_USER_DATA,
    payload: UserDataType
}

const initialState: UserDataType = {
    id: null,
    name: null,
    username: null,
    isAuth: false
}

const SET_USER_DATA = "AUTH/SET_USER_DATA"

const authReducer = (state: UserDataType = initialState, action: SetUserDataActionType) => {
    switch (action.type) {
        case SET_USER_DATA:
            return {...state, ...action.payload}
        default:
            return state;
    }
}

const setUserData = (id: string | null,
                     name: string | null,
                     username: string | null,
                     isAuth: boolean): SetUserDataActionType => ({
    type: SET_USER_DATA,
    payload: {id, name, username, isAuth}
})

export const register = (username: string, name: string, password: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await AUTH_API.register(username, name, password);
        if (response.status === 200) {
            storeTokens(response.data.access_token, response.data.refresh_token).then(() => {
                dispatch(me())
            })

        }
    }
}

export const login = (username: string, password: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await AUTH_API.login(username, password);
        if (response.status === 200) {
            storeTokens(response.data.access_token, response.data.refresh_token).then(() => {
                dispatch(me())
            })
        }
    }
}

export const logout = () => {
    return (dispatch: AppDispatch) => {
        clearTokens().then(() => {
            dispatch(setUserData(null, null, null, false));
        })
    }
}

export const me = () => {
    return async (dispatch: AppDispatch) => {
        const response = await AUTH_API.me()
        if (response.status === 200) {
            dispatch(setUserData(response.data.id, response.data.name, response.data.username, true))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
        }

    }
}

export const refreshToken = () => {
    return async (dispatch: AppDispatch) => {
        const response = await AUTH_API.refreshAccessToken()
        if (response.status === 200) {
            storeTokens(response.data.access_token, response.data.refresh_token).then(() => {
                dispatch(me())
            })

        }
    }
}

const clearTokens = (): Promise<Awaited<void>[]> => {
    return Promise.all([
        AsyncStorage.removeItem(ACCESS_TOKEN),
        AsyncStorage.removeItem(REFRESH_TOKEN)
    ])
}

const storeTokens = (accessToken: string, refreshToken: string): Promise<Awaited<void>[]> => {
    return Promise.all([
        AsyncStorage.setItem(ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(REFRESH_TOKEN, refreshToken)
    ])
}

export default authReducer;