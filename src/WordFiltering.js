import allPatterns from './data/allPatterns.json'
import GuessEnum from './GuessEnum'

/**
 * Eliminates words based on feedback
 * @param {string} submittedGuess 
 * @param {Array[string]} remainingWords 
 * @returns the new set of remaining words, and the feedback that led to that set being chosen
 */
export function determingPatternWithMostRemainingWords(submittedGuess, remainingWords) {
    // Brute force every possible feedback and filter down remaining words into sets
    // Then we select the feedback that has the most words remaining, which becomes the new 'remainingWords'
    const allPatternStrings = allPatterns;
    const patternsMap = new Map();

    for (let i = 0; i < allPatternStrings.length; ++i){
        patternsMap.set(allPatternStrings[i], []);
    }

    for (let i = 0; i < remainingWords.length; ++i){
        const determinedPattern = generatePatternDifferential(remainingWords[i], submittedGuess);

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

/**
 * Given a known guess word and pattern, filter a list of words down to those that match and return
 * 
 * @param {String} guess the incoming word to filter by
 * @param {String} pattern the pattern to match against and filter by
 * @param {Array[String]} remainingWords words to consider
 * @returns an array of the subset of remainingWords that matches the guess and pattern
 */
export function filterPossibleWordsByPattern(guess, pattern, remainingWords) {
    let matchingWords = [];
    for (let i = 0; i < remainingWords.length; ++i) {
        if(pattern == generatePatternDifferential(remainingWords[i], guess))
        {
            matchingWords.push(remainingWords[i]);
        }
    }
    return matchingWords;
}

/**
 * Determines what the pattern should be when we compare a 'guess' to a target word
 * @param {String} word the word we are building a pattern against
 * @param {String} submittedGuess the word we want to build a pattern for
 * @returns a pattern string consisting of GuessEnum values as characters
 */
export function generatePatternDifferential(word, submittedGuess) {
    // Generates a pattern array based on how the guess compares to the word
    submittedGuess = submittedGuess.toUpperCase();
    word = word.toUpperCase();
    
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
