import { useState, useEffect, useRef } from 'react'
import './Game.css'
import allWords from './data/words_alpha_five.json'
import { determingPatternWithMostRemainingWords, filterPossibleWordsByPattern } from './WordFiltering'
import defaultKeymap from './data/defaultKeymap.json'
import defaultKeyPositions from './data/defaultKeyPositions.json'
import GuessEnum from './GuessEnum'
import GameModeEnum from './GameModeEnum'
import seedrandom from 'seedrandom'

function scaleRedToGreen(value) {
  value = Math.max(0, Math.min(1,value));

  const red = Math.round(255 * (1-value));
  const green = Math.round(255 * value);

  return "rgb(" + red + ", " + green + ", 0)";
}

function getColorFromGuessEnum(patternCode) {
  switch(patternCode) {
    case GuessEnum.CORRECT:
      return "green";
    case GuessEnum.PLACE:
      return "goldenrod";
    case GuessEnum.WRONG:
      return "gray";
    case GuessEnum.UNUSED:
      return "gainsboro";
  }
  return "black";
}

function FormatGuess({ submittedGuess, pattern, wasHumanSubmitted, showPercents, percentDecreaseString }) {
  
  useEffect(() => {
    console.log("Updating format guess because of showpercents")
  }, [showPercents]);

  // Turns a guess text string and the results pattern into something more colorful and actionable
  const spans = [];

  for (let index = 0; index < submittedGuess.length; ++index){
    spans.push(
      <span key={submittedGuess + index} style={{ backgroundColor:getColorFromGuessEnum(parseInt(pattern[index])) }}>
        {submittedGuess[index]}
      </span>
    )
  }

  return (
    <div className="guessFeedbackRow">
      {spans}
      {wasHumanSubmitted == true && showPercents == true &&
        <span className="offsetPercentFeedback" style={{ color: scaleRedToGreen(parseFloat(percentDecreaseString)/100)}}>{percentDecreaseString}%</span>
      }
    </div>
  );
}

/**
 * Builds out the graphical keymap based on the internal model
 * @param {keymap} keymap 
 */
function FormatKeymap({keymap, letterClickFunction}) {

  const rowSpans = [];

  for(let row=0; row<defaultKeyPositions.length; ++row)
  {
    const buttons = []
    for(let letter = 0; letter < defaultKeyPositions[row].length; ++letter) {
      buttons.push(
        <button key={defaultKeyPositions[row][letter]} onClick={() => letterClickFunction(defaultKeyPositions[row][letter])} style={{ backgroundColor:getColorFromGuessEnum(keymap[defaultKeyPositions[row][letter]])}}>
          {defaultKeyPositions[row][letter]}
        </button>
      )
    }
    rowSpans.push(<div key={row}>{buttons}</div>);
  }

  return (
    <div>{rowSpans}</div>
  );
}



// Super hacky workaround of double init issue to get seeds working
let wasSeedWordSubmitted = false;

