
import * as React from 'react';
import Grid from '@mui/material/Grid';
import AttributeCard from './AttributeCard';
import { Box} from '@mui/system';

export default function AttributeCardGrid(props:any) {
console.log("attribute grid props", props )

  return (
    <Box sx={{ flexGrow: 1, height: "270px"}}>
      <Grid container spacing={1}>
        {props.props.map((value:any) => (
          <Grid key={value.value} item xs = {6}>
            <AttributeCard
              props = {value}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}