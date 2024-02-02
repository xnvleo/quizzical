import React from "react";
import { useState, useEffect } from "react";
import { decode } from "html-entities";
import { nanoid } from "nanoid";
import { Link } from "react-router-dom";

const Quiz = () => {
  const [questionData, setQuestionData] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // get the data from api
  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=5")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Can't get data back from api`);
        }
        return res.json();
      })

      .then((data) => {
        setQuestionData(() => {
          return data.results.map((item) => {
            const id = nanoid();
            const shuffledAnswer = shuffleArray([
              ...item.incorrect_answers,
              item.correct_answer,
            ]);
            const correctAnswer = decode(item.correct_answer);
            const answerObj = shuffledAnswer.map((item, index) => {
              return {
                option: item,
                optionID: id + index,
                isCorrect: item === correctAnswer ? true : false,
                isSelected: false,
              };
            });

            return {
              id: id,
              question: decode(item.question),
              answers: answerObj,
            };
          });
        });
        setLoading(false);
      })

      .catch((error) => {
        console.log("There is an error fetching the data", error);
        setError(true);
        setLoading(false);
      });
  }, []);

  //in case the the api doen't work
  if (loading) {
    return <h2 className="loading-error">Loading...</h2>;
  }
  if (error) {
    return (
      <h2 className="loading-error">
        Something went wrong when trying to get the data
      </h2>
    );
  }

  // shuffle all the answers
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return (array = array.map((item) => decode(item)));
  }

  function handleSelect(questionId, answerOptionId, answerIsCorrect) {
    //replace the previous answer if user select another one within the same question
    //so only one option can be selected for each question
    setSelectedAnswer((prevSelectedAnswer) => {
      const updatedSelectedAnswer = prevSelectedAnswer.map((prevAnswer) => {
        if (prevAnswer.questionId === questionId) {
          return { questionId, answerOptionId, answerIsCorrect };
        }
        return prevAnswer;
      });
      const existingAnswer = prevSelectedAnswer.find(
        (prevAnswer) => prevAnswer.questionId === questionId
      );
      if (!existingAnswer) {
        updatedSelectedAnswer.push({
          questionId,
          answerOptionId,
          answerIsCorrect,
        });
      }
      return updatedSelectedAnswer;
    });

    // the selected button's background color will stay light blue.
    const updatedQuestionData = questionData.map((question) => {
      if (question.id === questionId) {
        const updatedAnswers = question.answers.map((answer) => {
          if (answer.optionID === answerOptionId) {
            return { ...answer, isSelected: true };
          }
          return { ...answer, isSelected: false };
        });
        return { ...question, answers: updatedAnswers };
      }
      return question;
    });
    setQuestionData(updatedQuestionData);
  }

  function handleSubmit() {
    const totalScore = selectedAnswer.reduce((acc, answer) => {
      return acc + (answer.answerIsCorrect ? 1 : 0);
    }, 0);
    setScore(totalScore);

    // give each option an background color base on the correctness
    const updatedQuestionData = questionData.map((question) => {
      const updatedAnswers = question.answers.map((answer) => {
        if (answer.isSelected) {
          if (answer.isCorrect) {
            return { ...answer, backgroundColor: "#94D7A2" };
          } else {
            return { ...answer, backgroundColor: "#F8BCBC" };
          }
        } else if (answer.isCorrect) {
          return { ...answer, backgroundColor: "#94D7A2" };
        }
        return answer;
      });
      return { ...question, answers: updatedAnswers };
    });
    setQuestionData(updatedQuestionData);
    //hide the submit button, show the score
    setShow(false);
  }

  // render each quiz card with questions and answers
  const quizCard = questionData.map((item) => {
    const answerDivs = item.answers.map((answer) => {
      const styles = {};
      if (answer.isSelected) {
        // to make sure the selected wrong answer to have light red background
        styles.backgroundColor = answer.backgroundColor || "#d6dbf5";
      } else if (answer.backgroundColor) {
        styles.backgroundColor = answer.backgroundColor;
      }
      return (
        <button
          key={answer.optionID}
          className="btn btn-answer"
          style={styles}
          onClick={() =>
            handleSelect(item.id, answer.optionID, answer.isCorrect)
          }
        >
          {answer.option}
        </button>
      );
    });

    return (
      <div className="card" key={item.id}>
        <h2>{item.question}</h2>
        <section className="answer-list">{answerDivs}</section>
      </div>
    );
  });

  // render the quiz page
  return (
    <div className="container-quiz">
      {quizCard}
      {!show && (
        <div className="resultDiv">
          <h3>Your scored {score}/5 correct answers</h3>
          <Link to="/" className="btn btn-submit">
            play again
          </Link>
        </div>
      )}
      {show && (
        <button
          className="btn btn-submit"
          onClick={handleSubmit}
          disabled={selectedAnswer.length < 5 ? true : false}
        >
          Check answers
        </button>
      )}
    </div>
  );
};
export default Quiz;
