import {PROFILE_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
import {refreshToken} from "./auth-reducer";
import {adjustForTimezone} from "../utils/dateUtils";
import {ProfileType} from "./profile-reducer";
import {s3Url} from "../utils/s3Utils";

type InitialStateType =  {
    profiles: Array<ProfileType>
};

type SetProfileActionType = {
    type: typeof SET_PROFILES
    payload: Array<ProfileType>
}

const SET_PROFILES = 'PROFILE/SET_PROFILES'

const initialState: InitialStateType = {
    profiles: []
}

const profileListReducer = (state: InitialStateType = initialState,
                        action: SetProfileActionType): InitialStateType => {
    switch (action.type) {
        case SET_PROFILES:
            return {
                ...state,
                profiles: action.payload
            }
        default:
            return state;
    }
}

const setProfilesActionCreator = (payload : Array<ProfileType>) : SetProfileActionType => ({type: SET_PROFILES, payload})

export const getProfiles = () => {
    return async (dispatch: Function) => {
        const response = await PROFILE_API.getProfiles()
        if (response.status === 200) {
            const profiles = response.data.map(profile => {
                if (profile.avatarUri) {
                    profile.avatarUri = `${s3Url()}${profile.avatarUri}`
                }
                profile.timerStart = new Date(adjustForTimezone(profile.timerStart!.toString()))
                return profile
            })
            dispatch(setProfilesActionCreator(profiles))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(getProfiles())
        }
    }
}

export default profileListReducer