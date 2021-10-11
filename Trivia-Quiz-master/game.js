const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const textForScore = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const game = document.getElementById("game");


let selectedQuestion = {};
let isAcceptingAnswers = false;
let currentGameScore = 0;
let questionCounter = 0;
let availableQuestions = [];

let listOfQuestions = [];

fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple")
  .then(res => {
    return res.json();
  })
  .then(loadedQuestions => {
    console.log(loadedQuestions.results);
    listOfQuestions = loadedQuestions.results.map( loadedQuestion => {
      const formattedQuestion = {
        question: loadedQuestion.question
      };

      const answerChoices = [...loadedQuestion.incorrect_answers];
      formattedQuestion.answer = Math.floor(Math.random()*3) + 1;
      answerChoices.splice(formattedQuestion.answer - 1, 0, loadedQuestion.correct_answer);

      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      })

      return formattedQuestion;
    });
    startGame();
  })
  .catch(err => {
    console.error(err);
  });

// CONSTANTS
const CORRECT_BONUS = 10;
const MAX_QUESITONS = 3;

startGame = () => {
    questionCounter = 0;
    currentGameScore = 0;
    availableQuestions = [...listOfQuestions];
    getNewQuestion();
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

getNewQuestion = () => {

    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESITONS){
      localStorage.setItem('mostRecentScore', currentGameScore);
      return(window.location.assign('end.html'));
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESITONS}`;

    progressBarFull.style.width = `${(questionCounter / MAX_QUESITONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    selectedQuestion = availableQuestions[questionIndex];
    question.innerText = selectedQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset["number"];
        choice.innerText = selectedQuestion["choice" + number];
    });

    availableQuestions.splice(questionIndex, 1);

    isAcceptingAnswers = true;
};

  choices.forEach(choice => {
  choice.addEventListener('click', e => {
    if (!isAcceptingAnswers) return;

    isAcceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset['number'];

    const classToApply = selectedAnswer == selectedQuestion.answer ? 'correct' : 'incorrect';

    if (classToApply == 'correct'){
      addScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);

     setTimeout( () => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);

  });
});

addScore = num => {
  currentGameScore += num;
  textForScore.innerText = currentGameScore;
};
