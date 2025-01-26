import { useState } from 'react'
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

function FormatGuess({ guess, pattern }) {
  // Turns a guess text string and the results pattern into something more colorful and actionable
  const spans = [];

  for (let index = 0; index < guess.length; ++index){
    spans.push(
      <span key={guess + index} style={{ fontFamily: 'monospace', backgroundColor:colorFunction(parseInt(pattern[index])) }}>
        {guess[index]}
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
function FormatKeymap({keymap}) {
  //const keys = Object.keys(keymap);

  const rowSpans = [];

  console.log(defaultKeyPositions);
  console.log(keymap);

  for(let row=0; row<defaultKeyPositions.length; ++row)
  {
    const spans = []
    for(let letter = 0; letter < defaultKeyPositions[row].length; ++letter) {
      spans.push(
        <span key={defaultKeyPositions[row][letter]} style={{ fontFamily: 'monospace', backgroundColor:colorFunction(keymap[defaultKeyPositions[row][letter]])}}>
          {defaultKeyPositions[row][letter]}
        </span>
      )
    }
    rowSpans.push(<div key={row}>{spans}</div>);
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
  const [triedInvalidWord, setTriedInvalidWord] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [keymap, setKeymap] = useState(defaultKeymap); 

  // Function to handle guess submission
  const handleSubmit = () => {
    // Assuming 5-letter words
    if (guess.trim().length === 5 && allWords.includes(guess.toLowerCase())) { 
      setTriedInvalidWord(false);

      const result = filterPossibleWordsWithPattern(guess, possibleWords);

      const effectivePattern = result.pattern;

      setHistory([...history, { guess, effectivePattern }]);

      console.log("Largest remaining pattern was: " + result.pattern + " with " + result.remainingWords.length + " words remaining");

      setPossibleWords(result.remainingWords);

      updateKeymap(guess, effectivePattern);

      if (possibleWords.length === 1) {
        setGameOver(true);
      }

      setGuess('');
    }
    else {
      setTriedInvalidWord(true);
    }
  };

  const filterPossibleWordsWithPattern = (guess, remainingWords) => {
    // Implement a function to eliminate words based on feedback, but also return the feedback pattern


    // Brute force every possible feedback and filter down remaining words into sets
    // Then we select the feedback that has the most words remaining, which becomes the new 'remainingWords'
    const allPatternStrings = allPatterns;
    const patternsMap = new Map();

    for (let i = 0; i < allPatternStrings.length; ++i){
      patternsMap.set(allPatternStrings[i], []);
    }

    for (let i = 0; i < remainingWords.length; ++i){
      const determinedPattern = generatePatternDifferential(remainingWords[i], guess);

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

  const generatePatternDifferential = (word, guess) => {
    // Generates a pattern array based on how the guess compares to the word
    guess = guess.toLowerCase();

    //console.log("Word : " + word);
    //console.log("Guess: " + guess);
    
    let patternArray = [GuessEnum.WRONG, GuessEnum.WRONG, GuessEnum.WRONG, GuessEnum.WRONG, GuessEnum.WRONG]
    let wordArray = word.split("")
    let guessArray = guess.split("")

    // Find all the 'correct' items between the word and guess
    for(let i = 0; i < wordArray.length; ++i){
      if(wordArray[i] == guessArray[i]){
        patternArray[i] = GuessEnum.CORRECT;
        
        // Clear the letter from the word array so we don't accidentally count it later
        wordArray[i] = "!";
      }
    }

    // Find the 'right answer wrong places'
    for(let i = 0; i < wordArray.length; ++i){
      if(patternArray[i] != GuessEnum.CORRECT) {
        let index = wordArray.indexOf(guessArray[i])
        if(index > -1) {
          patternArray[i] = GuessEnum.PLACE;

          // Clear the letter from the word array so we don't accidentally count it later
          wordArray[index] = "!"
        }
      }
    }

    return patternArray.join("");
  }

  /**
   * Updates the keymap based on the most recent data
   * @param {string} guess the latest guess from the user
   * @param {string} pattern the effective pattern that was matched to the guess
   */
  const updateKeymap = (guess, pattern) => {

    for(let i = 0; i < guess.length; ++i){
      const newValue = parseInt(pattern[i]);

      if(keymap[guess[i].toUpperCase()] < newValue) {
        keymap[guess[i].toUpperCase()] = newValue;
      }
      
    }
  };

  return (
    <div className="App">
      <h1>Hurtle</h1>
      {gameOver ? <p>Game Over! You’ve narrowed it down!</p> : null}
      
      <div>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          maxLength={5}
        />
        <button onClick={handleSubmit}>{ triedInvalidWord ? "Try Again" : "Submit Guess" } </button>
      </div>
      
      <div className="board">
        {history.map((entry) => (
          <FormatGuess guess={entry.guess} pattern={entry.effectivePattern} />
        ))}
      </div>
      <div className="keyboard">
        <FormatKeymap keymap={keymap} />
      </div>
      <div className="note">
        <span>There are {possibleWords.length} words remaining!</span>
      </div>
    </div>
  );
}

export default App
