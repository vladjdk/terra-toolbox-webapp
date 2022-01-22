import { Button, Stack, Typography, TextField } from '@mui/material';

export default function PlaceBid() {
    return (
        <Stack sx={{padding: '10px'}}>
            <Typography variant="h4" sx={{margin: '10px'}}>
                Place Bids
            </Typography>
            <TextField
                id="filled-number"
                label="Premium (%)"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                variant="filled"
            />
            <TextField
                id="filled-number"
                label="Bid amount (UST)"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                variant="filled"
            />
            <Button variant="contained">Place Bid</Button>
        </Stack>
    );
  }
