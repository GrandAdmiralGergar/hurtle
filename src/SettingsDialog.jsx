
import {useState} from "react";
import './SettingsDialog.css'
import './Dialog.css'

function SettingsDialog({settings, closeFunction}) {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: checked }));
    };

    return(
        <div className='overlay'>
            <div className='dialogWindow'>
                <h2>Settings</h2>
                <label>
                    <input type="checkbox" 
                     name="showPercents"
                     checked={localSettings.showPercents}
                     onChange={handleCheckboxChange} />
                    Display percent reduction (% of words removed by each guess)</label>
                <br/>
                <br/>
                <button onClick={() => closeFunction(localSettings)}>Close</button>
            </div>
        </div>
    );
};

export default SettingsDialog