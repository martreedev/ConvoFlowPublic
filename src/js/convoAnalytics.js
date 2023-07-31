import UseGpt from "../hooks/UseGPT.js";

async function getAnalytics() {
    let data = "some data"
    let existingArray = JSON.parse(localStorage.getItem("conversation-data")) || [];
    let newString = "";
    for (let i = 0; i < existingArray.length; i++) {
        const person = existingArray[i][0]
        const message = existingArray[i][1]
        if (person !== "AI") {
            const complete = `"${person}: ${message}"`
            newString += complete
        }
    }
    const newPrompt = `You are an AI conversation bot designed to help users practice their conversation abilities. I will provide you with a conversation between a human and an AI. Please evaluate the human's conversation abilities using the following metrics:Use of Language: Assess the user's vocabulary, grammar, and overall language proficiency in expressing themselves effectively.
Adaptability: Assess how well the user adapts their communication style and tone based on the context and the preferences of their conversation partner(s).
Relevance: Measure the extent to which the user stays on-topic and responds appropriately to the conversation's context.
Engagement: Measure the user's ability to keep the conversation engaging and interesting.
Initiative: Observe whether the user takes the initiative to ask questions, share ideas, or move the conversation forward actively.
Please give each category a score from 0 to 100. Format your response like this 'Use of Language: 0, Adaptability: 0, Relevance: 0, Engagement: 0, Initiative: 0'. here is the convo: ${newString}`
    const ng = UseGpt(newPrompt).then((res) => {
        res = res.replace(/(\r\n|\n|\r)/gm, " ");
        res = res.replace(/^\?/, '');
        res = res.trimStart();
        const skillArray = res.split(', ');
        const result = skillArray.map(function (skill) {
            const parts = skill.split(': ');
            return {
                name: parts[0],
                data: Number(parts[1])
            };
        });

        data = result
        return data
    })
    return ng
}
export default getAnalytics