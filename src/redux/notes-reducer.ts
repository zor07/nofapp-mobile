import {NOTES_API} from "../api/api";
import {NOTEBOOKS_API} from "../api/api";
import {isTokenExpired} from "../api/apiUtils";
import {refreshToken} from "./auth-reducer";
import {NoteType, DEFAULT_CONTENT} from "./note-editor-reducer";
import {currentDateString} from "../utils/dateUtils";
import {NotebookType} from "./notebook-reducer";
import {AppDispatch} from "./redux-store";

export type NoteIdAndTitleType = {
    id: string
    title: string
}

type SetNotesActionType = {
    type: typeof SET_NOTES
    notes: Array<NoteIdAndTitleType>
}

type SetNotebookActionType = {
    type: typeof SET_NOTEBOOK
    payload: NotebookType
}

type SetCreatedNoteIdActionType = {
    type: typeof SET_CREATED_NOTE_ID
    payload: string | null
}

type UnmountNotesActionType = {
    type: typeof UNMOUNT_NOTES
}

type NotesStateType = {
    notes: Array<NoteIdAndTitleType>
    notebook: NotebookType
    createdNoteId: string | null
}

const SET_NOTES = 'NOTES/SET_NOTES'
const SET_NOTEBOOK = 'NOTES/SET_NOTEBOOK'
const SET_CREATED_NOTE_ID =  'NOTES/SET_CREATED_NOTE_ID'
const UNMOUNT_NOTES = 'NOTES/UNMOUNT_NOTES'

const initialState: NotesStateType = {
    notes: [],
    notebook: {
        id: null,
        name: '',
        description: ''
    },
    createdNoteId: null
}

const notesReducer = (state: NotesStateType = initialState, action: SetNotesActionType | SetCreatedNoteIdActionType | SetNotebookActionType | UnmountNotesActionType): NotesStateType => {
    switch (action.type) {
        case "NOTES/SET_NOTES":
            return {
                ...state,
                notes: action.notes
            }
        case "NOTES/SET_CREATED_NOTE_ID":
            return {
                ...state,
                createdNoteId: action.payload
            }
        case "NOTES/SET_NOTEBOOK":
            return {
                ...state,
                notebook: action.payload
            }
        case "NOTES/UNMOUNT_NOTES" :
            return {
                ...state,
                notes: [],
                notebook: {
                    id: null,
                    name: '',
                    description: ''
                },
                createdNoteId: null
            }
        default:
            return state
    }
}

const setNotes = (notes: Array<NoteIdAndTitleType>): SetNotesActionType => ({type: SET_NOTES, notes})
const setNotebook = (payload: NotebookType): SetNotebookActionType => ({type: SET_NOTEBOOK, payload})
const setCreatedNoteId = (payload: string | null): SetCreatedNoteIdActionType => ({type: SET_CREATED_NOTE_ID, payload})
const unmountNotesAction = (): UnmountNotesActionType => ({type: UNMOUNT_NOTES})

export const deleteNote = (notebookId: string, noteId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await NOTES_API.deleteNote(notebookId, noteId);
        if (response.status === 204) {
            dispatch(requestNotes(notebookId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(deleteNote(notebookId, noteId))
        }
    }
}

export const requestNotebook = (notebookId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await NOTEBOOKS_API.getNotebook(notebookId);
        if (response.status === 200) {
            dispatch(setNotebook(response.data))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(requestNotebook(notebookId))
        }
    }
}

export const requestNotes = (notebookId: string) => {
    return async (dispatch: AppDispatch) => {
        const response = await NOTES_API.getNotes(notebookId);
        if (response.status === 200) {
            const notes: Array<NoteIdAndTitleType> = response.data
            dispatch(setNotes(notes))
            dispatch(requestNotebook(notebookId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(requestNotes(notebookId))
        }
    }
}

export const createNewNote = (notebookId: string) => {
    return async (dispatch: AppDispatch) => {
        const note: NoteType = {
            id: null,
            title: currentDateString(),
            notebookDto: {
                id: notebookId,
                name: "",
                description: null
            },
            data: {
                content: DEFAULT_CONTENT,
                selection: {anchor: 0, head: 0}
            }
        }
        const response = await NOTES_API.createNote(notebookId, note);
        if (response.status === 201) {
            const newNoteId: string = response.data.id
            dispatch(setCreatedNoteId(newNoteId))
        } else if (isTokenExpired(response)) {
            dispatch(refreshToken())
            dispatch(createNewNote(notebookId))
        }
    }
}

export const unmountNotes = () => {
    return (dispatch: AppDispatch)=> {
        dispatch(unmountNotesAction())
    }
}

export const clearCreatedNoteId = () => {
    return async (dispatch: AppDispatch) => {
        dispatch(setCreatedNoteId(null))
    }
}

export default notesReducer