function Game({gameMode, settings}) {
  wasSeedWordSubmitted = false;

  const getGameStateStorageIdentifier = (gameMode) => {
    return "gameState_" + gameMode;
  }

  // Pulls out the game state from local storage
  const getGameStateFromStorage = () => {
    console.log("Going to pull from local storage: " + getGameStateStorageIdentifier(gameMode));
    const gameState = localStorage.getItem(getGameStateStorageIdentifier(gameMode));
    
    console.log("pulling history from game storage: " + gameState);
    return gameState ? JSON.parse(gameState) : []
  }

  // State for game
  const [guess, setGuess] = useState('');
  // The history object looks like:
  // { submittedGuess, effectivePattern, wasHumanSubmitted, percentDecreaseString }
  const [history, setHistory] = useState(getGameStateFromStorage);
  const [possibleWords, setPossibleWords] = useState(allWords); // Assume you have a list of possible words
  const [answer, setAnswer] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [keymap, setKeymap] = useState(JSON.parse(JSON.stringify(defaultKeymap)));
  const [showPercents, setShowPercents] = useState(settings.showPercents);

  const guessRef = useRef(guess);
  const possibleWordsRef = useRef(possibleWords);

  // Keeps the guessRef up to date when guess changes
  useEffect(() => {
    guessRef.current = guess;
  }, [guess]);

  // Keeps the possibleWordsRef up to date when possibleWords set changes
  useEffect(() => {
    possibleWordsRef.current = possibleWords;
  }, [possibleWords]);

  useEffect(() => { 
    console.log("Got settings update!");
    setShowPercents(settings.showPercents);
  }, [settings])

  useEffect(() => {
    console.log("Writing history to storage...");
    localStorage.setItem(getGameStateStorageIdentifier(gameMode), JSON.stringify(history));
  }, [history])

  // Builds the event listener for all keypresses in window
  useEffect(() => {
    const handleKeyDown = (event) => {      
      if (event.key == "Enter") {
        handleSubmit();
      }
      else if (["Backspace","Delete"].includes(event.key)) {
        deleteLastCharacterInGuess();
      }
      else {
        addCharacterToGuess(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  
  // Initializes the state of the game when it loads, if there is any seeding to do
  useEffect(() => {
    // If history has length, then we are pulling from game state and we should update things accordingly
    if(history.length > 0) {
      console.log("Using history: " + history);
      history.forEach(element => {
        possibleWordsRef.current = filterPossibleWordsByPattern(element.submittedGuess, element.effectivePattern, possibleWordsRef.current);
      });
      setPossibleWords(possibleWordsRef.current);
      return; // Don't do other things if we already have history!
    }

    let seed = null;
    if(gameMode == GameModeEnum.DAILY_SEED)
    {
      const dateString = new Date().toISOString().split('T')[0].replaceAll('-','');
      seed = parseInt(dateString);
    }
    initializeWithSeed(seed);
  }, []);

  const reset = () => {
    setGuess('');
    setHistory([]);
    possibleWordsRef.current = allWords;
    setPossibleWords(allWords);
    setAnswer('');
    setGameOver(false);
    
    // Reset all the keys in keymap mutatively
    for(let key in keymap) { keymap[key] = GuessEnum.UNUSED };

    wasSeedWordSubmitted = false;

    initializeWithSeed();
  };

  const initializeWithSeed = (seed) => {    
    const rng = seedrandom(seed ? seed : (Math.random()*Number.MAX_SAFE_INTEGER))
    
    const seedWord = allWords[Math.floor(rng() * allWords.length)];
    if((gameMode != GameModeEnum.FREE_PLAY) && !wasSeedWordSubmitted) {
      console.log("Starting seeded game with initial word: " + seedWord);
      setGuess(seedWord);
      handleSubmit(seedWord);
      wasSeedWordSubmitted = true;
    }
  }

  /**
   * Checks if the current 'guess' variable is actually in our dictionary
   * @returns True if the guess is a valid word (correct number of characters and in the word list)
   */
  const isGuessValidWord = () => {
    // The length check is to avoid the more computationally expensive 'includes' function
    const result = (guess.length === 5 && allWords.includes(guess));

    return result;
  };

  // Function to handle guess submission
  const handleSubmit = (autoGuess) => {
    const wasHumanSubmitted = autoGuess == null;
    const submittedGuess = autoGuess != null ? autoGuess : guessRef.current;
    
    // Assuming 5-letter words
    if (submittedGuess.trim().length === 5 && allWords.includes(submittedGuess) && gameOver == false) { 

      const startingWordsLeft = possibleWordsRef.current.length;
      const result = determingPatternWithMostRemainingWords(submittedGuess, possibleWordsRef.current);

      const wordsLeftNow = result.remainingWords.length;
      const percentDecrease = (1 - (wordsLeftNow / startingWordsLeft)) * 100;
      const percentDecreaseString = percentDecrease.toFixed(1);

      const effectivePattern = result.pattern;

      setHistory((prev) => [...prev, { submittedGuess, effectivePattern, wasHumanSubmitted, percentDecreaseString }]);

      console.log("Largest remaining pattern was: " + result.pattern + " with " + wordsLeftNow + " words remaining");

      setPossibleWords(result.remainingWords);

      updateKeymap(submittedGuess, effectivePattern);

      if (effectivePattern == [GuessEnum.CORRECT, GuessEnum.CORRECT, GuessEnum.CORRECT, GuessEnum.CORRECT, GuessEnum.CORRECT].join("")) {
        setGameOver(true);
        setAnswer(submittedGuess);
      }

      setGuess('');
    } 
    else {
      console.log("DENIED!");
    }
  };


  /**
   * Updates the keymap based on the most recent data
   * @param {string} submittedGuess the latest guess from the user
   * @param {string} pattern the effective pattern that was matched to the guess
   */
  const updateKeymap = (submittedGuess, pattern) => {

    for(let i = 0; i < submittedGuess.length; ++i){
      const newValue = parseInt(pattern[i]);

      if(keymap[submittedGuess[i].toUpperCase()] < newValue) {
        keymap[submittedGuess[i].toUpperCase()] = newValue;
      }      
    }
  };


  /**
   * Adds a new character to the guess string state variable
   * @param {string} newCharacter the new character to add to the guess
   */
  const addCharacterToGuess = (newCharacter) => {
    
    if(/^[a-zA-Z]$/.test(newCharacter)) {
      newCharacter = newCharacter.trim();

      if(guessRef.current.length < 5) {
        setGuess((prev) => prev + newCharacter.toUpperCase());
      }
    }
    else if (newCharacter == "✔") {
      handleSubmit();
    }
    else if (newCharacter == "✖") {
      deleteLastCharacterInGuess();
    }
  };

  /**
   * Removes the most recent character in guess (probably because of a backspace key)
   */
  const deleteLastCharacterInGuess = () => {
    if(guessRef.current.length > 0) {
      setGuess((prev) => prev.slice(0,-1));
    }
  };

  return (
    <div className="Game">
      <h1>Hurtle</h1>
      <div key="board" className="board">
        {history.map((entry) => (
          <FormatGuess key={"guessFormat" + entry.submittedGuess} submittedGuess={entry.submittedGuess} pattern={entry.effectivePattern} wasHumanSubmitted={entry.wasHumanSubmitted} showPercents={showPercents} percentDecreaseString={entry.percentDecreaseString} />
          
        ))}
      </div>
      {!gameOver ?
      <div key="activeInput" className="activeInput">
        <span key="activeInput" style={{ backgroundColor: (isGuessValidWord() == false && guess.length == 5) ? "red" : "" }}>
          { guess.length == 5 ? guess : (guess + "_").padEnd(5) }
        </span>
      </div> : null}
      {gameOver ? <h2>You got it in {history.reduce((acc, curr) => acc + curr.wasHumanSubmitted,0)} tries! The word was obviously <a target="_blank" rel="noopener noreferrer" href={"https://www.merriam-webster.com/dictionary/" + answer}>{answer}</a></h2> : null}
      {(gameOver && gameMode != GameModeEnum.DAILY_SEED) ? <button className="resetButton" onClick={ () => reset() }>Try again?</button> : null}
      {(gameOver && gameMode == GameModeEnum.DAILY_SEED) ? <h2>You completed the daily!<br/> Come back tomorrow!</h2> : null}
      <div key="keyboard" className="keyboard">
        <FormatKeymap keymap={keymap} letterClickFunction={addCharacterToGuess} />
      </div>
      <div key="note" className="note">
        <span>{gameOver ? "" : "There are " + possibleWords.length + " words remaining!"}</span>
      </div>
    </div>
  );
}

export default Game
