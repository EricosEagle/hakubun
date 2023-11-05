import { useNavigate } from "react-router-dom";
import { setBtnBackground } from "../../services/ImageSrcService";
import { displayToast } from "../Toast/Toast.service";
import { useAssignmentsAvailForReview } from "../../hooks/useAssignmentsAvailForReview";
import {
  BaseReviewLessonButton,
  BaseReviewLessonButtonBadge,
  BaseReviewLessonButtonSkeleton,
} from "../../styles/SubjectButtonsStyled";
import styled from "styled-components";

const ReviewsButtonStyled = styled(BaseReviewLessonButton)`
  background-color: var(--wanikani-review);
  &:focus-visible {
    outline: 2px solid white;
    --outline: 2px solid white;
  }
`;

const ReviewsButtonSkeleton = styled(BaseReviewLessonButtonSkeleton)`
  --background: var(--wanikani-blue-rgba);
  --background-rgb: var(--wanikani-blue-rgb);
`;

type Props = {
  level: number;
};

function ReviewsButton({ level }: Props) {
  const navigate = useNavigate();

  const {
    isLoading: availForReviewLoading,
    data: availForReviewData,
    error: availForReviewErr,
  } = useAssignmentsAvailForReview(level);

  const onReviewBtnClick = () => {
    if (availForReviewData === undefined || availForReviewData.length === 0) {
      displayToast({
        title: "No reviews available!",
        content:
          "Looks like you don't have any reviews right now, come back later!",
        toastType: "error",
        timeout: 10000,
      });
    } else {
      navigate("/reviews/settings");
    }
  };

  if (availForReviewLoading || availForReviewErr) {
    return <ReviewsButtonSkeleton animated={true}></ReviewsButtonSkeleton>;
  }

  // TODO: delay loading until image is set
  return (
    <>
      <ReviewsButtonStyled
        aria-label="Reviews"
        onPress={onReviewBtnClick}
        style={{
          backgroundImage: `url(${setBtnBackground({
            btnType: "reviews",
            numItems: availForReviewData ? availForReviewData.length : 0,
          })})`,
        }}
      >
        <p>Reviews</p>
        <BaseReviewLessonButtonBadge>
          {availForReviewData ? availForReviewData.length : 0}
        </BaseReviewLessonButtonBadge>
      </ReviewsButtonStyled>
    </>
  );
}

export default ReviewsButton;
