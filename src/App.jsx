import { useState, useEffect } from 'react'
import './App.css'
import Game from './Game'
import GameModeEnum from './GameModeEnum';
import InstructionsDialog from './InstructionsDialog';

function App() {
  const [isInstructionDialogOpen, setIsInstructionDialogOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(GameModeEnum.FREE_PLAY);

  // Mount the dialog on page load
  useEffect(() => {
    setIsInstructionDialogOpen(true);
  }, []);

  const closeInstructionDialog = () => {
    setIsInstructionDialogOpen(false);
  };

  const selectMode = (mode) => {
    console.log("New game mode selected: " + mode);
    setSelectedMode(mode);

  };

  return(
    <div className="App">
        {isInstructionDialogOpen && (
        <InstructionsDialog closeFunction={closeInstructionDialog} />
        )}
        <span><i>Now with game modes!</i></span>
        <div className='gameModeDiv'>
            {/* <button onClick={() => selectMode(GameModeEnum.DAILY_SEED)}>Daily</button> --> */}
            <button className={selectedMode == GameModeEnum.FREE_PLAY ? 'pressedGameModeButton' : 'gameModeButton'} onClick={() => selectMode(GameModeEnum.FREE_PLAY)}>Free Play</button>
            <button className={selectedMode == GameModeEnum.FREE_SEED ? 'pressedGameModeButton' : 'gameModeButton'} onClick={() => selectMode(GameModeEnum.FREE_SEED)}>Seeded Start</button>
        </div>
        
        {/*{selectedMode == GameModeEnum.DAILY_SEED && <Game gameMode={selectedMode} />} */}
        {selectedMode == GameModeEnum.FREE_PLAY && <Game gameMode={selectedMode} />}
        {selectedMode == GameModeEnum.FREE_SEED && <Game gameMode={selectedMode} />}
    </div>
  );
};

export default App