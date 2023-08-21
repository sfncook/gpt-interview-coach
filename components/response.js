import { useState, useEffect } from "react";
import styles from "../pages/index.module.css";

export default function Response({ rating, strengths, weaknesses, example }) {

  const ratingEl = (rating) ? (<div><div>Rating</div><div>{rating}/10</div></div>) : <span/>

  let strenthsEl = <span/>
  if(strengths && strengths.length) {
    const items = strengths.map(strength => <li key={strength}>{strength}</li>)
    strenthsEl = (<div>
        <div>Strengths</div>
        <ul>{items}</ul>
      </div>)
  }

  let weakEl = <span/>
  if(weaknesses && weaknesses.length) {
    const items = weaknesses.map(i => <li key={i}>{i}</li>)
    weakEl = (<div>
        <div>Weaknesses</div>
        <ul>{items}</ul>
      </div>)
  }

  const exampleEl = (example) ? (<div><div>Example</div><div>{example}</div></div>) : <span/>

  return (<div className={styles.response}>
    <div>{ratingEl}</div>
    <div>{strenthsEl}</div>
    <div>{weakEl}</div>
    <div>{exampleEl}</div>
  </div>);
}
