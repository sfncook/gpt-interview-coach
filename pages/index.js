import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./index.module.css";
import Response from "../components/response.js";
import Question from "../components/question.js";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [jobDescInput, setJobDescInput] = useState("");
  const [questionResult, setQuestionResult] = useState("");
  const [interviewAnswerInput, setInterviewAnswerInput] = useState("");
  const [interviewAnswerEvaluationResult, setInterviewAnswerEvaluationResult] = useState("");
  // const initValue = (typeof window !== "undefined") ? localStorage.getItem('manyQuestions') : 0
  const [manyQuestions, _setManyQuestions] = useState(0);
  const [showVenmo, setShowVenmo] = useState(false);
  const [questions, _setQuestions] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      setManyQuestions(localStorage.getItem('manyQuestions')||0)
      setJobTitle(localStorage.getItem('jobTitle')||'')
      setJobDesc(localStorage.getItem('jobDesc')||'')
      const prevQuestions = JSON.parse(localStorage.getItem("questions")) || []
      _setQuestions(prevQuestions)
    }
  }, []);

  function setJobTitle(jobTitle) {
    // console.log(_manyQuestions)
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("jobTitle", jobTitle)
      setJobTitleInput(jobTitle)
    }
  }

  function setJobDesc(jobDesc) {
    // console.log(_manyQuestions)
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("jobDesc", jobDesc)
      setJobDescInput(jobDesc)
    }
  }

  function setManyQuestions(_manyQuestions) {
    // console.log(_manyQuestions)
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("manyQuestions", parseInt(_manyQuestions))
      _setManyQuestions(parseInt(_manyQuestions))
    }
  }

  function addQuestion(question) {
    if (typeof window !== "undefined" && window.localStorage) {
      const prevQuestions = JSON.parse(localStorage.getItem("questions")) || []
      const newQuestions = [...prevQuestions, question];
      setQuestions(newQuestions)
    }
  }
  function setQuestions(questions) {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("questions", JSON.stringify(questions))
      _setQuestions(questions)
    }
  }
  function updateQuestionWithAnswer(index, answer) {
    if (typeof window !== "undefined" && window.localStorage) {
      questions[index].answer = answer
      setQuestions(questions)
    }
  }
  function updateQuestionWithEval(index, evaluation) {
    if (typeof window !== "undefined" && window.localStorage) {
      questions[index].evaluation = evaluation
      setQuestions(questions)
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
        body: JSON.stringify({
          questions,
          jobTitle: jobTitleInput,
          jobDesc: jobDescInput
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      // setQuestionResult(data.result);
      addQuestion({
        index: questions.length,
        question:data.result,
        jobTitle: jobTitleInput,
        jobDesc: jobDescInput,
      })
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
    updateQuestionWithAnswer(questions.length-1, interviewAnswerInput)
    try {
      const response = await fetch("/api/evaluateInterviewAnswer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions,
          evalIndex: questions.length-1
        }),
      });

      const data = await response.json();
      // console.log(data)
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setInterviewAnswerEvaluationResult(data.result);
      updateQuestionWithEval(questions.length-1, data.result)
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false)
    }
  }


  async function onMouseOverPayment(event) {
    event.preventDefault();
    setShowVenmo(true)
  }

  async function onMouseOutPayment(event) {
    event.preventDefault();
    setShowVenmo(false)
  }

  function resetQuestions(event) {
    event.preventDefault();
    if (typeof window !== "undefined" && window.localStorage) {
      if (window.confirm("Are you sure you want to delete all questions?  This will erase them all including your scores and feedback")) {
        localStorage.removeItem('questions')
        window.location.reload()
      }
    }
  }

  const answerSubmitTxt = (interviewAnswerInput) ? "Reevaluate your answer" : "Evaluate your answer"
  const answerSubmitOrLoader = (isLoading) ?
    <div className={styles.loader}></div> :
    <input type="submit" value={answerSubmitTxt} />
  let interviewAnswerEl = (questions.length) ?
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

  const manyQuestionsStr = `Please consider donating $${manyQuestions*0.01} to my Venmo to help pay for the ChatGPT costs`

  const paymentEl = (manyQuestions>0) ? <div>
    <div className={styles.payment} onMouseOver={onMouseOverPayment} onMouseLeave={onMouseOutPayment}>{manyQuestionsStr}</div>
    <img src="/venmo.png" className={styles.venmo} hidden={!showVenmo} />
  </div> : <span/>

  const jobSubmitTxt = (questions.length) ? "Next question" : "Generate a sample interview question"
  const jobSubmitOrLoader = (isLoading) ?
    <div className={styles.loader}></div> :
    <input type="submit" value={jobSubmitTxt}/>

  return (
    <div>
      <Head>
        <title>Interview Question Analyzer</title>
      </Head>
      <main className={styles.main}>
        {paymentEl}
        <h3>Interview Coach</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="jobTitle"
            placeholder="Enter a job title"
            value={jobTitleInput}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <textarea
            name="jobDesc"
            placeholder="Enter a job description"
            value={jobDescInput}
            onChange={(e) => setJobDesc(e.target.value)}
          />
          {questions.map((q,i)=><Question key={i} question={q} isLastQuestion={i===questions.length-1}/> )}
          {jobSubmitOrLoader}
          {
            (questions.length && !isLoading) ? <input type="button" value='RESET/DELETE ALL QUESTIONS' onClick={resetQuestions} /> : <span/>
          }
        </form>
        {interviewAnswerEl}
        <Response
          rating={interviewAnswerEvaluationResult.rating}
          strengths={interviewAnswerEvaluationResult.strengths}
          weaknesses={interviewAnswerEvaluationResult.weaknesses}
          example={interviewAnswerEvaluationResult.example}
        />
      </main>
    </div>
  );
}
