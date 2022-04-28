import { makeStyles } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

import { background, balls, levels, play } from '../images';

interface PlayGameProps {
  gameOptions: { ballType: number; levelType: number };
}

export const PlayGame = ({ gameOptions }: PlayGameProps) => {
  const classes = useStyles();

  const data = JSON.stringify(gameOptions);

  const navigate = useNavigate();

  return (
    <div className={classes.mainWrapper}>
      <div className={classes.contentWrapper}>
        <h1 className={classes.mainTitle}>Cool Golf</h1>
        <h2 className={classes.subTitle}>Minigame</h2>
        <a href={`https://dmytroskrypnyk.github.io?data=${data}`} rel='noopener noreferrer' target='_self'>
          <img className={classes.play} src={play} alt='play' />
        </a>
        <div className={classes.buttonWrapper}>
          <button className={classes.button} onClick={() => navigate('/select-ball')}>
            <img src={balls} alt='balls'></img>
          </button>
          <button className={classes.button} onClick={() => navigate('/select-level')}>
            <img src={levels} alt='levels'></img>
          </button>
        </div>
      </div>
      <img className={classes.background} src={background} alt='background' />
    </div>
  );
};

const useStyles = makeStyles(() => ({
  mainWrapper: {
    height: '100vh',
    width: '100vw',
    position: 'relative',
  },
  contentWrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  mainTitle: {
    display: 'inline',
    fontFamily: "'Poppins'",
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: '100px',
    margin: '52px 0 0',
  },
  subTitle: {
    display: 'inline',
    fontFamily: "'Poppins'",
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: '60px',
    margin: 0,
  },
  play: {
    objectFit: 'cover',
    height: '140px',
    width: '140px',
    margin: '50px',
    cursor: 'pointer',
  },
  buttonWrapper: {
    display: 'flex',
    gap: '50px',
  },
  button: {
    padding: 0,
    width: 'fit-content',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    zIndex: -1,
  },
}));
