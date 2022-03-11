import * as React from 'react';

import Grid from '@mui/material/Grid';
import LeaderCard from './ImageCard';

export default function NftGrid(props:any) {
  return (
    <Grid sx={{ flexGrow: 1, marginTop:"40px" }} container spacing={1}>
      <Grid item xs={12}>
        <Grid container justifyContent="center" spacing={3}>
          {
            props.props.map((value:any) => (
              <Grid key={value.mint} item>
                <LeaderCard
                  handle = {value.mint}
                  onPlay = {props.onPlay}
                  wallet = {props.wallet}
                />
              </Grid>
            ))
          }
        </Grid>
      </Grid>
      <Grid item xs={12}>
      </Grid>
    </Grid>
  );
}