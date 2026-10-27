import { useState } from "react"

export const useUsers = ({ search, limit }: any) => {
    const [users, setUsers] = useState([])

    const getUsers = async ({ search = '', limit = 10, page = 1 }: any) => {
        const params = new URLSearchParams({
            search,
            limit: String(limit),
            page: String(page),
        })
        return fetch(`/api/users?${params}`).then(res => res.json()).then(data => {
            return data
        })
    }

    return { users, setUsers, getUsers }

}