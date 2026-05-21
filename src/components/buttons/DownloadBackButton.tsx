import Button from "../ui/button/Button";

export default function BackupButton() {
    const download = async () => {
        const response = await fetch(
            '/backup'
        );

        const blob = await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.href = url;
        a.download = 'backup.json.gz';

        a.click();
    };

    return (
        <Button onClick={download}>Descargar Backup</Button>


    );
}