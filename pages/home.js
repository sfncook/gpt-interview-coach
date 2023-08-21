import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./index.module.css";
import Paypal from "../components/paypal.js";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [jobDescInput, setJobDescInput] = useState("");
  const [questionResult, setQuestionResult] = useState("");
  const [interviewAnswerInput, setInterviewAnswerInput] = useState("");
  const [interviewAnswerEvaluationResult, setInterviewAnswerEvaluationResult] = useState("");
  // const initValue = (typeof window !== "undefined") ? localStorage.getItem('manyQuestions') : 0
  const [manyQuestions, _setManyQuestions] = useState(0);
  const [questionObjs, setQuestionObjs] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      setManyQuestions(localStorage.getItem('manyQuestions')||0)
    }
  }, []);

  function setManyQuestions(_manyQuestions) {
    console.log(_manyQuestions)
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("manyQuestions", parseInt(_manyQuestions))
      _setManyQuestions(parseInt(_manyQuestions))
    }
  }

  async function onSubmit(event) {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmitInterviewAnswer(event) {
    setIsLoading(true)
    setManyQuestions(manyQuestions+1)
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
    } finally {
      setIsLoading(false)
    }
  }

  const answerSubmitTxt = (interviewAnswerInput) ? "Reevaluate your answer" : "Evaluate your answer"
  const answerSubmitOrLoader = (isLoading) ?
    <div className={styles.loader}></div> :
    <input type="submit" value={answerSubmitTxt} />
  let interviewAnswerEl = (questionResult) ?
    <form onSubmit={onSubmitInterviewAnswer}>
      <textarea
        name="interviewAnswer"
        placeholder="Enter your response"
        value={interviewAnswerInput}
        onChange={(e) => setInterviewAnswerInput(e.target.value)}
      />
      {answerSubmitOrLoader}
    </form>
    : <span/>

  const jobSubmitTxt = (questionResult) ? "Next question" : "Generate a sample interview question"
  const jobSubmitOrLoader = (isLoading) ?
    <div className={styles.loader}></div> :
    <input type="submit" value={jobSubmitTxt}/>

  return (
    <div>
      <Head>
        <title>Interview Question Analyzer</title>
      </Head>
      <menuAndMain className={styles.menuAndMain}></menuAndMain>
    </div>
  );
}
