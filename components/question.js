import styles from "../pages/index.module.css";

export default function Question({question, isLastQuestion, onClickReload}) {

  function strToColor(str){
    let hash = 0;
    str.split('').forEach(char => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash)
    })
    let colour = '#'
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      colour += value.toString(16).padStart(2, '0')
    }
    return colour
  }

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
  let reloadEl = <span/>
  if(isLastQuestion) {
    reloadEl = <img src="/reload.png" className={styles.questionReload} onClick={onClickReload} />
  }

  const questionColor = (isLastQuestion) ? "black" : "#aaa"
  return (
    <div className={styles.question}>
      <div className={styles.questionTitle} style={{color:questionColor}}><b>Question #{question.index+1}</b>  {ratingEl} {reloadEl}</div>
      <div>{question.rating}</div>
      <div className={styles.questionStr} style={{color:questionColor}}><i>{question.question}</i></div>
      <div className={styles.questionCategory} style={{backgroundColor:strToColor(question.questionCategory)}}>{question.questionCategory}</div>
    </div>
  );
}
