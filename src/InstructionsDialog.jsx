
import './InstructionsDialog.css'

function InstructionsDialog({closeFunction}) {

    return(
        <div className='overlay'>
            <div className="instructions">
                <h2>This is Hurtle!</h2>
                <p>It's like that other game, with some key exceptions:</p>
                <ul>
                    <li>You have unlimited guesses</li>
                    <li>There is no single, predetermined answer</li>
                    <li>The word bank is <b>considerably</b> broader</li>
                </ul>
                <p>You must strategically narrow down the word bank to a single word and guess it to win</p>
                <button onClick={() => closeFunction()}>I am ready for the hurt!</button>
            </div>
        </div>
    );
};

export default InstructionsDialog