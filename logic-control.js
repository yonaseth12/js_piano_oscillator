const audioContext = new AudioContext()

const piano_notes = [
    { note: "C4", key: "Tab", frequency: 261.63 },
    { note: "C-SH4", key: "1", frequency: 277.18 },
    { note: "D4", key: "Q", frequency: 293.66 },
    { note: "D-SH4", key: "2", frequency: 311.13 },
    { note: "E4", key: "W", frequency: 329.63 },
    { note: "F4", key: "E", frequency: 349.23 },
    { note: "F-SH4", key: "4", frequency: 369.99 },
    { note: "G4", key: "R", frequency: 392.00 },
    { note: "G-SH4", key: "5", frequency: 415.30 },
    { note: "A4", key: "T", frequency: 440.00 },
    { note: "A-SH4", key: "6", frequency: 466.16 },
    { note: "B4", key: "Y", frequency: 493.88 },
  
    { note: "C5", key: "U", frequency: 523.25 },
    { note: "C-SH5", key: "8", frequency: 554.37 },
    { note: "D5", key: "I", frequency: 587.33 },
    { note: "D-SH5", key: "9", frequency: 622.25 },
    { note: "E5", key: "O", frequency: 659.25 },
    { note: "F5", key: "P", frequency: 698.46 },
    { note: "F-SH5", key: "-", frequency: 739.99 },
    { note: "G5", key: "[", frequency: 783.99 },
    { note: "G-SH5", key: "=", frequency: 830.61 },
    { note: "A5", key: "]", frequency: 880.00 },
    { note: "A-SH5", key: "Backspace", frequency: 932.33 },
    { note: "B5", key: "\\", frequency: 987.77 },
  
    { note: "C6", key: "Z", frequency: 1046.50 },
    { note: "C-SH6", key: "S", frequency: 1108.73 },
    { note: "D6", key: "X", frequency: 1174.66 },
    { note: "D-SH6", key: "D", frequency: 1244.51 },
    { note: "E6", key: "C", frequency: 1318.51 },
    { note: "F6", key: "V", frequency: 1396.91 },
    { note: "F-SH6", key: "G", frequency: 1479.98 },
    { note: "G6", key: "B", frequency: 1567.98 },
    { note: "G-SH6", key: "H", frequency: 1661.22 },
    { note: "A6", key: "N", frequency: 1760.00 },
    { note: "A-SH6", key: "J", frequency: 1864.66 },
    { note: "B6", key: "M", frequency: 1975.53 },
  
    { note: "C7", key: ",", frequency: 2093.00 }
  ];


//Initializing all notes as inactive at start (Active = It is playing)
piano_notes.forEach(eachNote => {
    eachNote.active = false;
})

//General Piano gain(volume) level tracker
let gainFactor;
//General Piano Oscillator type
let oscillatorType = "sine";

//Key Press Handler
document.addEventListener("keydown", e => {
    e.preventDefault()            //Avoids default action of the Tab and Backspace
    if(e.repeat) return ;         //Skipping if the key is a repeat (if it is held down).
    const pressed_key = e.key
    const noteDetail = keyToNoteMapper(pressed_key)
    if(!noteDetail) return ;        //Interrupting if keys not in the list are pressed
    
    noteDetail.active = true;       //This note is playing
    // startNote(noteDetail)        //controller will start it with correct gain value
    changeController()

})

//Key Release Handler
document.addEventListener("keyup", e => {
    const released_key = e.key
    const noteDetail = keyToNoteMapper(released_key)
    if(!noteDetail) return ;        //Do nothing if key does not represent a note

    noteDetail.active = false;      //Notify that the note is not playing
    stopNote(noteDetail)
    changeController()              //Gain value should be adjusted for the rest of notes playing
})

//Key to Note Mapping
function keyToNoteMapper(pressedKey) {
    let selected_note = piano_notes.find(eachNote => eachNote.key === capitalize(pressedKey))
    if (selected_note){
        return selected_note
    } else return null 
}

//Capitalize any String of letters
function capitalize(word){
    if(!word) return word           //If word is empty, return itself
    return word[0].toUpperCase() + word.slice(1)          //It works for even a single character word (the second slice will be empty string in this case)
}


//General Piano Controller, run at every press and release of keys
function changeController() {
    //Piano gain value adjuster
    let activeNumberOfNotes = piano_notes.reduce((count, note) => {
        if(note.active) ++count
        return count
    }, 0);
    gainFactor = 1 / activeNumberOfNotes;

    //Stopping and Starting Every note playing with the correct(new) gain level
    piano_notes.forEach((noteDetail) => {
        if(noteDetail.active){stopNote(noteDetail)}
    })
    piano_notes.forEach( noteDetail => {
        if(noteDetail.active){startNote(noteDetail)}
    }) 
    
    //Key color Handler
    piano_notes.forEach(eachNote => {
        const noteElements = document.querySelectorAll(`div.key`)
        piano_notes.forEach((noteDetail, index) => {
            if(noteDetail.active){                          //Active keys color handler
                if(noteElements[index].classList.contains('white')){
                    noteElements[index].style.backgroundColor = "#D3D3D3"}
                else if(noteElements[index].classList.contains('black')){
                    noteElements[index].style.backgroundColor = "#393939"}
            }
            else{                                           //Inactive keys color handler
                if(noteElements[index].classList.contains('white')){
                    noteElements[index].style.backgroundColor = "white"}
                else if(noteElements[index].classList.contains('black')){
                    noteElements[index].style.backgroundColor = "black"}
            }
        })
    })
}

//Starts playing note at key press
function startNote(noteDetail) {
    //Creating gain (to adjust volume level)
    const gainNode = audioContext.createGain()                  //Gain is used to control volume when more than one keys are pressed (to make total volume level constant)
    gainNode.gain.value = gainFactor
    //Creating Oscillator
    const oscillator = audioContext.createOscillator()          //Oscillator is created for every note at everyplay(key press). 
    oscillator.frequency.value = noteDetail.frequency
    oscillator.type = oscillatorType
    oscillator.connect(gainNode).connect(audioContext.destination)  //Connecting to our default output (Main Speaker)  (The gain part is only volumne adjuster, nothing to do with output speaker selection)
    oscillator.start()                                          //Note starts playing
    noteDetail.oscillator = oscillator                          //Adding the oscillator on our original note object (It is possible because objects are passed by reference)
                                                                //If oscillator already exist, previous oscillator is replaced.
}

//Stops playing note at key release
function stopNote(noteDetail) { 
    if(noteDetail.oscillator) {
        noteDetail.oscillator.stop()        //Note stops playing
        noteDetail.oscillator.disconnect()  //Disconnect from our Audio Context 
    }
    //We do not need to delete the oscillator object everytime we stop. Why? They will be replaced by new oscillator when the note is played again.
}
  