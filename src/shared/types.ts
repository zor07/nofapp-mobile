
export type LevelType = {
    id: string
    name: string
    order: number
    tasks: Array<TaskType> | null
}


export type RemirrorJSON = {
    // TODO we need to use remirror in native app...
    data: string | null
}

export type PrimitiveSelection = {
    // TODO we need to use remirror in native app...
    data: string | null
}

export type TaskType = {
    id: string,
    order: number,
    name: string,
    description: string,
    level: LevelType,
    fileUri: string | null,
    data: RemirrorJSON | null,
}

export type UserTaskType = {
    task: TaskType
    completed: boolean
}

export type UserProgressType = {
    uncompletedTask: UserTaskType
    userTasks: Array<UserTaskType>
}

export type NotebookType = {
    id: string | null
    name: string
    description: string | null
}

export type NoteType = {
    id: string | null
    title: string
    notebookDto: NotebookType
    data: NoteStateType
}

export type NoteStateType = {
    content: RemirrorJSON,
    selection: PrimitiveSelection | null | undefined
}

export type ProfileType = {
    id: string | null
    avatarUri: string | null
    timerStart: Date
    user: {
        id: string
        name: string
        username: string
    }
}

export type RelapseLogType = {
    id: string
    start: Date
    stop: Date
}

export type TimerDtoType = {
    description: string,
    start: string
}

export type PracticeTagType = {
    id: string | null
    name: string
}

export type  PracticeType = {
    id: string | null
    name: string
    practiceTag: PracticeTagType
    description: string
    data: string
    isPublic: boolean
}
