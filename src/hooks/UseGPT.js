import { ChatGPTAPI } from 'chatgpt';
import { OpenAIApi, Configuration } from 'openai';
const key = process.env.REACT_APP_OPENAI_API_KEY
const configuration = new Configuration({
    apiKey: key,
});

const openai = new OpenAIApi(configuration);
async function UseGpt(prompt) {
    try {
        const result = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.5,
            max_tokens: 500,
        });
        return result.data.choices[0].text
    } catch (e) {
        console.log("Something is going wrong, Please try again.")
        console.log(e)
        return "somethingbad-error"
    }
};


export default UseGpt