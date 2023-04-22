import {NOTEBOOKS_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
import {refreshToken} from "./auth-reducer";
import {AppDispatch} from "./redux-store";

export type NotebookType = {
    id: string | null
    name: string
    description: string | null
}

type InitialStateType =  {
    notebooks: Array<NotebookType>
}

type SetNotebooksActionType = {
    type: typeof SET_NOTEBOOKS,
    payload: Array<NotebookType>
}

const SET_NOTEBOOKS = "NOTEBOOKS/SET_NOTEBOOKS"

const initialState: InitialStateType = {
    notebooks: [
        {
            id: "0",
            name: "notebook 0 name",
            description: "notebook 0 description"
        },
        {
            id: "1",
            name: "notebook 1 name",
            description: "notebook 1 description"
        },
        {
            id: "2",
            name: "notebook 2 name",
            description: "notebook 2 description"
        }
    ]
}

const notebooksReducer = (state: InitialStateType = initialState, action: SetNotebooksActionType): InitialStateType => {
    switch (action.type) {
        case "NOTEBOOKS/SET_NOTEBOOKS":
            return {
                ...state,
                notebooks: action.payload
            }
        default:
            return state
    }
}

const setNotebooks = (payload: Array<NotebookType>): SetNotebooksActionType => ({type: SET_NOTEBOOKS, payload})

export const createNotebook = (notebook: NotebookType) => {
    return async (dispatch: AppDispatch) => {
        const response = await NOTEBOOKS_API.createNotebook(notebook)
        if (response.status === 201) {
            dispatch(requestNotebooks())
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(createNotebook(notebook))
        }
    }
}

export const deleteNotebook = (notebookId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await NOTEBOOKS_API.deleteNotebook(notebookId)
        if (response.status === 204) {
            dispatch(requestNotebooks())
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(deleteNotebook(notebookId))
        }
    }
}

export const requestNotebooks = () => {
    return async (dispatch: AppDispatch) => {
        const respoonse = await NOTEBOOKS_API.getNotebooks()
        if (respoonse.status === 200) {
            const data: Array<NotebookType> = respoonse.data
            dispatch(setNotebooks(data))
        } else if (isTokenExpired(respoonse)) {
            dispatch(refreshToken())
            dispatch(requestNotebooks())

        }
    }
}

export default notebooksReducer