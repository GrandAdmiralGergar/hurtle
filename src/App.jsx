import { useState, useEffect, useRef } from 'react'
import './App.css'
import allWords from './data/words_alpha_five.json'
import allPatterns from './data/allPatterns.json'
import defaultKeymap from './data/defaultKeymap.json'
import defaultKeyPositions from './data/defaultKeyPositions.json'
import GuessEnum from './guessEnum'


function colorFunction(patternCode) {
  switch(patternCode) {
    case GuessEnum.CORRECT:
      return "green";
    case GuessEnum.PLACE:
      return "yellow";
    case GuessEnum.WRONG:
      return "gainsboro";
    case GuessEnum.UNUSED:
      return "gray";
  }
  return "black";
}

function FormatGuess({ submittedGuess, pattern }) {
  // Turns a guess text string and the results pattern into something more colorful and actionable
  const spans = [];

  for (let index = 0; index < submittedGuess.length; ++index){
    spans.push(
      <span key={submittedGuess + index} style={{ backgroundColor:colorFunction(parseInt(pattern[index])) }}>
        {submittedGuess[index]}
      </span>
    )
  }

  return (
    <div>{spans}</div>
  );
}

/**
 * 
 * @param {keymap} keymap 
 */
function FormatKeymap({keymap, letterClickFunction}) {

  const rowSpans = [];

  for(let row=0; row<defaultKeyPositions.length; ++row)
  {
    const buttons = []
    for(let letter = 0; letter < defaultKeyPositions[row].length; ++letter) {
      buttons.push(
        <button key={defaultKeyPositions[row][letter]} onClick={() => letterClickFunction(defaultKeyPositions[row][letter])} style={{ backgroundColor:colorFunction(keymap[defaultKeyPositions[row][letter]])}}>
          {defaultKeyPositions[row][letter]}
        </button>
      )
    }
    rowSpans.push(<div key={row}>{buttons}</div>);
  }

  console.log(rowSpans);
  return (
    <div>{rowSpans}</div>
  );
}

