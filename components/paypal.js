import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "../pages/index.module.css";

export default function Paypal({ manyQuestions }) {
  const [showVenmo, setShowVenmo] = useState(false);

  async function onMouseOverPayment(event) {
    event.preventDefault();
    setShowVenmo(true)
  }

  async function onMouseOutPayment(event) {
    event.preventDefault();
    setShowVenmo(false)
  }

  const manyQuestionsStr = `Please consider donating $${manyQuestions*0.01} to my Venmo to help pay for the ChatGPT costs`

  const paymentEl = (manyQuestions>0) ? <div>
    <div className={styles.payment} onMouseOver={onMouseOverPayment} onMouseLeave={onMouseOutPayment}>{manyQuestionsStr}</div>
    <img src="/venmo.png" className={styles.venmo} hidden={!showVenmo} />
  </div> : <span/>

  return (<div>{paymentEl}</div>);
}
