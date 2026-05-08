import { useState } from "react"

export const useUsers = ({ search, limit }: any) => {
    const [users, setUsers] = useState([])

    const getUsers = async ({ search, limit, page = 1 }: any) => {
        return fetch('/api/users').then(res => res.json()).then(data => {
            return data
        })
    }

    return { users, setUsers, getUsers }

}