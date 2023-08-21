import styles from "./index.module.css";

export default function Question({question}) {


  let ratingEl = <span/>
  if(question.evaluation && question.evaluation.rating) {
    let color = 'blue'
    switch (parseInt(question.evaluation.rating)) {
      case 0:
      case 1:
      case 2:
        color = 'pink';
        break;
      case 3:
      case 4:
      case 5:
      case 6:
        color = 'orange';
        break;
      case 7:
      case 8:
      case 9:
      default:
        color = 'lightgreen';
    }
    ratingEl = <div style={{backgroundColor:color}}>{question.evaluation.rating}/10</div>
  }
  return (
    <div className={styles.question}>
      <div className={styles.questionTitle}><b>Question #{question.index+1}</b>  {ratingEl}</div>
      <div>{question.rating}</div>
      <div className={styles.questionStr}><i>{question.question}</i></div>
    </div>
  );
}
