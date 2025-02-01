
import './InstructionsDialog.css'
import './Dialog.css'

function InstructionsDialog({closeFunction}) {

    return(
        <div className='overlay'>
            <div className="dialogWindow">
                <h2>This is Hurtle!</h2>
                <p>It's like that other game, with some key exceptions:</p>
                <ul>
                    <li>You have unlimited guesses</li>
                    <li>There is no single, predetermined answer</li>
                    <li>The word bank is <b>considerably</b> broader</li>
                </ul>
                <p>You must strategically narrow down the word bank to a single word and guess it to win</p>
                <br/>
                <p>There are now three game modes: </p>
                <p><b>Daily</b> - the definitive Hurtle experience! Compete using the daily starting seed</p>
                <p><b>Free Play</b> - lets you try whatever you want in order to win</p>
                <p><b>Seeded</b> - forces you to start with a random word, to provide a fresh experience every time</p>
                <button onClick={() => closeFunction()}>I am ready for the hurt!</button>
            </div>
        </div>
    );
};

export default InstructionsDialog