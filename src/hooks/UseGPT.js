import { OpenAIApi, Configuration } from 'openai';
const key = process.env.REACT_APP_OPENAI_API_KEY
const configuration = new Configuration({
    apiKey: key,
});

const openai = new OpenAIApi(configuration);// create new open Ai config 
//function used for sending prompt to gpt and getting response
async function UseGpt(prompt) {
    try {
        const result = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,//send prompt
            temperature: 0.5,
            max_tokens: 500,
        });
        return result.data.choices[0].text//return response
    } catch (e) {//error handling
        console.log("Something is going wrong, Please try again.")
        console.log(e)
        return "somethingbad-error"
    }
};

export default UseGpt