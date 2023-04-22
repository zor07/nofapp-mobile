import axios, {AxiosRequestConfig} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage/lib/typescript/AsyncStorage.native";
import {LevelType} from "../redux/levels-reducer";
import {TaskType} from "../redux/tasks-reducer";
import {UserProgressType} from "../redux/user-progress-reducer";
import {ProfileType, RelapseLog} from "../redux/profile-reducer";
import {NoteType} from "../redux/note-editor-reducer";
import {NotebookType} from "../redux/notebook-reducer";

const ApiManager = axios.create({
    baseURL: 'http://77.222.55.78:8888/api/v1/',
    responseType: 'json',
    withCredentials: true
})

export const ACCESS_TOKEN: string = 'access_token'
export const REFRESH_TOKEN: string = 'refresh_token'

export default ApiManager


export type ErrorResponse = {
    error_message: string | null
}

export type ResponseType<T> = {
    status: number
    data: T
} & ErrorResponse

export const AUTH_API = {
    register(username: string, name: string, password: string) {
        return ApiManager.post(`auth/register`, {username, name, password})
    },
    login(username: string, password: string) {
        return ApiManager.post(`auth/login`, {username, password})
    },
    me() {
        return ApiManager.get(`auth/me`, auth()).catch((error) => {
            return handleError(error)
        })
    },
    refreshAccessToken() {
        return ApiManager.get(`auth/token/refresh`, {
            headers: {
                "Authorization": `Bearer ${AsyncStorage.getItem(REFRESH_TOKEN)}`
            }
        })
    }
}

