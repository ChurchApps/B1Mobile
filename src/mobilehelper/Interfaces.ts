export type { ApiConfig, ApiListType, ApiInterface } from "@churchapps/helpers"

export interface ChurchAppInterface { id?: string, churchId?: string, appName?: string }

export interface ClassroomInterface { id?: string; churchId?: string; name?: string; }

export interface LessonPlaylistInterface { lessonName: string, lessonTitle: string, lessonImage:string, lessonDescription:string, venueName: string, messages: LessonPlaylistMessageInterface[] }
export interface LessonPlaylistMessageInterface { name: string, files: LessonPlaylistFileInterface[] }
export interface LessonPlaylistFileInterface { name: string, url: string, seconds: number, loopVideo: boolean }

export interface ProgramInterface { id?: string, churchId?: string, providerId?: string, name?: string, slug?: string, image?: string, shortDescription?: string, description?: string, videoEmbedUrl: string, live?: boolean, aboutSection?: string }
export interface StudyInterface { id?: string, churchId?: string, programId?: string, name?: string, slug?: string, image?: string, shortDescription?: string, description?: string, videoEmbedUrl?: string, sort?: number, live?: boolean}
export interface LessonInterface { id?: string, churchId?: string, studyId?: string, name?: string, slug?: string, title?: string, sort?: number, image?: string, live?: boolean, description?: string, videoEmbedUrl?: string }
export interface VenueInterface { id?: string, churchId?: string, lessonId?: string, name?: string, sort?: number }
