"use client"

import BackupButton from "@/components/buttons/DownloadBackButton"

export default function Page() {
    return <div className="flex flex-col gap-3"><h1 className="text-3xl font-bold">Respaldar BD</h1><BackupButton></BackupButton></div>
}