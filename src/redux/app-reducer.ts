import {me} from "./auth-reducer";

type InitialStateType = { initialized: boolean }
type InitializeAppAction = {type: typeof SET_INITIALIZED}

const SET_INITIALIZED = 'APP/SET_INITIALIZED'

const initialState: InitialStateType = {
    initialized: false
}

const appReducer = (state = initialState, action: InitializeAppAction) => {
    switch (action.type) {
        case SET_INITIALIZED:
            return {
                ...state,
                initialized: true
            }
        default:
            return state;
    }
}

export const setInitialized = () => ({type: SET_INITIALIZED})

export const initializeApp = () => (dispatch: Function) => {
    const promise = dispatch(me());

    Promise.all([promise])
        .then(() => dispatch(setInitialized()))
}

export default appReducer