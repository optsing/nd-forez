import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ParseResultDescription } from "../models/models";
import { API_URL } from "../consts";
import { Alert, Box, List, ListItemButton, ListItemText, Paper, Snackbar, Typography } from "@mui/material";

interface ParseResultView {
    id: number;
    title: string;
    subtitle: string;
}

const RecentPage: React.FC = () => {
    const [recent, SetRecent] = useState<ParseResultView[]>();
    const [error, setError] = useState<string | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

    const handleAlertClose = () => setIsAlertOpen(false);

    useEffect(() => {
        const fn = async () => {
            try {
                const response = await fetch(API_URL + '/api/parse-results', {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const data: ParseResultDescription[] = await response.json();
                const rec: ParseResultView[] = [];
                for (const r of data) {
                    const curveNames: Set<string> = new Set();
                    const fileNames: Set<string> = new Set();
                    for (const s of r.size_standards) {
                        curveNames.add(s.title);
                        fileNames.add(s.filename);
                    }
                    for (const g of r.gen_libs) {
                        curveNames.add(g.title);
                        fileNames.add(g.filename);
                    }
                    const curveTitle = [...curveNames].sort().join(', ');
                    const fileTitle = [...fileNames].sort().join(', ');
                    rec.push({
                        id: r.id,
                        title: `Кривые: ${curveTitle}`,
                        subtitle: `Файлы: ${fileTitle}`,
                    })
                }
                SetRecent(rec);
            } catch (err) {
                console.error(err);
                setError('Ошибка при парсинге');
                setIsAlertOpen(true);
            }
        }
        fn();
    }, []);

    return (
        <Box m={3}>
            <Typography variant='h5' textAlign='center' gutterBottom>Последние открытые файлы</Typography>
            {recent && (recent.length > 0 ? <List component={Paper}>
                {recent?.map(item => (
                    <ListItemButton key={item.id} href={`/?id=${item.id}`}>
                        <ListItemText primary={item.title} secondary={item.subtitle} />
                    </ListItemButton>
                ))}
            </List> : <Typography variant='h6' textAlign='center' gutterBottom>Нет недавно открытых файлов</Typography>)}
            <Snackbar open={isAlertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
                <Alert severity='error' variant="filled" onClose={handleAlertClose}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RecentPage;