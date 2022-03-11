
import * as React from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import {Box} from '@mui/system';


export default function AttributeCard(props: any) {

    const card = (
        <Box sx={{padding: "3px"}}>
            <Typography sx={{fontSize: 11, fontFamily: 'proxima nova, sans-serif',color: "#666666"}}>
                {props.props.trait_type}
            </Typography>
            <Typography sx={{fontSize: 12, fontFamily: 'proxima nova, sans-serif', color: "white"}} component="div">
                {props.props.value}
            </Typography>
        </Box>
    )
    return (
        <Card sx={{
            minHeight: 20,
            minWidth: 40,
            maxWidth: 190,
            maxHeight: 45,
            fontFamily: "proxima nova, sans-serif",
            backgroundColor: "#242424",
            border: "1px solid #666666",
            color: "white",
            borderRadius: "9px",
        }} variant="outlined">{card} </Card>
    )
}
