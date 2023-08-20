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
  const question = req.body.question || '';
  // const question = 'Can you provide an example of a complex technical challenge your team faced in a previous role, and how you led them to a successful solution?';
  const interviewAnswer = req.body.interviewAnswer || '';
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
        {role: 'system', content: `
          You are conducting a job interview and asking a candidate interview 
          questions to evaluate how well suited they are for the job.  You will be provided 
          with a job title, an optional job description, the question that was asked, and
          the job candidate's answer.  Your answer should be in the following JSON format:
          """
            {
                "rating": 5,
                "strengths": [
                  "Good stuff",
                  "Concise",
                  "Well thought out"
                ],
                "weaknesses": [
                  "Needs more detail",
                  "Don't repeat yourself",
                  "Didn't address the question"
                ],
                "example": " early in my career as a manager I had to iOS engineers who were at fogger heads they disagreed about virtually everything and ended up really not liking each other my background is not an iOS my back on this as a backend engineer and so it was very challenging for me to mediate that"
            }
          """
          
          Where:
            rating: Numeric (integer) evaluation of the answer where 1=entirely inappropriate or ineffective answer and 10=phenomenal response and extraordinarily effective
            strengths: 1-3 brief, concise sentence fragments demonstrating what was effective about the candidate's answer spoken directly to the candidate and referring to them as "you" and "your"
            weaknesses: 1-3 brief, concise sentence fragments demonstrating what was ineffective about the candidate's answer spoken directly to the candidate and referring to them as "you" and "your"
            example: An example of a highly effective answer to the interview question
        `},
        {role: 'user', content: generatePrompt(jobTitle, jobDesc, question, interviewAnswer)},
      ],
      model: 'gpt-3.5-turbo',
      temperature: 1,
    });
    const rawStr = completion.choices[0].message.content
    try {
      res.status(200).json({ result: JSON.parse(rawStr)});
    }catch (e) {
      console.error(rawStr)
    }
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

function generatePrompt(jobTitle, jobDesc, question, interviewAnswer) {
  const prompt = `
    Job Title: """${jobTitle}"""
    Job Description (optional): """${jobDesc}"""
    Interview Question: """${question}"""
    Job Candidate's Answer to the question: """${interviewAnswer}"""
  `
  // console.log(prompt)
  return prompt
}