function App() {
  // State for game
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState([]);
  const [possibleWords, setPossibleWords] = useState(allWords); // Assume you have a list of possible words
//  const [triedInvalidWord, setTriedInvalidWord] = useState(false);
//  const [guessIsValidWord, setGuessIsValidWord] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [keymap, setKeymap] = useState(defaultKeymap); 

  const guessRef = useRef(guess);
  const possibleWordsRef = useRef(possibleWords);

  // Keeps the guessRef up to date when guess changes
  useEffect(() => {
    guessRef.current = guess;
 //   setGuessIsValidWord(guessRef.current.length === 5 && allWords.includes(guessRef.current));
    console.log("Guess changed to: " + guess);
  }, [guess]);

  // Keeps the possibleWordsRef up to date when possibleWords set changes
  useEffect(() => {
    possibleWordsRef.current = possibleWords;
  }, [possibleWords]);

  // Builds the event listener for all keypresses in window
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log("key pressed: " + event.key);
      
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

  /**
   * 
   * @returns True if the guess is a valid word (correct number of characters and in the word list)
   */
  const isGuessValidWord = () => {
    // The length check is to avoid the more computationally expensive 'includes' function
    const result = (guess.length === 5 && allWords.includes(guess));
    console.log("Is guess valid word result: " + result);

    return result;
  }

  // Function to handle guess submission
  const handleSubmit = () => {
    const submittedGuess = guessRef.current;
    console.log("Current submitted guess in handle submit: " + submittedGuess);
    
    // Assuming 5-letter words
    if (submittedGuess.trim().length === 5 && allWords.includes(submittedGuess)) { 
      const result = filterPossibleWordsWithPattern(submittedGuess, possibleWordsRef.current);

      const effectivePattern = result.pattern;

      setHistory((prev) => [...prev, { submittedGuess, effectivePattern }]);

      console.log("Largest remaining pattern was: " + result.pattern + " with " + result.remainingWords.length + " words remaining");

      setPossibleWords(result.remainingWords);

      updateKeymap(submittedGuess, effectivePattern);

      if (effectivePattern == [GuessEnum.CORRECT, GuessEnum.CORRECT, GuessEnum.CORRECT, GuessEnum.CORRECT, GuessEnum.CORRECT].join("")) {
        setGameOver(true);
      }

      setGuess('');
    } 
    else {
      console.log("REJECTED!");
    }
  };

  const filterPossibleWordsWithPattern = (submittedGuess, remainingWords) => {
    // Implement a function to eliminate words based on feedback, but also return the feedback pattern


    // Brute force every possible feedback and filter down remaining words into sets
    // Then we select the feedback that has the most words remaining, which becomes the new 'remainingWords'
    const allPatternStrings = allPatterns;
    const patternsMap = new Map();

    for (let i = 0; i < allPatternStrings.length; ++i){
      patternsMap.set(allPatternStrings[i], []);
    }

    for (let i = 0; i < remainingWords.length; ++i){
      const determinedPattern = generatePatternDifferential(remainingWords[i], submittedGuess);

      // console.log(determinedPattern);

      // Add the word to the correct set
      // NOTE: using push intentionally for optimization, screw you internet!
      patternsMap.get(determinedPattern).push(remainingWords[i]);
    }

    let largestFoundKey = null;
    let largestValue = 0;
    
    // Determine the set with the most words remaining and return that set of words
    for (const [key,value] of patternsMap.entries()){
      if(value.length > largestValue) {
        largestFoundKey = key;
        largestValue = value.length;
      }
    }
    return {
      pattern: largestFoundKey, 
      remainingWords: patternsMap.get(largestFoundKey)
    };
  };

  const generatePatternDifferential = (word, submittedGuess) => {
    // Generates a pattern array based on how the guess compares to the word
    submittedGuess = submittedGuess.toUpperCase();
    word = word.toUpperCase();

    // console.log("Word : " + word);
    // console.log("Guess: " + submittedGuess);
    
    let patternArray = [GuessEnum.WRONG, GuessEnum.WRONG, GuessEnum.WRONG, GuessEnum.WRONG, GuessEnum.WRONG]
    let wordArray = word.split("")
    let guessArray = submittedGuess.split("")

    // Find all the 'correct' items between the word and guess
    for(let i = 0; i < wordArray.length; ++i) {
      if(wordArray[i] == guessArray[i]) {
        patternArray[i] = GuessEnum.CORRECT;
        
        // Clear the letter from the word array so we don't accidentally count it later
        wordArray[i] = "!";
      }
    }

    // Find the 'right answer wrong places'
    for(let i = 0; i < wordArray.length; ++i){
      if(patternArray[i] != GuessEnum.CORRECT) {
        let index = wordArray.indexOf(guessArray[i]);
        if(index > -1) {
          patternArray[i] = GuessEnum.PLACE;

          // Clear the letter from the word array so we don't accidentally count it later
          wordArray[index] = "!"
        }
      }
    }

    return patternArray.join("");
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
    <div className="App">
      <h1>Hurtle</h1>
      {gameOver ? <p>Game Over! You’ve narrowed it down!</p> : null}
      
      <div className="board">
        {history.map((entry) => (
          <FormatGuess submittedGuess={entry.submittedGuess} pattern={entry.effectivePattern} />
        ))}
      </div>
      <div className="activeInput">
        <span key="activeInput" style={{ backgroundColor: (isGuessValidWord() == false && guess.length == 5) ? "red" : "" }}>
          { guess.length == 5 ? guess : (guess + "_").padEnd(5) }
        </span>
      </div>
      <div className="keyboard">
        <FormatKeymap keymap={keymap} letterClickFunction={addCharacterToGuess} />
      </div>
      <div className="note">
        <span>{gameOver ? "" : "There are " + possibleWords.length + " words remaining!"}</span>
      </div>
    </div>
  );
}

export default App
