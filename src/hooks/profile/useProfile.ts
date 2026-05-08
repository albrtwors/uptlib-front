import { useEffect, useState } from "react";

export default function useProfile() {
    const [profile, setProfile] = useState(null)

    const getProfile = () => {
        return fetch('/api/users/profile').then(res => res.json()).then(data => {
            return data
        })
    }

    useEffect(() => {
        getProfile().then((res: any) => {
            setProfile(res)
        })

    }, [])


    return { profile, setProfile, getProfile }
}
