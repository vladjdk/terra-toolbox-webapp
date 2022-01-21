import { Box, Card, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { useNavigate } from 'react-router-dom';

interface Tool {
    name: string,
    link: string,
    description: string
}

const tools = [
    {
        name: 'Free Willy',
        link: '/freewilly',
        description: 'Withdraw Anchor liquidations with no additional fee!'
    },
    {
        name: 'Coming Soon!',
        link: '/',
        description: 'More tools will be added in the future!  Stay tuned!'
    }
] as Tool[]

export function Home() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                p: 1,
                gap: '12px',
            }}
        >
            {tools.map(tool => 
                <Card key={tool.name} sx={{ maxWidth: 275, cursor: 'pointer', bgcolor: 'primary.light' }} onClick={() => navigate(tool.link)} >
                    <CardContent>
                        <Typography sx={{ fontSize: 24 }} gutterBottom>
                            {tool.name}
                        </Typography>
                        <Typography variant="body2">
                            {tool.description}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
  }