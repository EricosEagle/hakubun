import ImageFallback from "../ImageFallback";
import {
  BtnWithTxt,
  BtnWithImage,
  SubjBtnDetailsTxt,
  SubjInfoCol,
} from "./SubjectButtonsStyled";

import { Subject } from "../../types/Subject";
import { getSubjectDisplayName } from "../../services/SubjectAndAssignmentService";

// TODO: change to use size sm, md, lg?
type Props = {
  subject: Subject;
  isBigBtn: boolean;
  onBtnClick: (e: any) => void;
  showDetails: boolean;
};

// TODO: add more space b/t character and meaning
export const RadicalButton = ({
  subject,
  isBigBtn,
  showDetails,
  onBtnClick,
}: Props) => {
  return (
    <>
      {subject.useImage ? (
        <BtnWithImage
          title="Radical Subject"
          onClick={onBtnClick}
          bigBtn={isBigBtn}
        >
          <ImageFallback
            images={subject.availableImages}
            altText={subject.meaning_mnemonic}
          ></ImageFallback>
        </BtnWithImage>
      ) : (
        <BtnWithTxt
          title="Radical Subject"
          onClick={onBtnClick}
          bigBtn={isBigBtn}
          subjType="radical"
        >
          <SubjInfoCol>
            <p>{subject.characters}</p>
            {showDetails && (
              <div>
                <SubjBtnDetailsTxt>
                  {getSubjectDisplayName(subject)}
                </SubjBtnDetailsTxt>
              </div>
            )}
          </SubjInfoCol>
        </BtnWithTxt>
      )}
    </>
  );
};