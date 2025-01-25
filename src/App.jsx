import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import allWords from './data/words_alpha_five.json'
import allPatterns from './data/allPatterns.json'
import GuessEnum from './guessEnum'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

function App() {
  // State for game
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState([]);
  const [possibleWords, setPossibleWords] = useState(allWords); // Assume you have a list of possible words
  const [gameOver, setGameOver] = useState(false);

  // Function to handle guess submission
  const handleSubmit = () => {
    // Assuming 5-letter words
    if (guess.trim().length === 5) { 
      const feedback = getFeedback(guess, possibleWords); // You'll implement this feedback function

      setHistory([...history, { guess, feedback }]);

      const result = filterPossibleWordsWithPattern(guess, possibleWords);
      
      console.log("Largest remaining pattern was: " + result.pattern + " with " + result.remainingWords.length + " words remaining");

      setPossibleWords(result.remainingWords);

      if (possibleWords.length === 1) {
        setGameOver(true);
      }

      setGuess('');
    }
  };

  const getFeedback = (guess, words) => {
    // Implement logic here to compare the guess with words
    // and return feedback such as 'correct', 'incorrect', etc.
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

      console.log(determinedPattern);
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

    console.log("Word : " + word);
    console.log("Guess: " + guess);
    
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


  return (
    <div className="App">
      <h1>Hurtle</h1>
      {gameOver ? <p>Game Over! You’ve narrowed it down!</p> : null}
      
      <div>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          maxLength={5}
        />
        <button onClick={handleSubmit}>Submit Guess</button>
      </div>
      
      <div className="board">
        {history.map((entry, index) => (
          <div key={index}>
            <span>{entry.guess}</span>
            <span>{entry.feedback}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App
