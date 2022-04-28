import { makeStyles } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

import { balls } from './mockData';
import { background, checkMark, close } from '../images';

interface SelectBallProps {
  currentId: number;
  setGameOptions: any;
}

export const SelectBall = ({ currentId, setGameOptions }: SelectBallProps) => {
  const classes = useStyles();

  const navigate = useNavigate();

  const handleButton = (id: number, isUnlocked: boolean) => {
    if (isUnlocked) {
      setGameOptions((prevSate: { ballType: number; levelType: number }) => ({ ...prevSate, ballType: id }));
    }
  };

  console.log('currentId', currentId);

  return (
    <div className={classes.mainWrapper}>
      <div className={classes.contentWrapper}>
        <button className={classes.close} onClick={() => navigate('/play-game')}>
          <img src={close} alt='close'></img>
        </button>
        <div className={classes.content}>
          <h2 className={classes.subTitle}>Balls</h2>
          <div className={classes.ballsWrapper}>
            {balls.map(({ id, isUnlocked, src }) => (
              <button key={id} className={classes.ballButton} onClick={() => handleButton(id, isUnlocked)}>
                <img alt='ball' src={src} />
                {currentId === id && (
                  <img alt='current ball is selected' className={classes.checkMark} src={checkMark} />
                )}
              </button>
            ))}
          </div>
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
    height: '100%',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '100px',
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

  close: {
    padding: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'absolute',
    top: '38px',
    right: '35px',
  },
  ballsWrapper: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    maxWidth: '902px',
    justifyContent: 'center',
  },

  ballButton: {
    padding: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
  },
  checkMark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  levelText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    color: 'white',
    transform: 'translate(-50%, -50%)',
    fontFamily: "'Poppins'",
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: '60px',
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
