import { useState, useEffect } from 'react'
import './App.css'
import Game from './Game'
import GameModeEnum from './GameModeEnum';
import InstructionsDialog from './InstructionsDialog';
import SettingsDialog from './SettingsDialog';

// Holds a JSON object containing game settings
// - showPercents (boolean)
const gameSettingsString = "gameSettings";

// Holds the number of milliseconds since EPOCH representing the last time the instructions were viewed
const lastViewedInstructionsString = "lastViewedInstructions";
const millisecondsInDay = 86400000;

function App() {
  
  const getSettingsFromLocalStorage = () => {
    const savedSettings = localStorage.getItem(gameSettingsString);
    return savedSettings ? JSON.parse(savedSettings) : { showPercents: false};
  }

  const getInstructionsDialogViewFromLocalStorage = () => {
    const lastViewedInstructionsTime = localStorage.getItem(lastViewedInstructionsString);
    return lastViewedInstructionsTime ? JSON.parse(lastViewedInstructionsTime) : Date.now();
  }

  const [isInstructionDialogOpen, setIsInstructionDialogOpen] = useState(false);
  const [lastInstructionDialogViewTime, setLastInstructionDialogViewTime] = useState(getInstructionsDialogViewFromLocalStorage);
  const [selectedMode, setSelectedMode] = useState(GameModeEnum.DAILY_SEED);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [settings, setSettings] = useState(getSettingsFromLocalStorage);

  // Mount the dialog on page load
  useEffect(() => {
    if((Date.now() - lastInstructionDialogViewTime) > millisecondsInDay) {
      showInstructionDialog();
    }
  }, []);

  useEffect(() => {
    console.log("Writing settings to storage...")
    localStorage.setItem(gameSettingsString, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    console.log("Writing instruction view time " + lastInstructionDialogViewTime + " to storage...")
    localStorage.setItem(lastViewedInstructionsString, JSON.stringify(lastInstructionDialogViewTime));
  }, [lastInstructionDialogViewTime]);

  const showInstructionDialog = () => {
    setIsInstructionDialogOpen(true);
  };

  const closeInstructionDialog = () => {
    setIsInstructionDialogOpen(false);
    setLastInstructionDialogViewTime(Date.now());
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
            <button className={'gameModeButton ' + (selectedMode == GameModeEnum.FREE_PLAY ? 'pressedButton' : 'unpressedButton')} onClick={() => selectMode(GameModeEnum.FREE_PLAY)}>Free</button>
            <button className={'gameModeButton ' + (selectedMode == GameModeEnum.FREE_SEED ? 'pressedButton' : 'unpressedButton')} onClick={() => selectMode(GameModeEnum.FREE_SEED)}>Seeded</button>
            <button className={'settingsButton ' + (isSettingsDialogOpen ? 'pressedButton' : 'unpressedButton')} onClick={ () => showSettingsDialog()}>⚙</button>
            <button className={'settingsButton ' + (isInstructionDialogOpen ? 'pressedButton' : 'unpressedButton')} onClick={ () => showInstructionDialog()}>?</button>
        </div>
        
        {selectedMode == GameModeEnum.DAILY_SEED && <Game settings={settings} gameMode={selectedMode} />}
        {selectedMode == GameModeEnum.FREE_PLAY && <Game settings={settings} gameMode={selectedMode} />}
        {selectedMode == GameModeEnum.FREE_SEED && <Game settings={settings} gameMode={selectedMode} />}
    </div>
  );
};

export default App