export const LEVELS_API = {
    getLevels(): PromiseLike<ResponseType<Array<LevelType>>> {
        return ApiManager.get(`/levels`, auth()).catch((error) => {
            return handleError(error)
        })
    },
    createLevel(level: LevelType): PromiseLike<ResponseType<LevelType>> {
        return ApiManager.post(`/levels`, level, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    updateLevel(level: LevelType): PromiseLike<ResponseType<LevelType>> {
        return ApiManager.put(`/levels/${level.id}`, level, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteLevel(levelId: string): PromiseLike<ResponseType<any>> {
        return ApiManager.delete(`/levels/${levelId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    }
}

export const TASKS_API = {
    getLevelTasks(levelId: string): PromiseLike<ResponseType<Array<TaskType>>> {
        return ApiManager.get(`/levels/${levelId}/tasks`, auth()).catch((error) => {
            return handleError(error)
        })
    },
    getLevelTask(levelId: string, taskId: string): PromiseLike<ResponseType<TaskType>> {
        return ApiManager.get(`/levels/${levelId}/tasks/${taskId}`, auth()).catch((error) => {
            return handleError(error)
        })
    },
    getNextTask(task: TaskType): PromiseLike<ResponseType<TaskType>> {
        return ApiManager.get(`/levels/${task.level.id}/tasks/${task.id}/next`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    getPrevTask(task: TaskType): PromiseLike<ResponseType<TaskType>> {
        return ApiManager.get(`/levels/${task.level.id}/tasks/${task.id}/prev`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    createLevelTask(levelId: string, task: TaskType): PromiseLike<ResponseType<TaskType>> {
        return ApiManager.post(`/levels/${levelId}/tasks`, task, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    updateLevelTask(levelId: string, taskId: string, task: TaskType): PromiseLike<ResponseType<TaskType>> {
        return ApiManager.put(`/levels/${levelId}/tasks/${taskId}`, task, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    uploadMediaToTask(
        levelId: string,
        taskId: string,
        file: File
    ): PromiseLike<ResponseType<any>> {
        const formData = new FormData();
        formData.append('file', file)
        const config : AxiosRequestConfig = {
            headers: {
                "Authorization": `Bearer ${AsyncStorage.getItem(ACCESS_TOKEN)}`,
                "content-type": "multipart/form-data"
            }
        }

        return ApiManager.post(`/levels/${levelId}/tasks/${taskId}/video`, formData, config)
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteMediaFromTask(levelId: string, taskId: string): PromiseLike<ResponseType<any>> {
        return ApiManager.delete(`/levels/${levelId}/tasks/${taskId}/video`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteTask(levelId: string, taskId: string): PromiseLike<ResponseType<any>> {
        return ApiManager.delete(`/levels/${levelId}/tasks/${taskId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    }
}

export const USER_PROGRESS_API = {

    fetchUserProgress(): PromiseLike<ResponseType<UserProgressType>> {
        return ApiManager.get<UserProgressType>(`progress`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    finishCurrentTask(): PromiseLike<ResponseType<any>> {
        return ApiManager.put(`progress/finishCurrentTask`, null, auth())
            .catch((error) => {
                return handleError(error)
            })
    }

}

export const PROFILE_API = {
    getProfiles(): PromiseLike<ResponseType<Array<ProfileType>>> {
        return ApiManager.get<Array<ProfileType>>(`profiles`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    getProfile(userId: string): PromiseLike<ResponseType<ProfileType>> {
        return ApiManager.get<ProfileType>(`profiles/${userId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    uploadAvatar(userId: string, avatar: File): PromiseLike<ResponseType<any>> {
        const formData = new FormData();
        formData.append('file', avatar)
        const config : AxiosRequestConfig = {
            headers: {
                "Authorization": `Bearer ${AsyncStorage.getItem(ACCESS_TOKEN)}`,
                "content-type": "multipart/form-data"
            }
        }

        return ApiManager.post(`profiles/${userId}/avatar`, formData, config)
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteAvatar(userId: string): PromiseLike<ResponseType<any>> {
        return ApiManager.delete(`profiles/${userId}/avatar`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
}

export const USER_POSTS_API = {
    getUserPosts(userId: string): PromiseLike<ResponseType<Array<NoteType>>> {
        return ApiManager.get(`profiles/${userId}/posts`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    addPostToUser(userId: string, noteId: string): PromiseLike<ResponseType<any>> {
        return ApiManager.post(`profiles/${userId}/posts/${noteId}`, {}, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteUserPost(userId: string, noteId: string): PromiseLike<ResponseType<any>> {
        return ApiManager.delete(`profiles/${userId}/posts/${noteId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    }
}

export const RELAPSE_LOG_API = {
    getRelapseLogEntries(userId: string): PromiseLike<ResponseType<Array<RelapseLog>>> {
        return ApiManager.get(`profiles/${userId}/relapses`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    relapsed(userId: string): PromiseLike<ResponseType<ProfileType>> {
        return ApiManager.post<ProfileType>(`profiles/${userId}/relapsed`, {}, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteRelapseLogEntry(userId: string, relapseLogId: string) {
        return ApiManager.delete(`profiles/${userId}/relapses/${relapseLogId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    }
}

export const TIMER_API = {
    getTimers() {
        return ApiManager.get(`timers`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    startTimer(timerData: any) {
        return ApiManager.post(`timers`, timerData, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    stopTimer(timerId: string) {
        return ApiManager.put(`timers/${timerId}/stop`, null, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteTimer(timerId: string) {
        return ApiManager.delete(`timers/${timerId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    }
}

export const NOTES_API = {
    getNotes(notebookId: string) {
        return ApiManager.get(`notebooks/${notebookId}/notes`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    getNote(notebookId: string, noteId: string) {
        return ApiManager.get(`notebooks/${notebookId}/notes/${noteId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    createNote(notebookId: string, note: NoteType) {
        return ApiManager.post(`notebooks/${notebookId}/notes`, note, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    updateNote(notebookId: string, note: NoteType) {
        return ApiManager.put(`notebooks/${notebookId}/notes`, note, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteNote(notebookId: string, noteId: string) {
        return ApiManager.delete(`notebooks/${notebookId}/notes/${noteId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    }
}


export const NOTEBOOKS_API = {
    getNotebook(notebookId: string) {
        return ApiManager.get(`notebooks/${notebookId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    getNotebooks() {
        return ApiManager.get('notebooks', auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    createNotebook(notebook: NotebookType) {
        return ApiManager.post('notebooks', notebook, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    updateNotebook(notebook: NotebookType) {
        return ApiManager.put('notebooks', notebook, auth())
            .catch((error) => {
                return handleError(error)
            })
    },
    deleteNotebook(notebookId: string) {
        return ApiManager.delete(`notebooks/${notebookId}`, auth())
            .catch((error) => {
                return handleError(error)
            })
    }
}

export const auth = (): AxiosRequestConfig => {
    return {
        headers: {
            "Authorization": `Bearer ${AsyncStorage.getItem(ACCESS_TOKEN)}`
        }
    }
}

const handleError = (error:any) => {
    if (error.response && error.response.status === 403) {
        return error.response
    } else {
        console.error(error)
    }
}