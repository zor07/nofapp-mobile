import {ResponseType} from "./api";

export const isTokenExpired = (response : ResponseType<any>) : boolean => {
    return response.status === 403 && response.data.error_message.includes('The Token has expired');
}