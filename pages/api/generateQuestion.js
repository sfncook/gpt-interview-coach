import { OpenAI } from "openai";

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
}
const openai = new OpenAI({
  apiKey: configuration.apiKey,
});

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const jobTitle = req.body.jobTitle || '';
  const jobDesc = req.body.jobDesc || '';

  const messages = generateMessages(jobTitle, jobDesc, req.body.questions)
  // console.log(messages)
  try {
    const completion = await openai.chat.completions.create({
      messages,
      // https://platform.openai.com/docs/models/overview
      model: 'gpt-3.5-turbo',
      // model: 'gpt-4-0613',
      temperature: 1.25,
    });
    // console.log(completion.choices[0].message.content)
    res.status(200).json({ result: completion.choices[0].message.content });
    // res.status(200).json({ result: 'Can you provide an example of a complex technical challenge your team faced in a previous role, and how you led them to a successful solution?' });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generateMessages(jobTitle, jobDesc, questions) {
  const messages = [
    {role: 'system', content: 'You are conducting a job interview.  The user is a job candidate.  You will ask them one interview question.'},
    {role: 'user', content: generateInitialPrompt(jobTitle, jobDesc)},
  ]
  questions.forEach(questionObj=>{
    messages.push({role: 'assistant', content: questionObj.question})
  })
  messages.push({role: 'user', content: generateFollorUpPrompt()})
  return messages
}

function generateInitialPrompt(jobTitle, jobDesc) {
  let prompt = `Ask a single interview question for a job with the title: "${jobTitle}"`
  if(jobDesc) {
    prompt = prompt + ` and the following description:
      """
      ${jobDesc}
      """
    `
  }
  // console.log(prompt)
  return prompt
}

function generateFollorUpPrompt() {
  const questionPrompts = [
    'Ask the candidate another question',
    'Ask the candidate a technical question that deep-dives into one of the tools or languages the job requires',
    'Ask the candidate a behavioral question that delves into interpersonal interactions with their coworkers',
    'Ask the candidate a question about leadership or initiative required for this role',
    'Ask the candidate to describe a project or task they have worked on',
  ]
  const prompt = questionPrompts[Math.floor(Math.random()*questionPrompts.length)];
  console.log(prompt)
  return prompt
}
