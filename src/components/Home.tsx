import { Box, Card, Stack, Typography } from '@mui/material';
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
    {   name: 'Tiny Balances',
        link: '/tinyangel',
        description: "Do stuff with tiny balances in your wallet or stakes, such as donating it to Angel Protocol."
    },
    {
        name: 'Coming Soon!',
        link: '/',
        description: 'More tools will be added in the future!  Stay tuned!'
    }
] as Tool[]

const externalTools = [
    {
        name: 'Extraterrestrial Finder',
        link: 'https://finder.extraterrestrial.money/',
        description: 'Blockchain explorer'
    },
    {
        name: 'Coinhall',
        link: 'https://coinhall.org/',
        description: 'Live price charts'
    },
    {
        name: 'Track Terra',
        link: 'https://beta.trackterra.org/',
        description: 'Transaction exporter for taxes'
    },
    {
        name: 'Terra Dashboard',
        link: 'https://terradashboard.com/',
        description: 'Customizable dashboard for Terra'
    }
]

export function Home() {
    const navigate = useNavigate();

    const navigateToExternalLink = (link: string) => {
        window.open(link, '_blank');
    }

    return (
        <Stack>
            <Typography variant="h4" sx={{textAlign: 'center', marginTop: '24px'}}>
                Supported Tools
            </Typography>
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
            <Typography variant="h4" sx={{textAlign: 'center', marginTop: '24px'}}>
                External Tools
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    p: 1,
                    gap: '12px',
                }}
            >
                {externalTools.map(tool => 
                    <Card key={tool.name} sx={{ maxWidth: 275, cursor: 'pointer', bgcolor: 'primary.light' }} onClick={() => navigateToExternalLink(tool.link)} >
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
        </Stack>
    );
  }
