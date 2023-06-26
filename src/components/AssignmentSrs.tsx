import {
  SubjSummaryCol,
  SubjSummaryRow,
} from "./subject-details/SubjectDetailsStyled";

import styles from "./AssignmentSrs.module.scss";
import styled from "styled-components/macro";

import {
  getTimeFromNow,
  getSrsNameBySrsLvl,
  capitalizeWord,
} from "../services/MiscService";

import { Assignment } from "../types/Assignment";

const AssignmentSrsContainer = styled(SubjSummaryCol)`
  justify-content: flex-end;
  padding: 5px 0;
  flex: 0 0 40%;

  p {
    margin: 5px 0;
  }
`;

const StagesRow = styled(SubjSummaryRow)`
  justify-content: flex-end;
  gap: 10px;
`;

type Props = {
  assignment: Assignment | undefined;
};

export const AssignmentSrs = ({ assignment }: Props) => {
  const getTimeTill = () => {
    let availTime = assignment!.available_at;
    return getTimeFromNow(availTime);
  };

  const getSrsLvl = () => {
    if (assignment) {
      return getSrsNameBySrsLvl(assignment.srs_stage);
    }
    // TODO: display locked icon instead
    return "locked";
  };

  return (
    <AssignmentSrsContainer>
      <StagesRow>
        {assignment && <p className={`${styles.timeTill}`}>{getTimeTill()}</p>}
        <p className={`${styles.srsLevel} ${styles[getSrsLvl()]}`}>
          {capitalizeWord(getSrsLvl())}
        </p>
      </StagesRow>
    </AssignmentSrsContainer>
  );
};
