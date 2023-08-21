import styles from "./index.module.css";

export default function Question({index, question}) {

  return (
    <div className={styles.question}>
      <div><b>Question #{index}.</b></div>
      <div>{question.rating}</div>
      <div className={styles.questionStr}><i>{question.question}</i></div>
    </div>
  );
}
