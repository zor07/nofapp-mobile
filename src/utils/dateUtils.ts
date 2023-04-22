export const getCurrentDateISOString = (): string => {
    return adjustForTimezone(new Date().toISOString());
}

export const adjustForTimezone = (dateString: string): string => {
    const date = new Date(dateString)
    return new Date(date.setMinutes(date.getMinutes() - date.getTimezoneOffset())).toISOString();
}

export const currentDateString = (): string => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    return dd + '.' + mm + '.' + yyyy;
}