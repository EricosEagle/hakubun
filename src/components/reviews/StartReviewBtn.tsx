import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import startIcon from "../../images/start.svg";
import { ShiftBy } from "../ShiftBy";

type Props = {
  onStartReviewBtnClick: () => void;
};

// while icon is *technically* centered already, doesn't appear to be since it's an arrow, so using ShiftBy component to slightly adjust
// see this as reference: https://www.joshwcomeau.com/css/pixel-perfection/#going-the-extra-mile-3
export const StartReviewBtn = ({ onStartReviewBtnClick }: Props) => {
  return (
    <>
      <IonFab vertical="bottom" horizontal="center" aria-label="Start Review">
        <IonFabButton onClick={onStartReviewBtnClick}>
          <ShiftBy x={4}>
            <IonIcon icon={startIcon}></IonIcon>
          </ShiftBy>
        </IonFabButton>
      </IonFab>
    </>
  );
};