import { useState, useEffect } from 'react'
import './App.css'
import Game from './Game'
import GameModeEnum from './GameModeEnum';
import InstructionsDialog from './InstructionsDialog';
import SettingsDialog from './SettingsDialog';

function App() {
  const [isInstructionDialogOpen, setIsInstructionDialogOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(GameModeEnum.DAILY_SEED);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [settings, setSettings] = useState({ showPercents: false });

  // Mount the dialog on page load
  useEffect(() => {
    setIsInstructionDialogOpen(true);
  }, []);

  const closeInstructionDialog = () => {
    setIsInstructionDialogOpen(false);
  };

  const showSettingsDialog = () => {
    setIsSettingsDialogOpen(true);
  };

  const closeSettingsDialog = (updatedSettings) => {
    setIsSettingsDialogOpen(false);
    setSettings(updatedSettings);
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
        {isSettingsDialogOpen && (
            <SettingsDialog settings={settings} closeFunction={closeSettingsDialog} />
        )}
        <span><i>Now with game modes!</i></span>
        <div className='gameModeDiv'>
            <button className={'gameModeButton ' + (selectedMode == GameModeEnum.DAILY_SEED ? 'pressedButton' : 'unpressedButton')} onClick={() => selectMode(GameModeEnum.DAILY_SEED)}>Daily</button>
            <button className={'gameModeButton ' + (selectedMode == GameModeEnum.FREE_PLAY ? 'pressedButton' : 'unpressedButton')} onClick={() => selectMode(GameModeEnum.FREE_PLAY)}>Free Play</button>
            <button className={'gameModeButton ' + (selectedMode == GameModeEnum.FREE_SEED ? 'pressedButton' : 'unpressedButton')} onClick={() => selectMode(GameModeEnum.FREE_SEED)}>Seeded</button>
            <button className={'settingsButton ' + (isSettingsDialogOpen ? 'pressedButton' : 'unpressedButton')} onClick={ () => showSettingsDialog()}>⚙</button>
        </div>
        
        {selectedMode == GameModeEnum.DAILY_SEED && <Game settings={settings} gameMode={selectedMode} />}
        {selectedMode == GameModeEnum.FREE_PLAY && <Game settings={settings} gameMode={selectedMode} />}
        {selectedMode == GameModeEnum.FREE_SEED && <Game settings={settings} gameMode={selectedMode} />}
    </div>
  );
};

export default App