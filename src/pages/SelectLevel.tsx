import { makeStyles } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

import { background, buttonContainer, close, lockedLevel } from '../images';

interface SelectLevelProps {
  setGameOptions: any;
}

const levels = [
  {
    id: 0,
    isUnlocked: true,
  },
  {
    id: 1,
    isUnlocked: true,
  },
  {
    id: 2,
    isUnlocked: false,
  },
  {
    id: 3,
    isUnlocked: false,
  },
  {
    id: 4,
    isUnlocked: false,
  },
  {
    id: 5,
    isUnlocked: false,
  },
  {
    id: 6,
    isUnlocked: false,
  },
  {
    id: 7,
    isUnlocked: false,
  },
  {
    id: 8,
    isUnlocked: false,
  },
];

export const SelectLevel = ({ setGameOptions }: SelectLevelProps) => {
  const classes = useStyles();

  const navigate = useNavigate();

  const handleButton = (id: number) => {
    setGameOptions((prevSate: { ballType: number; levelType: number }) => ({ ...prevSate, levelType: id }));
    navigate('/play-game');
  };

  return (
    <div className={classes.mainWrapper}>
      <div className={classes.contentWrapper}>
        <button className={classes.close} onClick={() => navigate('/play-game')}>
          <img src={close} alt='close'></img>
        </button>
        <div className={classes.content}>
          <h2 className={classes.subTitle}>Levels</h2>
          <div className={classes.levelsWrapper}>
            {levels.map(({ id, isUnlocked }) =>
              isUnlocked ? (
                <button key={id} className={classes.levelButton} onClick={() => handleButton(id)}>
                  <span className={classes.levelText}>{id + 1}</span>
                  <img alt='unlocked level' src={buttonContainer} />
                </button>
              ) : (
                <button key={id} className={classes.levelButton}>
                  <img alt='locked level' src={lockedLevel} />
                </button>
              )
            )}
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

  levelsWrapper: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    maxWidth: '902px',
    justifyContent: 'center',
  },

  levelButton: {
    padding: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
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
