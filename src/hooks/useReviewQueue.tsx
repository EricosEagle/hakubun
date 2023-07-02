import { useReviewSessionQueue } from "../contexts/ReviewSessionQueueContext";
import {
  useReviewSessionData,
  updateReviewQueueItem,
  addToReviewQueue,
  createReviewItems,
} from "../contexts/ReviewSessionDataContext";
import { playAudioIfAvailable } from "../services/MiscService";
import { ReviewQueueItem } from "../types/ReviewSessionTypes";
import {
  isUserAnswerCorrect,
  isUserAnswerValid,
} from "../services/SubjectAndAssignmentService";
import { useEffect } from "react";
import { checkIfReviewIsComplete } from "../services/ReviewService";
import { Assignment } from "../types/Assignment";

// TODO: add wrap up functionality
export const useReviewQueue = () => {
  const { queueDataState, dispatchQueueDataContext } = useReviewSessionData();
  const { queueState, dispatchQueueContext } = useReviewSessionQueue();
  // *testing
  useEffect(() => {
    console.log(
      "🚀 ~ file: useReviewQueue.tsx:16 ~ useReviewQueue ~ queueDataState.reviewQueue:",
      queueDataState.reviewQueue
    );
  }, [queueDataState.reviewQueue]);
  // *testing

  const createNewReviewSession = (
    assignments: Assignment[],
    subjIDs: number[]
  ) => {
    // ending the current review (if it exists)
    dispatchQueueDataContext({
      type: "END_REVIEW",
    });
    createReviewItems(assignments, subjIDs, dispatchQueueDataContext);
    resetCurrReviewCardIndex();
  };

  const resetCurrReviewCardIndex = () => {
    dispatchQueueContext({
      type: "RESET_REVIEW_CARD_INDEX",
    });
  };

  // TODO: update to display actual SRS status
  // TODO: change to use more specific types that display up or down arrows based on correct/incorrect
  const displaySRSStatus = (answerWasCorrect: boolean) => {
    let popoverToDispatch = answerWasCorrect
      ? {
          type: "SHOW_POPOVER_MSG" as const,
          payload: {
            message: "FAKE INCREASING SRS LEVEL...",
            messageType: "correct",
          },
        }
      : {
          type: "SHOW_POPOVER_MSG" as const,
          payload: {
            message: "FAKE DECREASING SRS LEVEL...",
            messageType: "incorrect",
          },
        };

    dispatchQueueContext(popoverToDispatch);
  };

  const correctFirstClick = (currReviewItem: ReviewQueueItem) => {
    let reviewItemComplete = checkIfReviewIsComplete(
      currReviewItem,
      queueDataState.reviewQueue
    );
    // *testing
    console.log(
      "🚀 ~ file: useReviewQueue.tsx:40 ~ correctFirstClick ~ reviewItemComplete:",
      reviewItemComplete
    );
    // *testing

    playAudioIfAvailable(
      currReviewItem.primary_audio_url,
      currReviewItem.review_type
    );

    let updatedReviewItem = currReviewItem;
    dispatchQueueContext({
      type: "SHOW_POPOVER_MSG",
      payload: { message: "CORRECT!", messageType: "correct" },
    });
    dispatchQueueContext({ type: "CORRECT_SHOW_RESULT" });

    let wasWrongFirstAttempt = updatedReviewItem.is_reviewed;
    if (wasWrongFirstAttempt) {
      // keeping answer as incorrect and is_reviewed as true
      // TODO: make sure this actually updates
      updatedReviewItem.is_reviewed = true;

      // TODO: get review item's current SRS level, update item's SRS level
      if (reviewItemComplete) {
        displaySRSStatus(false);
      }

      updateReviewQueueItem(
        updatedReviewItem,
        queueDataState,
        dispatchQueueDataContext
      );
    }
    // user got answer correct first try
    else {
      if (reviewItemComplete) {
        displaySRSStatus(true);
      }
      // TODO: make sure this actually updates
      updatedReviewItem.is_correct_answer = true;
      updatedReviewItem.is_reviewed = true;
      updateReviewQueueItem(
        updatedReviewItem,
        queueDataState,
        dispatchQueueDataContext
      );
    }
  };

  const handleCorrectAnswer = (
    currReviewItem: ReviewQueueItem,
    setUserAnswer: (value: React.SetStateAction<string>) => void,
    moveToNextItem: boolean
  ) => {
    if (moveToNextItem) {
      dispatchQueueContext({ type: "CORRECT_MOVE_TO_NEXT" });
      setUserAnswer("");
    } else {
      correctFirstClick(currReviewItem);
    }
  };

  const handleWrongAnswer = (
    currReviewItem: ReviewQueueItem,
    setUserAnswer: (value: React.SetStateAction<string>) => void,
    moveToNextItem: boolean
  ) => {
    let updatedReviewItem = currReviewItem;

    if (moveToNextItem) {
      addToReviewQueue(
        updatedReviewItem,
        queueDataState,
        dispatchQueueDataContext
      );
      dispatchQueueContext({ type: "WRONG_MOVE_TO_NEXT" });
      setUserAnswer("");
    } else {
      dispatchQueueContext({ type: "WRONG_SHOW_RESULT" });
      dispatchQueueContext({
        type: "SHOW_POPOVER_MSG",
        payload: { message: "SRRY, WRONG :(", messageType: "incorrect" },
      });
      updatedReviewItem.is_correct_answer = false;
      updatedReviewItem.is_reviewed = true;

      updateReviewQueueItem(
        updatedReviewItem,
        queueDataState,
        dispatchQueueDataContext
      );
    }
  };

  const handleNextClick = (
    currReviewItem: ReviewQueueItem,
    userAnswer: string,
    setUserAnswer: (value: React.SetStateAction<string>) => void
  ) => {
    let isValidInfo = isUserAnswerValid(currReviewItem, userAnswer);
    if (isValidInfo.isValid === false) {
      dispatchQueueContext({
        type: "SHOW_POPOVER_MSG",
        payload: { message: isValidInfo.message, messageType: "invalid" },
      });
      return;
    }
    // *testing
    console.log(
      "🚀 ~ file: ReviewSession.tsx:137 ~ ReviewSession ~ userAnswer:",
      userAnswer
    );
    // *testing
    let isCorrectAnswer = isUserAnswerCorrect(currReviewItem, userAnswer);
    // *testing
    console.log(
      "🚀 ~ file: ReviewCard.tsx:141 ~ isCorrectAnswer:",
      isCorrectAnswer
    );
    // *testing

    let moveToNextItem = queueState.isSecondClick;
    isCorrectAnswer
      ? handleCorrectAnswer(currReviewItem, setUserAnswer, moveToNextItem)
      : handleWrongAnswer(currReviewItem, setUserAnswer, moveToNextItem);

    dispatchQueueContext({ type: "SUBMIT_CHOICE" });
  };

  const handleRetryClick = (
    currReviewItem: ReviewQueueItem,
    setUserAnswer: (value: React.SetStateAction<string>) => void
  ) => {
    let updatedReviewItem = currReviewItem;
    updatedReviewItem.is_correct_answer = null;
    updatedReviewItem.is_reviewed = false;

    updateReviewQueueItem(
      updatedReviewItem,
      queueDataState,
      dispatchQueueDataContext
    );
    setUserAnswer("");
    dispatchQueueContext({ type: "RETRY_REVIEW" });
  };

  return {
    queueDataState,
    queueState,
    resetCurrReviewCardIndex,
    handleNextClick,
    handleRetryClick,
    createNewReviewSession,
  };
};
