import styles from "./index.module.css";

export default function Question({question}) {

  return (
    <div className={styles.question}>
      <div><b>Question #{question.index+1}</b></div>
      <div>{question.rating}</div>
      <div className={styles.questionStr}><i>{question.question}</i></div>
    </div>
  );
}
