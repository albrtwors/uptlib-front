export const fetchPostConfig = (data: any): any => {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
    }

}

export const fetchPatchConfig = (data: any): any => {
    return {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    }
}

export const fetchDeleteConfig = (): any => {
    return {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    }

}