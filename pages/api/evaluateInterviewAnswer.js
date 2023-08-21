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

  if(!req.body.questions) {
    res.status(400).json({
      error: {
        message: "Invalid request",
      }
    })
    return;
  }

  const questionObj = req.body.questions[req.body.evalIndex]
  const messages = [
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
                "example": ""
            }
          """
          
          Where:
            rating: Numeric (integer) evaluation of the answer where 1=entirely inappropriate or ineffective answer and 10=phenomenal response and extraordinarily effective
            strengths: 1-3 brief, concise sentence fragments demonstrating what was effective about the candidate's answer spoken directly to the candidate and referring to them as "you" and "your"
            weaknesses: 1-3 brief, concise sentence fragments demonstrating what was ineffective about the candidate's answer spoken directly to the candidate and referring to them as "you" and "your"
            example: A blank string
        `},
    {role: 'user', content: generatePrompt(questionObj)},
  ]
  // console.log(messages)
  try {
    const completion = await openai.chat.completions.create({
      messages,
      // https://platform.openai.com/docs/models/overview
      model: 'gpt-3.5-turbo',
      // model: 'gpt-4-0613',
      temperature: 1,
    });
    const rawStr = completion.choices[0].message.content
    try {
      res.status(200).json({ result: JSON.parse(rawStr)});
    }catch (e) {
      console.error(rawStr)
      res.status(500).json(e);
    }
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(questionObj) {
  const jobTitle = questionObj.jobTitle || '';
  const jobDesc = questionObj.jobDesc || '';
  const question = questionObj.question;
  const interviewAnswer = questionObj.answer
  const prompt = `
    Job Title: """${jobTitle}"""
    Job Description (optional): """${jobDesc}"""
    Interview Question: """${question}"""
    Job Candidate's Answer to the question: """${interviewAnswer}"""
  `
  // console.log(prompt)
  return prompt
}
