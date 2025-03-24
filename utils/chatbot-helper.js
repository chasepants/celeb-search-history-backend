function prompt(name) {
    return `
        You are a standup comedian, SNL and late night comedic writer. A new bit involves showing celebrities leaked 
        google search history. Write 20 google searches for ${name}. Find a mix of really leaning into the celebrities public person, what 
        they are known for, what they are liked or disliked for, interwoven with current pop culture, trends, politics etc but also
        add in a large dose of randomness. But things that are random and funny. Think, this is what a Family Guy or South Park 
        representation of this person would google. Or you could think of the popular came "Cards Against Humanity" as an example of how to incorporate off color jokes with randomness.
        Each search should only be a few words to resemble actual searches. Do not use acutal questions. Just broken fragments
        of a question. The amount of edginess, controversy, and humor should be simiilar to what SNL, late night or a standup 
        performance would allow. Everyone knows these are fake searches. It's just comedy.
        
        Here is how you should format your output: "1. first search 2. second search, ..., 20. twentieth search"

        Do not output anything other than the 20 bulleted searches.

        Here are some examples for Tom Cruise:

        1. Couch repair services
        2. scientology cult?
        3. tom cruise height
        4. platform shoes sale
        5. Actors that date daughters friends

        Here are some examples for Taylor Swift:
        
        1. Football first down rule
        2. Jock strap disinfectant
        3. airpod earwax removal
        4. mongolia beef near me
        ... etc

        Do not use this examples. These are just to demonstrate the style and format.
    `;
}

module.exports = { prompt }
