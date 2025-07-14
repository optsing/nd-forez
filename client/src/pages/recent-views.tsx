import { useEffect, useState } from "react";
import { Box, CircularProgress, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { getErrorMessage, getParseResults } from "../helpers/api";
import { useAlert } from "../context/alert-context";
import { Link } from "react-router";

interface ParseResultView {
    id: number;
    title: string;
    subtitle: string;
}

const RecentPage: React.FC = () => {
    const [recentViews, SetRecentViews] = useState<ParseResultView[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const showAlert = useAlert();

    useEffect(() => {
        const fn = async () => {
            try {
                setIsLoading(true);
                const results = await getParseResults();
                const rec: ParseResultView[] = [];
                for (const result of results) {
                    const standardNames: string[] = [];
                    const genLibNames: string[] = [];
                    const fileNames: Set<string> = new Set();
                    for (const s of result.size_standards) {
                        standardNames.push(s.title);
                        fileNames.add(s.filename);
                    }
                    for (const g of result.gen_libs) {
                        genLibNames.push(g.title);
                        fileNames.add(g.filename);
                    }
                    const standardsTitle = standardNames.sort().join(', ');
                    const genLibsTitle = genLibNames.sort().join(', ');
                    const filesTitle = [...fileNames].sort().join(', ');
                    rec.push({
                        id: result.id,
                        title: `Стандарты длин: ${standardsTitle}; Геномные библиотеки: ${genLibsTitle}`,
                        subtitle: `Файлы: ${filesTitle}`,
                    })
                }
                SetRecentViews(rec);
            } catch (err) {
                console.error(err);
                SetRecentViews([]);
                showAlert(`Ошибка при получении недавних файлов: ${getErrorMessage(err)}`, 'error');
            } finally {
                setIsLoading(false);
            }
        }
        fn();
    }, []);

    return (
        <Box sx={{
            marginX: {
                xs: 1,
                sm: 3,
                md: 6,
            },
            marginTop: 3,
            marginBottom: 12,
        }}>
            <Typography variant='h5' textAlign='center' gutterBottom>Последние открытые файлы</Typography>
            {isLoading && <Box textAlign='center'>
                <CircularProgress sx={{ mt: 3 }} />
            </Box>}
            {recentViews && recentViews.length === 0 && <Typography variant='h6' textAlign='center' gutterBottom>Нет недавно открытых файлов</Typography>}
            {recentViews && recentViews.length > 0 && <List component={Paper}>
                {recentViews.map(item => (
                    <ListItemButton component={Link} key={item.id} to={`/?id=${item.id}`}>
                        <ListItemText primary={item.title} secondary={item.subtitle} />
                    </ListItemButton>
                ))}
            </List>}
        </Box>
    );
};

export default RecentPage;