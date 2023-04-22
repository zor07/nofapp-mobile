import {NOTES_API, USER_POSTS_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
// import {PrimitiveSelection, RemirrorJSON} from "remirror";
import {currentDateString} from "../utils/dateUtils";
import {refreshToken} from "./auth-reducer";
import {NotebookType} from "./notebook-reducer";
import {unmountNotes} from "./notes-reducer";
import {AppDispatch} from "./redux-store";

//TODO remirror :(
export type PrimitiveSelection = any
export type RemirrorJSON = any

export type NoteType = {
    id: string | null
    title: string
    notebookDto: NotebookType
    data: NoteState
}

export type NoteState = {
    content: RemirrorJSON,
    selection: PrimitiveSelection | null | undefined
}

type InitialStateType = {
    note: NoteType | null
};

type UnmountNoteActionType = {
    type: typeof UNMOUNT_NOTE
}

type SetNoteActionType = {
    type: typeof SET_NOTE
    payload: NoteType
}

const SET_NOTE = 'NOTE/SET_NOTE'
const UNMOUNT_NOTE = 'NOTE/UNMOUNT_NOTE'

export const DEFAULT_CONTENT = {
    type: "doc",
    content: [
        {
            "type": "heading",
            "attrs": {
                "level": 1
            },
            "content": [
                {
                    "type": "text",
                    "text": currentDateString()
                }
            ]
        }
    ]
}

const initialState: InitialStateType = {
    note: {
        id: null,
        title: "",
        notebookDto: {
            id: null,
            name: "",
            description: null
        },
        data: {
            content: DEFAULT_CONTENT,
            selection: {
                anchor: 0,
                head: 0
            }
        }
    }
}

const noteEditorReducer = (state: InitialStateType = initialState, action: UnmountNoteActionType | SetNoteActionType): InitialStateType => {
    switch (action.type) {
        case "NOTE/SET_NOTE":
            const note1 = action.payload
            note1.notebookDto = action.payload.notebookDto

            return {
                ...state,
                note: note1

            }
        case "NOTE/UNMOUNT_NOTE":
            return {
                ...state,
                note: initialState.note
            }
        default:
            return state
    }
}

const setNote = (payload: NoteType): SetNoteActionType => ({type: SET_NOTE, payload})
export const clearNoteAction = (): UnmountNoteActionType => ({type: UNMOUNT_NOTE})

export const unmountNote = () => {
    return (dispatch: AppDispatch) => {
        dispatch(clearNoteAction())
        dispatch(unmountNotes())
    }
}

export const getNote = (notebookId: string, noteId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await NOTES_API.getNote(notebookId, noteId)
        if (response.status === 200) {
            const note: NoteType = response.data
            dispatch(setNote(note))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(getNote(notebookId, noteId))
        }
    }
}

export const saveNote = (notebookId: string, note: NoteType) => {
    return async (dispatch: AppDispatch) => {
        const response = await NOTES_API.updateNote(notebookId, note)
        if (response.status === 202) {
            const newNote: NoteType = response.data
            dispatch(setNote(newNote))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(saveNote(notebookId, note))
        }
    }
}

export const addPostToUser = (noteId : string) => {
    return async (dispatch: AppDispatch, getState: Function) => {
        const response = await USER_POSTS_API.addPostToUser(getState().auth.id, noteId)
        if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(addPostToUser(noteId))
        }
    }
}


export default noteEditorReducer