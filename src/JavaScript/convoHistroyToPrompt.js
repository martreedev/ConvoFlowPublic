function convoHistroy() {
    let existingArray = JSON.parse(localStorage.getItem("conversation-data")) || [];
    let arr;
    if (existingArray.length > 4) {
        arr = existingArray.slice(-4);
    } else {
        arr = existingArray;
    }
    // convert to prompt
    let newString = "";
    for (let i = 0; i < arr.length; i++) {
        const person = arr[i][0]
        const message = arr[i][1]
        const complete = `"${person}: ${message}"`
        newString += complete
    }
    const newPrompt = `You are an AI conversation bot designed to help users practice their 
                        conversation abilities.if the humans asks any personal questions use 
                        fictional data instead. Encourage users to engage in diverse and meaningful 
                        conversations.Limit your response to a few sentences.this is the history of 
                        the conversation, it is your turn: ${newString}`
    return newPrompt
}
export default convoHistroy