const voiceID = "EXAVITQu4vr4xnSDxMaL" // only one voice id for now (demo)
const apiKey = process.env.REACT_APP_ELEVENLABS_KEY
const stability = 0.75
const similarity = 0.75

//function for handling text to speech with eleven labs
const handleTextToSpeech = async (textin) => {
    textin = textin.replace("AI: ", "");// parse prefix out of string
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}/stream`; //url to api call
    const headers = {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
    };

    const data = {
        text: textin,
        voice_settings: {
            stability: Number(stability), // this number is a percentage so must be less than 1
            similarity_boost: Number(similarity),
        },
    };

    const response = await fetch(url, {
        // response is the return data of the fetch
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    if (response.ok) {
        // if the response is okay
        const audioBlob = await response.blob(); // raw audio data

        const blob = new Blob([audioBlob], { type: "audio/mp3" }); //create blob object with returned audio
        const audioUrl = URL.createObjectURL(blob); // create object url with return blob
        return audioUrl //return the audio url object
    } else {
        console.log(response);

    }
};

export default handleTextToSpeech