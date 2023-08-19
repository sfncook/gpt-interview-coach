import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [jobDescInput, setJobDescInput] = useState("");
  const [questionResult, setQuestionResult] = useState("");
  const [interviewAnswerInput, setInterviewAnswerInput] = useState("");
  const [interviewAnswerEvaluationResult, setInterviewAnswerEvaluationResult] = useState("");
  // const initValue = (typeof window !== "undefined") ? localStorage.getItem('manyQuestions') : 0
  const [manyQuestions, setManyQuestions] = useState(0);

  async function onSubmit(event) {
    setManyQuestions(manyQuestions+1)
    setInterviewAnswerInput('')
    setInterviewAnswerEvaluationResult('')
    event.preventDefault();
    try {
      const response = await fetch("/api/generateQuestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobTitle: jobTitleInput, jobDesc: jobDescInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setQuestionResult(data.result);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onSubmitInterviewAnswer(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/evaluateInterviewAnswer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: jobTitleInput,
          jobDesc: jobDescInput,
          question: questionResult,
          interviewAnswer: interviewAnswerInput
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setInterviewAnswerEvaluationResult(data.result);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  const submitTxt = (questionResult) ? "Next question" : "Generate a sample interview question"
  let interviewAnswerEl = (questionResult) ?
    <form onSubmit={onSubmitInterviewAnswer}>
      <textarea
        name="interviewAnswer"
        placeholder="Enter your response"
        value={interviewAnswerInput}
        onChange={(e) => setInterviewAnswerInput(e.target.value)}
      />
      <input type="submit" value="Submit your answer for evaluation" />
    </form>
    : <span/>

  const manyQuestionsStr = `Please consider donating $${manyQuestions*0.01} to my Venmo to help pay for the ChatGPT costs`

  return (
    <div>
      <Head>
        <title>Interview Question Analyzer</title>
      </Head>

      <main className={styles.main}>
        <a href="Shawn-Cook-1.html"><div className={styles.result}>{manyQuestionsStr}</div></a>
        <h3>Interview Coach</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="jobTitle"
            placeholder="Enter a job title"
            value={jobTitleInput}
            onChange={(e) => setJobTitleInput(e.target.value)}
          />
          <textarea
            name="jobDesc"
            placeholder="Enter a job description"
            value={jobDescInput}
            onChange={(e) => setJobDescInput(e.target.value)}
          />
          <input type="submit" value={submitTxt} />
        </form>
        <div className={styles.result}>{questionResult}</div>
        {interviewAnswerEl}
        <div className={styles.result}>{interviewAnswerEvaluationResult}</div>
      </main>
    </div>
  );
}
