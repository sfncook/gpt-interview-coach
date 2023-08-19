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
  if (jobTitle.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid job title",
      }
    });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {role: 'system', content: 'You are conducting a job interview and asking a candidate interview questions to evaluate how well suited they are for the job'},
        {role: 'user', content: generatePrompt(jobTitle, jobDesc)},
      ],
      model: 'gpt-3.5-turbo',
      temperature: 1,
    });
    // console.log(completion.choices[0].message.content)
    res.status(200).json({ result: completion.choices[0].message.content });
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

function generatePrompt(jobTitle, jobDesc) {
  let prompt = `Ask an interview question for a job with the title: "${jobTitle}"`
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
